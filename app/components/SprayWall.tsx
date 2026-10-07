"use client";

import { useEffect, useRef, useState } from "react";

const PAPER = "#f2efe8";
const TAU = Math.PI * 2;
// The wall renders at a fraction of CSS pixels: spray is soft anyway, and the
// bitmap costs a quarter of the memory.
const SCALE = 0.5;

// Highlighter: a chisel tip this long, leaning 45deg like a real marker.
const MARKER = 30;
const MARKER_YELLOW = "#fdff32"; // neon lime-yellow, like a Schneider Job pen

const CONFETTI = Array.from({ length: 40 }, (_, i) => {
  // Deterministic spread: render must stay pure, so no Math.random here.
  const n = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  return {
    left: `${(i * 2.5 + n * 6) % 100}%`,
    drift: `${(n - 0.5) * 240}px`,
    spin: `${(n - 0.5) * 900}deg`,
    delay: `${(i % 8) * 0.12}s`,
    duration: `${2.4 + n * 1.6}s`,
    color: ["bg-secondary", "bg-white", "bg-neutral-400"][i % 3],
  };
});

type Drip = { x: number; y: number; speed: number; width: number; left: number };

/**
 * A blank wall laid over the real page. Holding the pointer sprays paint
 * (erases the wall) so the page underneath shows through only where you painted.
 * Children stay in the DOM, so they remain readable by assistive tech.
 */
