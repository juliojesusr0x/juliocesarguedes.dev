"use client";

import { useEffect, useRef } from "react";

// The canvas renders at a fraction of CSS pixels: ink is soft anyway, and the
// bitmap costs a quarter of the memory.
const SCALE = 0.5;

// A project card the marker is over lights up and opens on release.
const PROJECT_LINK = ".sticker a[href]";

// The ink is two canvases stacked over the content, one stroke drawn on both.
// "difference" with white inverts what is under the stroke (dark page -> light,
// white text -> black); "multiply" then tints the light parts neon yellow and
// leaves the dark ones dark. Net effect: yellow marker, black text.
const INK_LAYERS = [
  { blend: "mix-blend-difference", color: "#ffffff" },
  { blend: "mix-blend-multiply", color: "#fdff32" },
] as const;

// Highlighter: a chisel tip this long, leaning 45deg like a real marker.
const MARKER = 30;
const MARKER_YELLOW = INK_LAYERS[1].color; // neon lime-yellow, like a Schneider Job pen

/**
 * A highlighter laid over the page. Holding the pointer draws neon-yellow ink
 * on a canvas above the content; "Clear highlights" wipes it. Inking over a
 * project card lights it up, and lifting the pen there opens it.
 */
export function Highlighter({ children }: { children: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const penRef = useRef<HTMLDivElement>(null);
  const clearInkRef = useRef<() => void>(() => {});

  useEffect(() => {
    const stage = stageRef.current;
    const pen = penRef.current;
    const layers = INK_LAYERS.flatMap(({ color }, i) => {
      const canvas = canvasRefs.current[i];
      const ctx = canvas?.getContext("2d");
      return canvas && ctx ? [{ canvas, ctx, color }] : [];
    });
    if (!stage || !pen || layers.length !== INK_LAYERS.length) return;

    let w = 0;
    let h = 0;
    let travelled = 0;
    let down = false;
    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;
    let hot: HTMLAnchorElement | null = null;

    const projectAt = (px: number, py: number) =>
      document.elementFromPoint(px, py)?.closest<HTMLAnchorElement>(PROJECT_LINK) ?? null;

    const setHot = (link: HTMLAnchorElement | null) => {
      if (link === hot) return;
      hot?.closest(".sticker")?.removeAttribute("data-inked");
      link?.closest(".sticker")?.setAttribute("data-inked", "");
      hot = link;
    };

    // Chisel tip swept from one point to the next: the hull of two tip segments.
    const highlight = (fromX: number, fromY: number, toX: number, toY: number) => {
      const dx = (Math.SQRT1_2 * MARKER) / 2;
      const dy = -dx;
      for (const { ctx, color } of layers) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
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
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      for (const { canvas, ctx } of layers) {
        const snapshot = document.createElement("canvas");
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        snapshot.getContext("2d")?.drawImage(canvas, 0, 0);

        canvas.width = Math.round(w * SCALE);
        canvas.height = Math.round(h * SCALE);
        ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        ctx.drawImage(snapshot, 0, 0, w, h);
      }
    };

    const movePen = (e: PointerEvent) => {
      pen.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) rotate(45deg)`;
      pen.style.opacity = e.pointerType === "touch" ? "0" : "1";
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
      // Stage controls (clear button) are buttons, not page: never draw or capture on them.
      if ((e.target as Element).closest("[data-no-ink]")) return;
      down = true;
      x = lastX = e.clientX;
      y = lastY = e.clientY;
      capture(e);
      movePen(e);
      highlight(x, y, x, y);
      setHot(projectAt(x, y));
    };

    const onMove = (e: PointerEvent) => {
      movePen(e);
      if (!down) return;
      travelled += Math.hypot(e.clientX - x, e.clientY - y);
      x = e.clientX;
      y = e.clientY;
      highlight(lastX, lastY, x, y);
      setHot(projectAt(x, y));
      lastX = x;
      lastY = y;
    };

    const endStroke = (e: PointerEvent) => {
      down = false;
      setHot(null);
      if (stage.hasPointerCapture(e.pointerId)) {
        stage.releasePointerCapture(e.pointerId);
      }
    };

    // Lifting the pen over a project opens it: a synthetic click has detail 0,
    // so the stroke guard below lets it through.
    const onUp = (e: PointerEvent) => {
      const link = down && travelled > 6 ? hot : null;
      endStroke(e);
      link?.click();
    };

    // A press that travelled is a stroke, not a click: drawing over a card must not open it.
    const onClickCapture = (e: MouseEvent) => {
      if (e.detail === 0) return;
      if (travelled > 6 && (e.target as Element).closest("a, button")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onDragStart = (e: Event) => e.preventDefault();

    const onLeave = () => {
      pen.style.opacity = "0";
    };

    resize();
    clearInkRef.current = () => layers.forEach(({ ctx }) => ctx.clearRect(0, 0, w, h));

    window.addEventListener("resize", resize);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", endStroke);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("click", onClickCapture, true);
    stage.addEventListener("dragstart", onDragStart);

    return () => {
      window.removeEventListener("resize", resize);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", endStroke);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("click", onClickCapture, true);
      stage.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="fixed inset-0 touch-none select-none overflow-hidden bg-background"
    >
      {children}

      {INK_LAYERS.map(({ blend }, i) => (
        <canvas
          key={blend}
          ref={(el) => {
            canvasRefs.current[i] = el;
          }}
          aria-hidden
          className={`pointer-events-none absolute inset-0 h-full w-full ${blend}`}
        />
      ))}

      <button
        type="button"
        data-no-ink
        aria-label="Clear highlights"
        title="Clear highlights"
        onClick={() => clearInkRef.current()}
        style={{ "--ink": MARKER_YELLOW } as React.CSSProperties}
        className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full border border-[var(--ink)]/60 bg-black/80 text-[var(--ink)] backdrop-blur transition-colors hover:bg-[var(--ink)] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] sm:size-12"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      </button>

      <div
        ref={penRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[30px] w-[6px] rounded-[1px] opacity-0 transition-opacity duration-200"
        style={{ backgroundColor: MARKER_YELLOW }}
      />
    </div>
  );
}
