// Pure animation model for the pixel-fall loader, ported from the
// standalone HTML export in experiments/pixel-fall-animation/index.html.
//
// These curves are the single source of truth for both the CSS
// @keyframes generated in react.tsx (the playing animation) and the
// static poster-frame render (the paused state). The animation itself
// is driven natively by the browser via CSS animations — there is no
// rAF loop. Visual parity with the playground is the load-bearing test.

// ─────────────────────────────────────────────────────────────
// Cubic-bezier easing — P0=(0,0), P3=(1,1); returns y for x ∈ [0,1].
// ─────────────────────────────────────────────────────────────
export function cubicBezier(p1x, p1y, p2x, p2y) {
  const sampleX = t => 3 * (1 - t) * (1 - t) * t * p1x + 3 * (1 - t) * t * t * p2x + t * t * t;
  const sampleY = t => 3 * (1 - t) * (1 - t) * t * p1y + 3 * (1 - t) * t * t * p2y + t * t * t;
  const sampleDX = t =>
    3 * (1 - t) * (1 - t) * p1x + 6 * (1 - t) * t * (p2x - p1x) + 3 * t * t * (1 - p2x);
  function solve(x) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const cx = sampleX(t) - x;
      if (Math.abs(cx) < 1e-6) return t;
      const dx = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break;
      t -= cx / dx;
    }
    let lo = 0;
    let hi = 1;
    while (hi - lo > 1e-6) {
      const m = (lo + hi) / 2;
      if (sampleX(m) < x) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  }
  return x => sampleY(solve(Math.max(0, Math.min(1, x))));
}

// Easing control points — shared by the JS samplers below and the
// `cubic-bezier(...)` strings emitted into CSS, so the two can never
// drift. Native CSS solves these the same way `cubicBezier` does, so
// the playing animation matches the poster frame exactly.
export const EASE = {
  drop: [0.333, 0, 0.667, 1],
  recover: [0.333, 0, 0.833, 1],
  exit: [0.563, 0, 0.906, 0.757],
  scaleUp: [0.333, 0, 0.378, 0.765],
  scaleDown: [0.253, -0.027, 0.97, 0.045],
  fade: [0.167, 0.167, 0.833, 0.833]
} as const;

export const easeDrop = cubicBezier(...EASE.drop);
export const easeRecover = cubicBezier(...EASE.recover);
export const easeExit = cubicBezier(...EASE.exit);
export const easeScaleUp = cubicBezier(...EASE.scaleUp);
export const easeScaleDown = cubicBezier(...EASE.scaleDown);
export const easeFade = cubicBezier(...EASE.fade);

// ─────────────────────────────────────────────────────────────
// Timing constants — one full cycle is 72 frames at 30fps (2.4s).
// ─────────────────────────────────────────────────────────────
export const TOTAL_FRAMES = 72;
export const FPS = 30;

// ─────────────────────────────────────────────────────────────
// Per-cell vertical offset from settled position (data3.json kfs).
// ─────────────────────────────────────────────────────────────
export const Y_START = -876.156;
export const Y_OVERSHOOT = 18;
export const Y_EXIT = 1015;

export function getY(localT, exitLocal) {
  if (localT < 0) return Y_START;
  if (localT < 10) return Y_START + (Y_OVERSHOOT - Y_START) * easeDrop(localT / 10);
  if (localT < 13) return Y_OVERSHOOT + (0 - Y_OVERSHOOT) * easeRecover((localT - 10) / 3);
  if (localT < exitLocal) return 0;
  if (localT < exitLocal + 12) return Y_EXIT * easeExit((localT - exitLocal) / 12);
  return Y_EXIT;
}

// ─────────────────────────────────────────────────────────────
// Global scale curve — cells bloom from a slightly smaller starting
// scale up to their natural footprint (1.0) at POSTER_FRAME, hold
// there for a few frames, then descend toward the exit pose.
//
// Shape:
//   compT ∈ [0, 38)   — grow 0.92 → 1.0   (anticipation then bloom)
//   compT ∈ [38, 44)  — plateau at 1.0     (POSTER_FRAME = 42 sits here)
//   compT ∈ [44, 83)  — descend 1.0 → 0.74991
//   compT ≥ 83        — frozen at 0.74991
//
// Growing into 1.0 (instead of overshooting above and snapping back
// down) keeps the curve C0-continuous across the plateau boundary and
// avoids the visible scale pop that the earlier overshoot-then-snap
// shape caused. `getGlobalScale(POSTER_FRAME) === 1.0` exactly, so the
// paused poster render is literally a single frame of the playing
// animation — no special-cased override needed.
// ─────────────────────────────────────────────────────────────
export const SCALE_START = 0.92;
export const SCALE_END = 74.991 / 100;
export const PLATEAU_START = 38;
export const PLATEAU_END = 44;

export function getGlobalScale(compT) {
  if (compT < 0) return SCALE_START;
  if (compT < PLATEAU_START) {
    return SCALE_START + (1 - SCALE_START) * easeScaleUp(compT / PLATEAU_START);
  }
  if (compT < PLATEAU_END) return 1;
  if (compT < 83) {
    const t = (compT - PLATEAU_END) / (83 - PLATEAU_END);
    return 1 + (SCALE_END - 1) * easeScaleDown(t);
  }
  return SCALE_END;
}

// ─────────────────────────────────────────────────────────────
// Per-cell opacity from data3.json (4 keyframes per cell).
// ─────────────────────────────────────────────────────────────
export function getOpacity(compT, cell) {
  const [fi0, fi1] = cell.fadeIn;
  const [fo0, fo1] = cell.fadeOut;
  if (compT < fi0) return 0;
  if (compT < fi1) return easeFade((compT - fi0) / (fi1 - fi0));
  if (compT < fo0) return 1;
  if (compT < fo1) return 1 - easeFade((compT - fo0) / (fo1 - fo0));
  return 0;
}

// ─────────────────────────────────────────────────────────────
// Poster frame — the rest-pose compFrame for the paused render. Sits
// inside the plateau region of `getGlobalScale`, so the curve
// naturally evaluates to 1.0 here and the paused render is just a
// literal single frame of the playing animation — no scale pop when
// toggling `playing`.
// ─────────────────────────────────────────────────────────────
export const POSTER_FRAME = 42;
