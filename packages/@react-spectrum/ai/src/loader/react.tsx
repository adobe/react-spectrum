// React pixel-fall loader. Renders plain HTML divs and lets the browser
// drive the animation natively via generated CSS @keyframes — no
// requestAnimationFrame loop, and no SVG. Cells animate only `transform`
// and `opacity`, with exactly ONE `replace` animation per property per
// cell, so Chrome composites both on the GPU (off the main thread) for
// near-zero idle CPU. (An earlier shared-keyframe variant using
// `animation-composition: add` and stacked opacity animations was ~2x
// the CPU because additive/stacked animations fall back to the main
// thread — composited residency matters far more than keyframe count.)
//
// The easing control points and Y offsets are the single
// source of truth — the keyframes below are emitted from them. When not
// playing, cells render with no animation: settled (translateY 0) and
// opaque, i.e. the fully-assembled poster pose.
//
// Multi-icon sequences (presets) play one icon per 2.4s cycle and
// advance via a single timer — only the current icon's cells are in the
// DOM. A single-icon loader stays a pure infinite CSS loop with no JS.

import {aiLogo, type Cell} from './data';
import * as React from 'react';

// Easing control points, formatted into `cubic-bezier(...)` in the
// generated keyframes. `fade` is intentionally linear — its control
// points lie on y=x.
const EASE = {
  drop: [0.333, 0, 0.667, 1],
  recover: [0.333, 0, 0.833, 1],
  exit: [0.563, 0, 0.906, 0.757],
  fade: [0.167, 0.167, 0.833, 0.833]
};

// One full cycle is 72 frames at 30fps (2.4s).
const TOTAL_FRAMES = 72;
const FPS = 30;
const DURATION_MS = (TOTAL_FRAMES / FPS) * 1000;

// Per-cell vertical offsets in the 1000-unit VIEWBOX space: start off
// the top, overshoot just past the settled position, exit off the bottom.
const Y_START = -876.156;
const Y_OVERSHOOT = 18;
const Y_EXIT = 1015;

// The animation lives in a fixed VIEWBOX-sized coordinate space (matching
// the source Lottie's 1000×1000 canvas) that is scaled down to the
// rendered `size`. Cells are absolutely positioned in this space, so all
// the translateY offsets below are in these units — identical to the old
// SVG viewBox math, just on HTML elements the compositor can accelerate.
const VIEWBOX = 1000;
const CELL = 100;

// ─────────────────────────────────────────────────────────────
// CSS @keyframes generation. Each piecewise segment of the motion
// becomes one keyframe stop whose `animation-timing-function` is the
// matching cubic-bezier (from EASE), so the browser interpolates the
// drop/recover/exit/fade curves natively.
// ─────────────────────────────────────────────────────────────

function pct(frame) {
  // Frame → keyframe offset percentage, trimmed of noise.
  return `${+((frame / TOTAL_FRAMES) * 100).toFixed(4)}%`;
}

function cb(coeffs) {
  return `cubic-bezier(${coeffs.join(',')})`;
}

// stops: ordered [{f, decl, ease}]. `decl` is the CSS declarations for
// that stop; `ease` (optional) is the timing function for the segment
// starting at it. Stops sharing a frame are de-duped (first wins).
type Stop = {f: number; decl: string; ease?: readonly number[] | null};

function emitKeyframes(name: string, stops: Stop[]) {
  let body = '';
  let lastPct: string | null = null;
  for (const s of stops) {
    const p = pct(s.f);
    if (p === lastPct) continue;
    lastPct = p;
    const ease = s.ease ? `animation-timing-function:${cb(s.ease)};` : '';
    body += `${p}{${s.decl}${ease}}`;
  }
  return `@keyframes ${name}{${body}}`;
}

const ty = v => `transform:translateY(${v}px);`;
const op = v => `opacity:${v};`;

function cellYKeyframes(name, c) {
  const s = c.stagger;
  const e = c.exitStart;
  const stops: Stop[] = [{f: 0, decl: ty(Y_START), ease: s > 0 ? null : EASE.drop}];
  if (s > 0) {
    stops.push({f: s, decl: ty(Y_START), ease: EASE.drop});
  }
  stops.push({f: s + 10, decl: ty(Y_OVERSHOOT), ease: EASE.recover});
  stops.push({f: s + 13, decl: ty(0)}); // settled — hold until exit
  stops.push({f: e, decl: ty(0), ease: EASE.exit});
  stops.push({f: e + 12, decl: ty(Y_EXIT)});
  stops.push({f: TOTAL_FRAMES, decl: ty(Y_EXIT)}); // hold offscreen until wrap
  return emitKeyframes(name, stops);
}