export function SprayWall({ children }: { children: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [stats, setStats] = useState({ found: 0, total: 0 });
  const [marker, setMarker] = useState(false);
  const markerRef = useRef<() => void>(() => {});
  const clearInkRef = useRef<() => void>(() => {});

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ring = ringRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!stage || !canvas || !ring || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let w = 0;
    let h = 0;
    let brush: HTMLCanvasElement | null = null;
    let running = false;
    let marker = false;
    let travelled = 0;
    let down = false;
    let hiddenAtDown = false;
    let painted = false;
    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;
    let idleSince = 0;
    let frame = 0;
    let lastCheck = 0;
    // Bounding box of paint laid since the last find-check.
    const dirty = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const markDirty = (px: number, py: number, reach: number) => {
      dirty.x0 = Math.min(dirty.x0, px - reach);
      dirty.y0 = Math.min(dirty.y0, py - reach);
      dirty.x1 = Math.max(dirty.x1, px + reach);
      dirty.y1 = Math.max(dirty.y1, py + reach);
    };
    const finds = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-find]"),
    );
    const drips: Drip[] = [];

    const radius = () => Math.max(44, Math.min(w, h) * 0.075);

    const paintWall = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 800; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.035})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
      }
    };

    const syncRing = () => {
      const size = radius() * 2;
      ring.style.width = marker ? "6px" : `${size}px`;
      ring.style.height = marker ? `${MARKER}px` : `${size}px`;
    };

    // Chisel tip swept from one point to the next: the hull of two tip segments.
    const highlight = (fromX: number, fromY: number, toX: number, toY: number) => {
      const dx = (Math.SQRT1_2 * MARKER) / 2;
      const dy = -dx;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = MARKER_YELLOW;
      ctx.strokeStyle = MARKER_YELLOW;
      ctx.lineWidth = 3; // keeps a stroke along the tip's own direction from collapsing
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(fromX + dx, fromY + dy);
      ctx.lineTo(fromX - dx, fromY - dy);
      ctx.lineTo(toX - dx, toY - dy);
      ctx.lineTo(toX + dx, toY + dy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // One soft round brush, drawn once; each stamp is then a single drawImage.
    const buildBrush = () => {
      const r = radius();
      const size = Math.round(r * 2 * SCALE);
      const b = document.createElement("canvas");
      b.width = b.height = size;
      const bctx = b.getContext("2d");
      if (!bctx) return;
      const g = bctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.45, "rgba(0,0,0,0.8)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      bctx.fillStyle = g;
      bctx.fillRect(0, 0, size, size);
      brush = b;
    };

    const resize = () => {
      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      if (painted) snapshot.getContext("2d")?.drawImage(canvas, 0, 0);

      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * SCALE);
      canvas.height = Math.round(h * SCALE);
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      buildBrush();

      if (painted) {
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(snapshot, 0, 0, w, h);
      } else {
        paintWall();
        painted = true;
      }
      syncRing();
    };

    const stamp = (px: number, py: number, strength: number) => {
      const r = radius();
      markDirty(px, py, r * 1.5);
      ctx.globalCompositeOperation = "destination-out";
      if (brush) {
        ctx.globalAlpha = strength;
        ctx.drawImage(brush, px - r, py - r, r * 2, r * 2);
        ctx.globalAlpha = 1;
      }

      // Mist: stray droplets thrown past the soft edge, like a real can.
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * TAU;
        const d = r * Math.sqrt(Math.random()) * 1.45;
        ctx.beginPath();
        ctx.arc(
          px + Math.cos(a) * d,
          py + Math.sin(a) * d,
          0.5 + Math.random() * 1.8,
          0,
          TAU,
        );
        ctx.fill();
      }
    };

    const stroke = (fromX: number, fromY: number, toX: number, toY: number) => {
      const step = radius() * 0.2;
      const dist = Math.hypot(toX - fromX, toY - fromY);
      const n = Math.max(1, Math.ceil(dist / step));
      for (let i = 1; i <= n; i++) {
        stamp(
          fromX + ((toX - fromX) * i) / n,
          fromY + ((toY - fromY) * i) / n,
          0.5,
        );
      }
    };

    const stepDrips = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "#000";
      for (let i = drips.length - 1; i >= 0; i--) {
        const d = drips[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.width, 0, TAU);
        ctx.fill();
        markDirty(d.x, d.y, d.width + 2);
        d.y += d.speed;
        d.left -= d.speed;
        d.width = Math.max(1.2, d.width * 0.997);
        if (d.left <= 0 || d.y > h) drips.splice(i, 1);
      }
    };

    const tick = () => {
      const now = performance.now();
      if (now - lastCheck > 180) {
        lastCheck = now;
        checkFinds();
      }
      if (down && !marker) {
        stamp(x, y, 0.18);
        if (!reduceMotion && performance.now() - idleSince > 250) {
          if (Math.random() < 0.04 && drips.length < 6) {
            const r = radius();
            drips.push({
              x: x + (Math.random() - 0.5) * r * 0.9,
              y: y + r * 0.45,
              speed: 0.6 + Math.random() * 1.2,
              width: 2 + Math.random() * 2.5,
              left: 40 + Math.random() * 160,
            });
          }
        }
      }
      stepDrips();
      // Idle wall costs nothing: the loop only lives while spraying or dripping.
      if (down || drips.length > 0) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const alphaAt = (px: number, py: number) =>
      ctx.getImageData(Math.floor(px * SCALE), Math.floor(py * SCALE), 1, 1).data[3];

    // A piece counts as found the moment fresh paint clears a point on it.
    // Only the freshly painted area is sampled, on a pixel grid tighter than the
    // brush is wide, so even a thin stroke across a piece cannot slip between probes.
    const PROBE_STEP = 14;
    // elementFromPoint skips the wall (pointer-events: none), so it tells which
    // piece really sits under a point: a rotated strip's bounding box does not.
    const cleared = (
      el: HTMLElement,
      left: number,
      top: number,
      right: number,
      bottom: number,
    ) => {
      for (let py = top; py <= bottom; py += PROBE_STEP) {
        for (let px = left; px <= right; px += PROBE_STEP) {
          if (alphaAt(px, py) < 150 && el.contains(document.elementFromPoint(px, py))) {
            return true;
          }
        }
      }
      return false;
    };
    const checkFinds = () => {
      if (dirty.x1 < dirty.x0) return;
      const { x0, y0, x1, y1 } = dirty;
      dirty.x0 = dirty.y0 = Infinity;
      dirty.x1 = dirty.y1 = -Infinity;
      let changed = false;
      for (const el of finds) {
        if (el.dataset.found) continue;
        const r = el.getBoundingClientRect();
        if (r.right < x0 || r.left > x1 || r.bottom < y0 || r.top > y1) continue;
        const hit = cleared(
          el,
          Math.max(r.left, x0, 0),
          Math.max(r.top, y0, 0),
          Math.min(r.right, x1, w - 1),
          Math.min(r.bottom, y1, h - 1),
        );
        if (hit) {
          el.dataset.found = "true";
          changed = true;
        }
      }
      if (changed) {
        setStats({
          found: finds.filter((el) => el.dataset.found).length,
          total: finds.length,
        });
      }
    };

    const moveRing = (e: PointerEvent) => {
      ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)${marker ? " rotate(45deg)" : ""}`;
      ring.style.opacity = e.pointerType === "touch" ? "0" : "1";
    };

    // Capturing the pointer redirects the click to the stage, which would swallow
    // clicks on links and buttons; a press that starts on one is left alone.
    const capture = (e: PointerEvent) => {
      if (!(e.target as Element).closest("a, button, input, textarea")) {
        stage.setPointerCapture(e.pointerId);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      // Reset first: every press, even on a control, starts a fresh click-or-drag judgement.
      travelled = 0;
      // Stage controls (clear button) are buttons, not wall: never paint or capture on them.
      if ((e.target as Element).closest("[data-no-spray]")) return;
      down = true;
      x = lastX = e.clientX;
      y = lastY = e.clientY;
      if (marker) {
        hiddenAtDown = false;
        capture(e);
        moveRing(e);
        highlight(x, y, x, y);
        return;
      }
      idleSince = performance.now();
      hiddenAtDown = alphaAt(x, y) > 128;
      capture(e);
      moveRing(e);
      stamp(x, y, 0.5);
      setStarted(true);
      checkFinds();
      wake();
    };

    const onMove = (e: PointerEvent) => {
      moveRing(e);
      if (!down) return;
      travelled += Math.hypot(e.clientX - x, e.clientY - y);
      x = e.clientX;
      y = e.clientY;
      if (marker) {
        highlight(lastX, lastY, x, y);
        lastX = x;
        lastY = y;
        return;
      }
      if (Math.hypot(x - lastX, y - lastY) > 3) idleSince = performance.now();
      stroke(lastX, lastY, x, y);
      lastX = x;
      lastY = y;
      checkFinds();
    };

    const onUp = (e: PointerEvent) => {
      down = false;
      checkFinds();
      if (stage.hasPointerCapture(e.pointerId)) {
        stage.releasePointerCapture(e.pointerId);
      }
    };

    // A link under unpainted wall must not open: you can't see it yet.
    const onClickCapture = (e: MouseEvent) => {
      if (e.detail === 0) return;
      const target = e.target as Element;
      // A press that travelled is a stroke, not a click: painting over a card must not open it.
      if (travelled > 6 && target.closest("a, button")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (marker) return;
      if (hiddenAtDown && target.closest("a, button")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Keyboard focus sprays around the focused control so it never stays hidden.
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (marker || !el.matches(":focus-visible")) return;
      const rect = el.getBoundingClientRect();
      for (let i = 0; i < 8; i++) {
        stamp(rect.left + rect.width / 2, rect.top + rect.height / 2, 0.6);
      }
      setStarted(true);
      checkFinds();
    };

    const onDragStart = (e: Event) => e.preventDefault();

    const onLeave = () => {
      ring.style.opacity = "0";
    };

    resize();
    // After the last find the wall is gone: the same canvas becomes the highlighter's page.
    clearInkRef.current = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
    };

    markerRef.current = () => {
      marker = true;
      drips.length = 0;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      syncRing();
      setMarker(true);
    };

    window.addEventListener("resize", resize);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("click", onClickCapture, true);
    stage.addEventListener("focusin", onFocusIn);
    stage.addEventListener("dragstart", onDragStart);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("click", onClickCapture, true);
      stage.removeEventListener("focusin", onFocusIn);
      stage.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  const done = stats.total > 0 && stats.found === stats.total;

  // Let the wall finish dissolving before the highlighter takes over its canvas.
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => markerRef.current(), 1600);
    return () => window.clearTimeout(timer);
  }, [done]);

  return (
    <div
      ref={stageRef}
      className="fixed inset-0 touch-none select-none overflow-hidden bg-background"
    >
      {children}

      <canvas
        ref={canvasRef}
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-[1500ms] ${
          marker ? "opacity-60" : done ? "opacity-0" : "opacity-100"
        }`}
      />

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-[#2a2a2e] transition-opacity duration-300 ${
          started ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="font-marker text-[clamp(2rem,7vw,5rem)] leading-none">
          hold &amp; spray
        </p>
        <p className="font-display text-xs uppercase tracking-[0.3em] text-[#2a2a2e]/60 sm:text-sm">
          <span className="[@media(pointer:coarse)]:hidden">
            hold the left mouse button and paint the wall
          </span>
          <span className="hidden [@media(pointer:coarse)]:inline">
            touch and drag to paint the wall
          </span>
        </p>
      </div>

      {done ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className={`confetti absolute -top-4 h-3 w-2 rounded-[2px] ${c.color}`}
              style={
                {
                  left: c.left,
                  "--drift": c.drift,
                  "--spin": c.spin,
                  animationDelay: c.delay,
                  animationDuration: c.duration,
                } as React.CSSProperties
              }
            />
          ))}
          <p className="celebrate absolute inset-x-0 top-1/2 text-center font-marker text-[clamp(2.4rem,9vw,6rem)] leading-none text-white [text-shadow:0_0_30px_rgba(255,122,26,0.8),0_4px_0_#ff7a1a]">
            you found it all!
          </p>
        </div>
      ) : null}

      <p
        aria-hidden
        className={`pointer-events-none absolute bottom-16 left-4 font-display text-sm font-semibold text-white mix-blend-difference transition-opacity duration-300 ${
          started ? "opacity-100" : "opacity-0"
        }`}
      >
        {done
          ? marker
            ? "all found ✦ grab the highlighter"
            : "all found ✦"
          : `${stats.found}/${stats.total || "?"} found`}
      </p>

      {marker ? (
        <button
          type="button"
          data-no-spray
          onClick={() => clearInkRef.current()}
          style={{ "--ink": MARKER_YELLOW } as React.CSSProperties}
          className="absolute bottom-16 right-4 rounded-full border border-white/25 bg-black/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
        >
          Clear highlights
        </button>
      ) : null}

      <div
        ref={ringRef}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity duration-200 ${
          marker
            ? "rounded-[1px]"
            : "rounded-full border border-secondary/60 mix-blend-difference"
        }`}
        style={marker ? { backgroundColor: MARKER_YELLOW } : undefined}
      />
    </div>
  );
}
