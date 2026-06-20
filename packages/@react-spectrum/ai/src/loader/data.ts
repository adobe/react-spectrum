// Loader cell-position data, ported from
// experiments/pixel-fall-animation/index.html.
//
// Each cell:
//   { cx, cy, outer, stagger, exitStart, fadeIn, fadeOut }
// Coordinates are in the source Lottie's 1000×1000 canvas.

// ─────────────────────────────────────────────────────────────
// ai-logo: original 12-cell diamond layout with hand-tuned timings.
// ─────────────────────────────────────────────────────────────
export const aiLogoCells = [
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
// POSITIONS — each entry is a list of [col, row] cell coords on a
// 7×7 grid. Bottom-up, left-to-right within row → stagger order.
// ─────────────────────────────────────────────────────────────
export const POSITIONS = {
  brush: [
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
  ],
  eye: [
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
  ],
  hourglass: [
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
  ],
  mag: [
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
  ],
  crop: [
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
  ],
  flower: [
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
  ],
  image: [
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
  ],
  lasso: [
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
  ],
  page: [
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
  ],
  wand: [
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
  ],
  bargraph: [
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
  ],
  trefoil: [
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
  ],
  dial: [
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
  ],
  folder: [
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
  ],
  arrow: [
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
  ],
  cloud: [
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
  ],
  comment: [
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
  ],
  filter: [
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
  ],
  microphone: [
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
  ],
  pencil: [
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
  ],
  potion: [
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
  ],
  slider: [
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
  ],
  timeline: [
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
  ],
  eyedrop: [
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
  ],
  'adobe-a': [
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
  ],
  'adobe-d': [
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
  ],
  'adobe-o': [
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
  ],
  'adobe-b': [
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
  ],
  'adobe-e': [
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
  ]
};

// ─────────────────────────────────────────────────────────────
// buildCells — turn a positions list into a cells array with
// per-cell timing (stagger, exitStart, fadeIn, fadeOut).
//
// stagger modes:
//   'individual' — brush style. Each cell gets i * interval.
//   'grouped' (default) — eye style. Cells stagger within a row,
//     with 1-cell overlap between consecutive rows (cleaner reads).
//   'by-row' — all cells in a row share one stagger value.
// ─────────────────────────────────────────────────────────────
export function buildCells(positions, options = {}) {
  const {staggerInterval = 2, rowOffset = 0, stagger: staggerMode = 'grouped'} = options;
  let staggers;
  if (staggerMode === 'by-row') {
    const rowsBottomUp = [...new Set(positions.map(p => p[1]))].sort((a, b) => b - a);
    const rowStagger = Object.fromEntries(rowsBottomUp.map((r, i) => [r, i * staggerInterval]));
    staggers = positions.map(([, row]) => rowStagger[row]);
  } else if (staggerMode === 'grouped') {
    const rowGroups = new Map();
    positions.forEach(([, row], i) => {
      if (!rowGroups.has(row)) rowGroups.set(row, []);
      rowGroups.get(row).push(i);
    });
    const rowsBottomUp = [...rowGroups.keys()].sort((a, b) => b - a);
    staggers = new Array(positions.length);
    let rowStart = 0;
    for (const row of rowsBottomUp) {
      const indices = rowGroups.get(row);
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
// cellSets — { name: Cell[] } for every shipped icon.
// ─────────────────────────────────────────────────────────────
export const cellSets = {
  'ai-logo': aiLogoCells,
  brush: buildCells(POSITIONS.brush, {staggerInterval: 2, stagger: 'grouped'}),
  eye: buildCells(POSITIONS.eye, {staggerInterval: 2, stagger: 'grouped', rowOffset: 1}),
  hourglass: buildCells(POSITIONS.hourglass, {staggerInterval: 1, stagger: 'grouped'}),
  mag: buildCells(POSITIONS.mag, {staggerInterval: 2, stagger: 'grouped'}),
  crop: buildCells(POSITIONS.crop, {staggerInterval: 2, stagger: 'grouped'}),
  flower: buildCells(POSITIONS.flower, {staggerInterval: 2, stagger: 'grouped'}),
  image: buildCells(POSITIONS.image, {staggerInterval: 1, stagger: 'grouped'}),
  lasso: buildCells(POSITIONS.lasso, {staggerInterval: 2, stagger: 'grouped'}),
  page: buildCells(POSITIONS.page, {staggerInterval: 1, stagger: 'grouped'}),
  wand: buildCells(POSITIONS.wand, {staggerInterval: 2, stagger: 'grouped'}),
  bargraph: buildCells(POSITIONS.bargraph, {staggerInterval: 2, stagger: 'grouped'}),
  trefoil: buildCells(POSITIONS.trefoil, {staggerInterval: 2, stagger: 'grouped'}),
  dial: buildCells(POSITIONS.dial, {staggerInterval: 2, stagger: 'grouped', rowOffset: 1}),
  folder: buildCells(POSITIONS.folder, {staggerInterval: 1, stagger: 'grouped', rowOffset: 1}),
  arrow: buildCells(POSITIONS.arrow, {staggerInterval: 2, stagger: 'grouped', rowOffset: 2}),
  cloud: buildCells(POSITIONS.cloud, {staggerInterval: 1, stagger: 'grouped', rowOffset: 1}),
  comment: buildCells(POSITIONS.comment, {staggerInterval: 1, stagger: 'grouped'}),
  filter: buildCells(POSITIONS.filter, {staggerInterval: 1, stagger: 'grouped'}),
  microphone: buildCells(POSITIONS.microphone, {staggerInterval: 1, stagger: 'grouped'}),
  pencil: buildCells(POSITIONS.pencil, {staggerInterval: 2, stagger: 'grouped'}),
  potion: buildCells(POSITIONS.potion, {staggerInterval: 1, stagger: 'grouped'}),
  slider: buildCells(POSITIONS.slider, {staggerInterval: 1, stagger: 'grouped', rowOffset: 1}),
  timeline: buildCells(POSITIONS.timeline, {staggerInterval: 1, stagger: 'grouped'}),
  eyedrop: buildCells(POSITIONS.eyedrop, {staggerInterval: 1, stagger: 'grouped'}),
  'adobe-a': buildCells(POSITIONS['adobe-a'], {staggerInterval: 2, stagger: 'grouped'}),
  'adobe-d': buildCells(POSITIONS['adobe-d'], {staggerInterval: 2, stagger: 'grouped'}),
  'adobe-o': buildCells(POSITIONS['adobe-o'], {
    staggerInterval: 2,
    stagger: 'grouped',
    rowOffset: -1
  }),
  'adobe-b': buildCells(POSITIONS['adobe-b'], {staggerInterval: 2, stagger: 'grouped'}),
  'adobe-e': buildCells(POSITIONS['adobe-e'], {
    staggerInterval: 2,
    stagger: 'grouped',
    rowOffset: -1
  })
};

// ─────────────────────────────────────────────────────────────
// LOADER_PRESETS — named sequences of icons (loops through them).
// ─────────────────────────────────────────────────────────────
export const LOADER_PRESETS = {
  cc: {
    label: 'CC Loader',
    icons: [
      'ai-logo',
      'brush',
      'wand',
      'crop',
      'eye',
      'hourglass',
      'adobe-a',
      'adobe-d',
      'adobe-o',
      'adobe-b',
      'adobe-e',
      'eyedrop'
    ]
  },
  dc: {
    label: 'DC Loader',
    icons: [
      'ai-logo',
      'page',
      'trefoil',
      'image',
      'cloud',
      'mag',
      'adobe-a',
      'adobe-d',
      'adobe-o',
      'adobe-b',
      'adobe-e',
      'pencil'
    ]
  },
  exp: {
    label: 'EXP Loader',
    icons: [
      'ai-logo',
      'bargraph',
      'dial',
      'filter',
      'slider',
      'folder',
      'adobe-a',
      'adobe-d',
      'adobe-o',
      'adobe-b',
      'adobe-e',
      'arrow'
    ]
  },
  analyze: {
    label: 'Analyze Image',
    icons: ['flower', 'image', 'brush', 'eye', 'eyedrop', 'wand', 'lasso', 'crop']
  },
  mega: {
    label: 'Mega Loader',
    icons: [
      'ai-logo',
      'brush',
      'wand',
      'crop',
      'eye',
      'hourglass',
      'page',
      'trefoil',
      'image',
      'eyedrop',
      'mag',
      'bargraph',
      'dial',
      'folder',
      'flower',
      'lasso',
      'adobe-a',
      'adobe-d',
      'adobe-o',
      'adobe-b',
      'adobe-e',
      'arrow',
      'cloud',
      'comment',
      'filter',
      'microphone',
      'pencil',
      'potion',
      'slider',
      'timeline'
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// ICON_LABELS — display-name overrides for icons whose key
// doesn't read nicely (e.g. microphone → "mic", ai-logo → "ai logo").
// ─────────────────────────────────────────────────────────────
export const ICON_LABELS = {
  'ai-logo': 'ai logo',
  microphone: 'mic'
};

// ─────────────────────────────────────────────────────────────
// Public icon name list — handy for consumers building pickers.
// ─────────────────────────────────────────────────────────────
export const ICON_NAMES = Object.keys(cellSets);
export const PRESET_NAMES = Object.keys(LOADER_PRESETS);