function cellOpacityKeyframes(name, c) {
  const [fi0, fi1] = c.fadeIn;
  const [fo0, fo1] = c.fadeOut;
  return emitKeyframes(name, [
    {f: 0, decl: op(0)},
    {f: fi0, decl: op(0), ease: EASE.fade},
    {f: fi1, decl: op(1)},
    {f: fo0, decl: op(1), ease: EASE.fade},
    {f: fo1, decl: op(0)},
    {f: TOTAL_FRAMES, decl: op(0)}
  ]);
}

// Stable per-icon id, keyed by the cell-array reference (icons are
// module-level consts, so the reference is stable). Used to namespace
// each icon's @keyframes and to cache its generated CSS.
let nextIconId = 0;
const iconIds = new WeakMap<object, string>();
function iconId(cells: object): string {
  let id = iconIds.get(cells);
  if (id === undefined) {
    id = `pl${nextIconId++}`;
    iconIds.set(cells, id);
  }
  return id;
}

const cssCache = new WeakMap<object, string>();
function keyframesFor(cells: Cell[]): string {
  let css = cssCache.get(cells);
  if (css === undefined) {
    const id = iconId(cells);
    css = cells
      .map((c, i) => cellYKeyframes(`${id}-${i}-y`, c) + cellOpacityKeyframes(`${id}-${i}-o`, c))
      .join('');
    cssCache.set(cells, css);
  }
  return css;
}

interface PixelLoaderProps {
  size?: number;
  playing?: boolean;
  icon?: Cell[] | Cell[][];
  speed?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─────────────────────────────────────────────────────────────
// Component. Only `size` and `playing` are load-bearing for the
// PromptField usage. `icon` takes a single icon (`Cell[]`) or a
// sequence (`Cell[][]`) imported from ./data; `speed`, `color`,
// `className`, and `style` are supported because they're free. When not
// playing, the loader renders a single static poster frame (no
// animation).
// ─────────────────────────────────────────────────────────────
export function PixelLoader(props: PixelLoaderProps) {
  const {
    size = 64,
    playing = true,
    icon = aiLogo,
    speed = 1,
    color = 'currentColor',
    className,
    style,
    ...rest
  } = props;

  // Normalize to a sequence. A `Cell[][]` (first element is itself an
  // array) is already a sequence; a flat `Cell[]` is wrapped. A single-
  // icon sequence loops forever in pure CSS; a multi-icon sequence
  // advances one icon per cycle via the timer below, so only the current
  // icon's cells are ever in the DOM.
  const sequence = React.useMemo(
    () => (Array.isArray(icon[0]) ? icon : [icon]) as Cell[][],
    [icon]
  );
  const isSequence = sequence.length > 1;
  const duration = DURATION_MS / (speed || 1);

  // `tick` increments once per cycle; the current icon is `tick % len`.
  // It's also the remount key, so each swap restarts the animation cleanly.
  const [tick, setTick] = React.useState(0);

  // Restart from the first icon whenever the sequence changes.
  let [lastSequence, setLastSequence] = React.useState(sequence);
  if (lastSequence !== sequence) {
    setLastSequence(sequence);
    setTick(0);
  }

  // Advance the sequence one icon per cycle while playing. Single-icon
  // loaders never start a timer — they're a pure infinite CSS loop.
  React.useEffect(() => {
    if (!playing || !isSequence) {
      return undefined;
    }
    const id = setInterval(() => setTick(t => t + 1), duration);
    return () => clearInterval(id);
  }, [playing, isSequence, duration, sequence]);

  const cells = sequence[isSequence ? tick % sequence.length : 0];
  const animId = iconId(cells);
  const css = keyframesFor(cells);
  // Sequences play each icon once and hold its faded-out final frame
  // (`forwards`) until the next remount; a single icon loops forever.
  const iteration = isSequence ? '1 forwards' : 'infinite';

  // Map the VIEWBOX coordinate space down to the rendered size.
  const px = typeof size === 'number' ? size : parseFloat(size);
  const scaleFactor = px / VIEWBOX;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        lineHeight: 0,
        overflow: 'clip',
        position: 'relative',
        ...style
      }}
      {...rest}>
      {playing ? <style>{css}</style> : null}
      {/* VIEWBOX → size scale, mapping the 1000-unit coordinate space to `size`.
          Keyed by `tick` so each sequence swap remounts and restarts cleanly. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: VIEWBOX,
          height: VIEWBOX,
          transformOrigin: '0 0',
          transform: `scale(${scaleFactor})`
        }}>
        {cells.map((c, i) => (
          // When not playing, cells render with no animation — at their
          // settled position (left/top) and fully opaque, i.e. the
          // fully-assembled poster pose.
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.cx - CELL / 2,
              top: c.cy - CELL / 2,
              width: CELL,
              height: CELL,
              backgroundColor: color,
              ...(playing && {
                animation:
                  `${animId}-${i}-y ${duration}ms linear ${iteration}, ` +
                  `${animId}-${i}-o ${duration}ms linear ${iteration}`,
                willChange: 'transform, opacity'
              })
            }}
          />
        ))}
      </div>
    </div>
  );
}
