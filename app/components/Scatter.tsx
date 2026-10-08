"use client";

import { useEffect } from "react";
import { desktopLayouts, mobileLayouts, type Slot } from "./layouts";

const TRIES_PER_MODE = 24;
const GAP = 6;
const DIAGONAL = 35;

const pick = <T,>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)];

const shuffled = (n: number) => {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

const randomTilt = (min: number, max: number) =>
  `${(Math.random() < 0.5 ? -1 : 1) * (min + Math.random() * (max - min))}deg`;

/** The banner as an oriented rectangle: centre, length, thickness, angle (deg). */
type Strip = { cx: number; cy: number; len: number; thick: number; deg: number };

const MODES = ["bottom", "top", "left", "right", "diagonal"] as const;
type Mode = (typeof MODES)[number];

/**
 * Where the stack banner lies: along the bottom or top edge, down the left or
 * right edge, or as a ribbon cutting across one of the four corners.
 */
function dealStrip(mode: Mode, thick: number): Strip {
  const w = innerWidth;
  const h = innerHeight;
  const half = thick / 2;
  switch (mode) {
    case "bottom":
      return { cx: w / 2, cy: h - half, len: w, thick, deg: 0 };
    case "top":
      return { cx: w / 2, cy: half, len: w, thick, deg: 0 };
    case "left":
      return { cx: half, cy: h / 2, len: h, thick, deg: -90 };
    case "right":
      return { cx: w - half, cy: h / 2, len: h, thick, deg: 90 };
    case "diagonal": {
      const [fx, fy, deg] = pick([
        [0.9, 0.88, -DIAGONAL],
        [0.1, 0.12, -DIAGONAL],
        [0.1, 0.88, DIAGONAL],
        [0.9, 0.12, DIAGONAL],
      ] as const);
      const len = Math.min(w * 0.55, h * 0.6, 520);
      return { cx: w * fx, cy: h * fy, len, thick, deg };
    }
  }
}

type Inset = { l: number; t: number; r: number; b: number };

/** Room a straight strip takes from the screen edge; pieces are laid out in the rest. */
function insetFor(mode: Mode, thick: number): Inset {
  const room = thick + GAP * 2;
  return {
    l: mode === "left" ? room : 0,
    r: mode === "right" ? room : 0,
    t: mode === "top" ? room : 0,
    b: mode === "bottom" ? room : 0,
  };
}

function applyStrip(banner: HTMLElement, strip: Strip) {
  banner.style.setProperty("--bx", `${strip.cx}px`);
  banner.style.setProperty("--by", `${strip.cy}px`);
  banner.style.setProperty("--bw", `${strip.len}px`);
  banner.style.setProperty("--brot", `${strip.deg}deg`);
}

function deal(pieces: HTMLElement[], inset: Inset) {
  const desktop = pick(desktopLayouts);
  const mobile = pick(mobileLayouts);
  const flipDesktop = Math.random() < 0.5;
  const flipMobile = Math.random() < 0.5;
  const projectOrder = shuffled(4);
  const fit = (pct: number, before: number, after: number, size: number) =>
    ((before + (pct / 100) * (size - before - after)) / size) * 100;

  for (const el of pieces) {
    const slot = el.dataset.slot as Slot;
    const isProject = slot.startsWith("p");
    const spot = (isProject ? `p${projectOrder[Number(slot[1])]}` : slot) as Slot;
    const [x, y] = desktop[spot];
    const [mx, my] = mobile[spot];
    const w = innerWidth;
    const h = innerHeight;
    el.style.setProperty("--x", `${fit(flipDesktop ? 100 - x : x, inset.l, inset.r, w)}%`);
    el.style.setProperty("--y", `${fit(y, inset.t, inset.b, h)}%`);
    el.style.setProperty("--mx", `${fit(flipMobile ? 100 - mx : mx, inset.l, inset.r, w)}%`);
    el.style.setProperty("--my", `${fit(my, inset.t, inset.b, h)}%`);
    const tilt = isProject || slot === "bio" ? randomTilt(1.5, 3) : randomTilt(1, 2.5);
    el.firstElementChild?.setAttribute("style", `--tilt:${tilt}`);
  }
}

/** Separating-axis test: does an axis-aligned rect overlap the oriented strip? */
function hitsStrip(r: DOMRect, s: Strip) {
  const rad = (s.deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rx = (r.left + r.right) / 2;
  const ry = (r.top + r.bottom) / 2;
  const rw = (r.width + GAP * 2) / 2;
  const rh = (r.height + GAP * 2) / 2;
  const dx = rx - s.cx;
  const dy = ry - s.cy;
  const hl = s.len / 2;
  const ht = s.thick / 2 + GAP;
  const axes: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [0, 1],
    [cos, sin],
    [-sin, cos],
  ];
  return axes.every(([ax, ay]) => {
    const rectReach = rw * Math.abs(ax) + rh * Math.abs(ay);
    const stripReach = hl * Math.abs(cos * ax + sin * ay) + ht * Math.abs(-sin * ax + cos * ay);
    return Math.abs(dx * ax + dy * ay) < rectReach + stripReach;
  });
}

/** Overlaps plus pieces pushed off-screen or under the banner: 0 is a clean deal. */
function collisions(pieces: HTMLElement[], strip: Strip) {
  const boxes = pieces.map((el) => el.firstElementChild!.getBoundingClientRect());
  let bad = 0;
  boxes.forEach((a, i) => {
    if (a.left < 0 || a.right > innerWidth || a.top < 0 || a.bottom > innerHeight) bad++;
    if (hitsStrip(a, strip)) bad++;
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j];
      if (
        a.left < b.right + GAP &&
        b.left < a.right + GAP &&
        a.top < b.bottom + GAP &&
        b.top < a.bottom + GAP
      ) {
        bad++;
      }
    }
  });
  return bad;
}

/**
 * Re-deals the pieces and the stack banner on every page load. Runs in
 * the browser because a server-side random would be frozen into the
 * prerendered HTML for everyone. Each deal is measured, since content has a fixed
 * pixel size but layouts are in %, so the same layout can collide on a short
 * screen; the best of several deals wins.
 */
export function Scatter() {
  useEffect(() => {
    const pieces = Array.from(document.querySelectorAll<HTMLElement>("[data-slot]"));
    const banner = document.querySelector<HTMLElement>("[data-banner]");
    const marquee = banner?.querySelector<HTMLElement>("[data-marquee]");
    if (!banner || !marquee) return;
    const thick = marquee.offsetHeight;

    // Orientation is drawn first, uniformly, so every one shows up equally often;
    // a mode that cannot fit this screen (side strips on a phone) falls through.
    let best = Infinity;
    let bestStyles: Array<[Element, string]> = [];
    for (const mode of shuffled(MODES.length).map((i) => MODES[i])) {
      for (let i = 0; i < TRIES_PER_MODE && best > 0; i++) {
        const strip = dealStrip(mode, thick);
        deal(pieces, insetFor(mode, thick));
        applyStrip(banner, strip);
        const score = collisions(pieces, strip);
        if (score < best) {
          best = score;
          bestStyles = [banner, ...pieces, ...pieces.map((p) => p.firstElementChild!)].map(
            (el) => [el, el.getAttribute("style") ?? ""] as [Element, string],
          );
        }
      }
      if (best === 0) break;
    }
    // The last try is not necessarily the best one: restore the winner.
    if (best > 0) bestStyles.forEach(([el, style]) => el.setAttribute("style", style));
  }, []);

  return null;
}
