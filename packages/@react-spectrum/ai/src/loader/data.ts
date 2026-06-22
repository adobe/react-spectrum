// Loader cell-position data, ported from
// experiments/pixel-fall-animation/index.html.
//
// Each icon is an independently-exported `Cell[]` so unused icons tree-
// shake away; a preset is a `Cell[][]` (a sequence of icons). Import only
// what you render: `import {brush} from '...'` then `<PixelLoader icon={brush} />`,
// or a preset `import {cc} from '...'` then `<PixelLoader icon={cc} />`.
//
// Coordinates are in the source Lottie's 1000×1000 canvas.

export interface Cell {
  cx: number;
  cy: number;
  // Retained from the source data; no longer affects rendering.
  outer: boolean;
  stagger: number;
  exitStart: number;
  fadeIn: number[];
  fadeOut: number[];
}

type StaggerMode = 'individual' | 'grouped' | 'by-row';

interface BuildOptions {
  staggerInterval?: number;
  rowOffset?: number;
  stagger?: StaggerMode;
}

// ─────────────────────────────────────────────────────────────
// ai-logo: original 12-cell diamond layout with hand-tuned timings.
// ─────────────────────────────────────────────────────────────
export const aiLogo: Cell[] = [
  {cx: 500, cy: 800, outer: true, stagger: 0, exitStart: 47, fadeIn: [1, 4], fadeOut: [47, 59]},
  {cx: 300, cy: 700, outer: true, stagger: 2, exitStart: 48, fadeIn: [4, 7], fadeOut: [48, 60]},
  {cx: 700, cy: 700, outer: true, stagger: 4, exitStart: 49, fadeIn: [6, 9], fadeOut: [49, 61]},
  {cx: 400, cy: 600, outer: false, stagger: 6, exitStart: 50, fadeIn: [9, 12], fadeOut: [50, 62]},
  {cx: 600, cy: 600, outer: false, stagger: 8, exitStart: 51, fadeIn: [13, 16], fadeOut: [51, 63]},
  {cx: 200, cy: 500, outer: true, stagger: 10, exitStart: 52, fadeIn: [14, 17], fadeOut: [52, 64]},
  {cx: 800, cy: 500, outer: true, stagger: 14, exitStart: 54, fadeIn: [18, 21], fadeOut: [54, 66]},
  {cx: 400, cy: 400, outer: false, stagger: 16, exitStart: 55, fadeIn: [21, 24], fadeOut: [55, 67]},
  {cx: 600, cy: 400, outer: false, stagger: 18, exitStart: 56, fadeIn: [23, 26], fadeOut: [56, 68]},
  {cx: 300, cy: 300, outer: true, stagger: 20, exitStart: 57, fadeIn: [26, 29], fadeOut: [57, 69]},
  {cx: 700, cy: 300, outer: true, stagger: 22, exitStart: 58, fadeIn: [27, 30], fadeOut: [58, 70]},
  {cx: 500, cy: 200, outer: true, stagger: 24, exitStart: 59, fadeIn: [31, 34], fadeOut: [59, 71]}
];

