export type Slot = "hero" | "bio" | "contact" | "p0" | "p1" | "p2" | "p3";

/** [x, y] as % of the screen, the centre of the piece. */
type Layout = Record<Slot, readonly [number, number]>;

/**
 * Hand-tuned arrangements, so shuffling never stacks pieces on top of each
 * other (they differ in size). Index 0 is also the server-rendered default.
 */
export const desktopLayouts: readonly Layout[] = [
  {
    hero: [50, 40],
    bio: [80, 12],
    contact: [50, 75],
    p0: [12, 36],
    p1: [88, 38],
    p2: [22, 80],
    p3: [78, 80],
  },
  {
    hero: [36, 30],
    bio: [82, 12],
    contact: [50, 85],
    p0: [18, 66],
    p1: [50, 66],
    p2: [82, 66],
    p3: [86, 38],
  },
  {
    hero: [64, 68],
    bio: [20, 10],
    contact: [82, 14],
    p0: [14, 34],
    p1: [14, 60],
    p2: [46, 26],
    p3: [82, 38],
  },
  {
    hero: [50, 26],
    bio: [22, 58],
    contact: [76, 58],
    p0: [13, 80],
    p1: [38, 80],
    p2: [62, 80],
    p3: [87, 80],
  },
];

export const mobileLayouts: readonly Layout[] = [
  {
    hero: [50, 28],
    bio: [50, 8],
    contact: [50, 87],
    p0: [27, 50],
    p1: [73, 55],
    p2: [27, 66],
    p3: [73, 72],
  },
  {
    hero: [50, 15],
    bio: [50, 56],
    contact: [50, 88],
    p0: [27, 37],
    p1: [73, 41],
    p2: [27, 70],
    p3: [73, 74],
  },
  {
    hero: [50, 48],
    bio: [50, 67],
    contact: [50, 6],
    p0: [27, 22],
    p1: [73, 25],
    p2: [27, 84],
    p3: [73, 81],
  },
];
