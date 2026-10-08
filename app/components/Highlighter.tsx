"use client";

import { useEffect, useRef } from "react";

// The canvas renders at a fraction of CSS pixels: ink is soft anyway, and the
// bitmap costs a quarter of the memory.
const SCALE = 0.5;

// Highlighter: a chisel tip this long, leaning 45deg like a real marker.
const MARKER = 30;
const MARKER_YELLOW = "#fdff32"; // neon lime-yellow, like a Schneider Job pen

/**
 * A highlighter laid over the page. Holding the pointer draws neon-yellow ink
 * on a canvas above the content; "Clear highlights" wipes it.
 */
export function Highlighter({ children }: { children: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const penRef = useRef<HTMLDivElement>(null);
  const clearInkRef = useRef<() => void>(() => {});

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const pen = penRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !pen || !ctx) return;

    let w = 0;
    let h = 0;
    let travelled = 0;
    let down = false;
    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;

    // Chisel tip swept from one point to the next: the hull of two tip segments.
    const highlight = (fromX: number, fromY: number, toX: number, toY: number) => {
      const dx = (Math.SQRT1_2 * MARKER) / 2;
      const dy = -dx;
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

    const resize = () => {
      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d")?.drawImage(canvas, 0, 0);

      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * SCALE);
      canvas.height = Math.round(h * SCALE);
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      ctx.drawImage(snapshot, 0, 0, w, h);
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
    };

    const onMove = (e: PointerEvent) => {
      movePen(e);
      if (!down) return;
      travelled += Math.hypot(e.clientX - x, e.clientY - y);
      x = e.clientX;
      y = e.clientY;
      highlight(lastX, lastY, x, y);
      lastX = x;
      lastY = y;
    };

    const onUp = (e: PointerEvent) => {
      down = false;
      if (stage.hasPointerCapture(e.pointerId)) {
        stage.releasePointerCapture(e.pointerId);
      }
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
    clearInkRef.current = () => ctx.clearRect(0, 0, w, h);

    window.addEventListener("resize", resize);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("click", onClickCapture, true);
    stage.addEventListener("dragstart", onDragStart);

    return () => {
      window.removeEventListener("resize", resize);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
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

      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      />

      <button
        type="button"
        data-no-ink
        onClick={() => clearInkRef.current()}
        style={{ "--ink": MARKER_YELLOW } as React.CSSProperties}
        className="absolute bottom-16 right-4 rounded-full border border-white/25 bg-black/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
      >
        Clear highlights
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