// ─────────────────────────────────────────────────────────────
// POSITIONS — [col, row] grid coords per icon, exported individually.
// ─────────────────────────────────────────────────────────────
const brushPositions: number[][] = [
  [0, 6],
  [1, 6],
  [2, 6],
  [1, 5],
  [3, 5],
  [2, 4],
  [3, 4],
  [3, 3],
  [4, 3],
  [4, 2],
  [5, 2],
  [5, 1],
  [6, 1],
  [6, 0]
];
const eyePositions: number[][] = [
  [2, 4],
  [3, 4],
  [4, 4],
  [1, 3],
  [3, 3],
  [5, 3],
  [0, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [6, 2],
  [1, 1],
  [2, 1],
  [3, 1],
  [5, 1],
  [2, 0],
  [3, 0],
  [4, 0]
];
const hourglassPositions: number[][] = [
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 6],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 5],
  [1, 4],
  [2, 4],
  [4, 4],
  [5, 4],
  [2, 3],
  [3, 3],
  [4, 3],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [5, 2],
  [1, 1],
  [5, 1],
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [6, 0]
];
const magPositions: number[][] = [
  [6, 6],
  [5, 5],
  [1, 4],
  [2, 4],
  [3, 4],
  [0, 3],
  [4, 3],
  [0, 2],
  [4, 2],
  [0, 1],
  [4, 1],
  [1, 0],
  [2, 0],
  [3, 0]
];
const cropPositions: number[][] = [
  [5, 6],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 5],
  [6, 5],
  [1, 4],
  [1, 3],
  [5, 3],
  [1, 2],
  [5, 2],
  [0, 1],
  [1, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [1, 0]
];
const flowerPositions: number[][] = [
  [3, 6],
  [3, 5],
  [2, 4],
  [4, 4],
  [2, 3],
  [5, 3],
  [1, 2],
  [4, 2],
  [6, 2],
  [0, 1],
  [2, 1],
  [5, 1],
  [1, 0]
];
const imagePositions: number[][] = [
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 6],
  [0, 5],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 5],
  [6, 5],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [5, 4],
  [6, 4],
  [0, 3],
  [2, 3],
  [6, 3],
  [0, 2],
  [4, 2],
  [6, 2],
  [0, 1],
  [6, 1],
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [6, 0]
];
const lassoPositions: number[][] = [
  [1, 6],
  [2, 5],
  [1, 4],
  [2, 4],
  [0, 3],
  [3, 3],
  [4, 3],
  [5, 3],
  [0, 2],
  [6, 2],
  [1, 1],
  [6, 1],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0]
];
const pagePositions: number[][] = [
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 6],
  [0, 5],
  [6, 5],
  [0, 4],
  [6, 4],
  [0, 3],
  [3, 3],
  [4, 3],
  [5, 3],
  [6, 3],
  [0, 2],
  [3, 2],
  [6, 2],
  [0, 1],
  [3, 1],
  [5, 1],
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0]
];
const wandPositions: number[][] = [
  [6, 6],
  [5, 5],
  [0, 4],
  [4, 4],
  [2, 3],
  [1, 2],
  [3, 2],
  [2, 1],
  [0, 0],
  [4, 0]
];
const bargraphPositions: number[][] = [
  [0, 6],
  [2, 6],
  [4, 6],
  [6, 6],
  [2, 5],
  [4, 5],
  [6, 5],
  [0, 4],
  [2, 4],
  [4, 4],
  [6, 4],
  [1, 3],
  [6, 3],
  [2, 2],
  [4, 2],
  [6, 2],
  [3, 1],
  [5, 1],
  [6, 0]
];
const trefoilPositions: number[][] = [
  [0, 6],
  [1, 6],
  [1, 5],
  [2, 4],
  [3, 4],
  [5, 4],
  [6, 4],
  [2, 3],
  [4, 3],
  [3, 2],
  [3, 1],
  [3, 0]
];
const dialPositions: number[][] = [
  [0, 4],
  [6, 4],
  [0, 3],
  [3, 3],
  [6, 3],
  [0, 2],
  [4, 2],
  [6, 2],
  [1, 1],
  [5, 1],
  [2, 0],
  [3, 0]
];
const folderPositions: number[][] = [
  [0, 5],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 5],
  [6, 5],
  [0, 4],
  [6, 4],
  [0, 3],
  [6, 3],
  [0, 2],
  [6, 2],
  [0, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [1, 0],
  [2, 0]
];
const arrowPositions: number[][] = [
  [0, 4],
  [1, 3],
  [3, 3],
  [2, 2],
  [4, 2],
  [6, 2],
  [5, 1],
  [6, 1],
  [4, 0],
  [5, 0],
  [6, 0]
];
const cloudPositions: number[][] = [
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 4],
  [0, 3],
  [6, 3],
  [1, 2],
  [5, 2],
  [1, 1],
  [2, 1],
  [5, 1],
  [3, 0],
  [4, 0]
];
const commentPositions: number[][] = [
  [1, 6],
  [1, 5],
  [2, 5],
  [1, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [0, 3],
  [6, 3],
  [0, 2],
  [6, 2],
  [0, 1],
  [6, 1],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0]
];
const filterPositions: number[][] = [
  [2, 6],
  [3, 6],
  [2, 5],
  [4, 5],
  [2, 4],
  [4, 4],
  [2, 3],
  [4, 3],
  [1, 2],
  [5, 2],
  [0, 1],
  [6, 1],
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [6, 0]
];
const microphonePositions: number[][] = [
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [2, 5],
  [3, 5],
  [1, 4],
  [4, 4],
  [0, 3],
  [1, 3],
  [4, 3],
  [5, 3],
  [1, 2],
  [4, 2],
  [1, 1],
  [4, 1],
  [2, 0],
  [3, 0]
];
const pencilPositions: number[][] = [
  [0, 6],
  [1, 6],
  [2, 6],
  [0, 5],
  [1, 5],
  [3, 5],
  [0, 4],
  [4, 4],
  [1, 3],
  [5, 3],
  [2, 2],
  [4, 2],
  [6, 2],
  [3, 1],
  [6, 1],
  [4, 0],
  [5, 0]
];
const potionPositions: number[][] = [
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [0, 5],
  [6, 5],
  [0, 4],
  [2, 4],
  [6, 4],
  [1, 3],
  [3, 3],
  [5, 3],
  [2, 2],
  [4, 2],
  [2, 1],
  [4, 1],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0]
];
const sliderPositions: number[][] = [
  [4, 5],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [5, 4],
  [6, 4],
  [4, 3],
  [2, 2],
  [0, 1],
  [1, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [2, 0]
];
const timelinePositions: number[][] = [
  [3, 6],
  [0, 5],
  [1, 5],
  [3, 5],
  [4, 5],
  [5, 5],
  [6, 5],
  [0, 4],
  [1, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 4],
  [3, 3],
  [2, 2],
  [4, 2],
  [1, 1],
  [5, 1],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0]
];
const eyedropPositions: number[][] = [
  [0, 6],
  [1, 6],
  [0, 5],
  [2, 5],
  [1, 4],
  [3, 4],
  [2, 3],
  [4, 3],
  [6, 3],
  [3, 2],
  [4, 2],
  [5, 2],
  [4, 1],
  [5, 1],
  [6, 1],
  [3, 0],
  [5, 0],
  [6, 0]
];
const adobeAPositions: number[][] = [
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
  [5, 6],
  [6, 6],
  [1, 5],
  [2, 5],
  [5, 5],
  [1, 4],
  [2, 4],
  [4, 4],
  [5, 4],
  [1, 3],
  [2, 3],
  [4, 3],
  [5, 3],
  [2, 2],
  [3, 2],
  [4, 2],
  [2, 1],
  [3, 1],
  [4, 1]
];
const adobeDPositions: number[][] = [
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [1, 5],
  [2, 5],
  [4, 5],
  [5, 5],
  [1, 4],
  [2, 4],
  [4, 4],
  [5, 4],
  [1, 3],
  [2, 3],
  [4, 3],
  [5, 3],
  [2, 2],
  [3, 2],
  [4, 2],
  [5, 2],
  [4, 1],
  [5, 1]
];
const adobeOPositions: number[][] = [
  [2, 6],
  [3, 6],
  [4, 6],
  [1, 5],
  [2, 5],
  [4, 5],
  [5, 5],
  [1, 4],
  [2, 4],
  [4, 4],
  [5, 4],
  [1, 3],
  [2, 3],
  [4, 3],
  [5, 3],
  [2, 2],
  [3, 2],
  [4, 2]
];
const adobeBPositions: number[][] = [
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [1, 5],
  [2, 5],
  [4, 5],
  [5, 5],
  [1, 4],
  [2, 4],
  [4, 4],
  [5, 4],
  [1, 3],
  [2, 3],
  [4, 3],
  [5, 3],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [1, 1],
  [2, 1]
];
const adobeEPositions: number[][] = [
  [2, 6],
  [3, 6],
  [4, 6],
  [1, 5],
  [2, 5],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [1, 3],
  [2, 3],
  [4, 3],
  [5, 3],
  [2, 2],
  [3, 2],
  [4, 2]
];

// ─────────────────────────────────────────────────────────────
// buildCells — turn a positions list ([col, row] coords on a 7×7 grid,
// bottom-up/left-to-right within a row → stagger order) into a cells
// array with per-cell timing (stagger, exitStart, fadeIn, fadeOut).
//
// stagger modes:
//   'individual' — brush style. Each cell gets i * interval.
//   'grouped' (default) — eye style. Cells stagger within a row,
//     with 1-cell overlap between consecutive rows (cleaner reads).
//   'by-row' — all cells in a row share one stagger value.
// ─────────────────────────────────────────────────────────────
export function buildCells(positions: number[][], options: BuildOptions = {}): Cell[] {
  const {staggerInterval = 2, rowOffset = 0, stagger: staggerMode = 'grouped'} = options;
  let staggers: number[];
  if (staggerMode === 'by-row') {
    const rowsBottomUp = [...new Set(positions.map(p => p[1]))].sort((a, b) => b - a);
    const rowStagger = new Map<number, number>();
    rowsBottomUp.forEach((r, i) => rowStagger.set(r, i * staggerInterval));
    staggers = positions.map(([, row]) => rowStagger.get(row)!);
  } else if (staggerMode === 'grouped') {
    const rowGroups = new Map<number, number[]>();
    positions.forEach(([, row], i) => {
      if (!rowGroups.has(row)) {
        rowGroups.set(row, []);
      }
      rowGroups.get(row)!.push(i);
    });
    const rowsBottomUp = [...rowGroups.keys()].sort((a, b) => b - a);
    staggers = new Array(positions.length);
    let rowStart = 0;
    for (const row of rowsBottomUp) {
      const indices = rowGroups.get(row)!;
      indices.forEach((idx, j) => {
        staggers[idx] = rowStart + j * staggerInterval;
      });
      rowStart += Math.max(0, indices.length - 1) * staggerInterval;
    }
  } else if (staggerMode === 'individual') {
    staggers = positions.map((_, i) => i * staggerInterval);
  } else {
    throw new Error(
      `Unknown stagger mode: ${staggerMode}. Use 'individual', 'grouped', or 'by-row'.`
    );
  }
  const maxStagger = Math.max(1, ...staggers);
  return positions.map(([col, row], i) => {
    const stagger = staggers[i];
    const exitStart = 47 + (stagger / maxStagger) * 12;
    return {
      cx: 200 + col * 100,
      cy: 200 + (row + rowOffset) * 100,
      outer: false,
      stagger,
      exitStart,
      fadeIn: [stagger + 1, stagger + 4],
      fadeOut: [exitStart, exitStart + 12]
    };
  });
}

// ─────────────────────────────────────────────────────────────
// Icons — each an independently tree-shakeable `Cell[]`.
// ─────────────────────────────────────────────────────────────
export const brush = /* @__PURE__ */ buildCells(brushPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const eye = /* @__PURE__ */ buildCells(eyePositions, {
  staggerInterval: 2,
  stagger: 'grouped',
  rowOffset: 1
});
export const hourglass = /* @__PURE__ */ buildCells(hourglassPositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const mag = /* @__PURE__ */ buildCells(magPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const crop = /* @__PURE__ */ buildCells(cropPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const flower = /* @__PURE__ */ buildCells(flowerPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const image = /* @__PURE__ */ buildCells(imagePositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const lasso = /* @__PURE__ */ buildCells(lassoPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const page = /* @__PURE__ */ buildCells(pagePositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const wand = /* @__PURE__ */ buildCells(wandPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const bargraph = /* @__PURE__ */ buildCells(bargraphPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const trefoil = /* @__PURE__ */ buildCells(trefoilPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const dial = /* @__PURE__ */ buildCells(dialPositions, {
  staggerInterval: 2,
  stagger: 'grouped',
  rowOffset: 1
});
export const folder = /* @__PURE__ */ buildCells(folderPositions, {
  staggerInterval: 1,
  stagger: 'grouped',
  rowOffset: 1
});
export const arrow = /* @__PURE__ */ buildCells(arrowPositions, {
  staggerInterval: 2,
  stagger: 'grouped',
  rowOffset: 2
});
export const cloud = /* @__PURE__ */ buildCells(cloudPositions, {
  staggerInterval: 1,
  stagger: 'grouped',
  rowOffset: 1
});
export const comment = /* @__PURE__ */ buildCells(commentPositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const filter = /* @__PURE__ */ buildCells(filterPositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const microphone = /* @__PURE__ */ buildCells(microphonePositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const pencil = /* @__PURE__ */ buildCells(pencilPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const potion = /* @__PURE__ */ buildCells(potionPositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const slider = /* @__PURE__ */ buildCells(sliderPositions, {
  staggerInterval: 1,
  stagger: 'grouped',
  rowOffset: 1
});
export const timeline = /* @__PURE__ */ buildCells(timelinePositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const eyedrop = /* @__PURE__ */ buildCells(eyedropPositions, {
  staggerInterval: 1,
  stagger: 'grouped'
});
export const adobeA = /* @__PURE__ */ buildCells(adobeAPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const adobeD = /* @__PURE__ */ buildCells(adobeDPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const adobeO = /* @__PURE__ */ buildCells(adobeOPositions, {
  staggerInterval: 2,
  stagger: 'grouped',
  rowOffset: -1
});
export const adobeB = /* @__PURE__ */ buildCells(adobeBPositions, {
  staggerInterval: 2,
  stagger: 'grouped'
});
export const adobeE = /* @__PURE__ */ buildCells(adobeEPositions, {
  staggerInterval: 2,
  stagger: 'grouped',
  rowOffset: -1
});

// ─────────────────────────────────────────────────────────────
// Presets — sequences (`Cell[][]`) that loop through their icons.
// Importing a preset pulls in only the icons it references.
// ─────────────────────────────────────────────────────────────
export const cc: Cell[][] = [
  aiLogo,
  brush,
  wand,
  crop,
  eye,
  hourglass,
  adobeA,
  adobeD,
  adobeO,
  adobeB,
  adobeE,
  eyedrop
];

export const dc: Cell[][] = [
  aiLogo,
  page,
  trefoil,
  image,
  cloud,
  mag,
  adobeA,
  adobeD,
  adobeO,
  adobeB,
  adobeE,
  pencil
];

export const exp: Cell[][] = [
  aiLogo,
  bargraph,
  dial,
  filter,
  slider,
  folder,
  adobeA,
  adobeD,
  adobeO,
  adobeB,
  adobeE,
  arrow
];

export const analyze: Cell[][] = [flower, image, brush, eye, eyedrop, wand, lasso, crop];

export const mega: Cell[][] = [
  aiLogo,
  brush,
  wand,
  crop,
  eye,
  hourglass,
  page,
  trefoil,
  image,
  eyedrop,
  mag,
  bargraph,
  dial,
  folder,
  flower,
  lasso,
  adobeA,
  adobeD,
  adobeO,
  adobeB,
  adobeE,
  arrow,
  cloud,
  comment,
  filter,
  microphone,
  pencil,
  potion,
  slider,
  timeline
];
