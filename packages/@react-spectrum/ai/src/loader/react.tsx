/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// React pixel-fall loader. Renders plain HTML divs and lets the browser
// drive the animation natively via generated CSS @keyframes. Multi-icon
// sequences (presets) play one icon per 2.4s cycle and
// advance via a single timer — only the current icon's cells are in the
// DOM. A single-icon loader stays a pure infinite CSS loop with no JS.

import {aiLogo, type Cell} from './data';
import * as React from 'react';

// Easing control points, formatted into `cubic-bezier(...)` in the
// generated keyframes. `fade` is intentionally near-linear — its control
// points lie on y=x. `scaleIn`/`scaleOut` drive the per-cell pop.
const EASE = {
  drop: [0.333, 0, 0.667, 1],
  recover: [0.333, 0, 0.833, 1],
  exit: [0.563, 0, 0.906, 0.757],
  fade: [0.167, 0.167, 0.833, 0.833],
  scaleIn: [0.505, 0.015, 0.42, 0.938],
  scaleOut: [0.538, 0.017, 0.851, 0.357]
};

const FPS = 30;
const ms2f = (ms: number) => (ms * FPS) / 1000;

// Timing model: every cell exits a constant `hold` after it settles, and the
// loop grows to fit. A cell settles DROP_SETTLE frames after its stagger, holds
// for HOLD_FRAMES, then takes EXIT_FALL frames to fall out of frame.
const DROP_SETTLE = 13; // frames from a cell's launch to its settled rest
const EXIT_FALL = 12; // frames for a cell to fall out of frame
const HOLD_FRAMES = ms2f(1400); // constant per-cell assembled hold (42 frames)

// Per-cell scale pop: entrance 10% → 100%, exit 100% → 30%. The entrance pop
// *completes* ENT_LEAD frames before the cell settles (so it finishes on-screen
// rather than while still clipped above the frame), and the exit shrink starts
// as the cell begins to fall away.
const ENT_DUR = ms2f(150);
const ENT_LEAD = ms2f(150);
const ENT_FLOOR = 0.1;
const EXIT_DUR = ms2f(230);
const EXIT_FLOOR = 0.3;

// Group opacity envelope, applied once to the cell-grid container (one
// compositing group, so overlapping cells never stack their alpha): fades
// 0 → peak → 0 across the loop.
const OP_FADE_IN = ms2f(400);
const OP_FADE_OUT = ms2f(400);

// Per-cell vertical offsets in the 24-unit space: start off
// the top, overshoot just past the settled position, exit off the bottom.
const Y_START = -26;
const Y_OVERSHOOT = 1;
const Y_EXIT = 26;

// A cell begins its exit fall a constant hold after it settles.
const exitStartOf = (c: Cell) => c.stagger + DROP_SETTLE + HOLD_FRAMES;

// Loop length grows with the icon's stagger spread so every cell gets the
// same settle → hold → exit cadence.
function loopFramesFor(cells: Cell[]): number {
  let maxStagger = 1;
  for (const c of cells) {
    maxStagger = Math.max(maxStagger, c.stagger);
  }
  return maxStagger + DROP_SETTLE + HOLD_FRAMES + EXIT_FALL;
}

// The animation lives in a fixed VIEWBOX-sized coordinate space that is scaled down to the
// rendered `size`. Cells are absolutely positioned in this space, so all
// the translateY offsets below are in these units — identical to the old
// SVG viewBox math, just on HTML elements the compositor can accelerate.
const VIEWBOX = 480;
const CELL = VIEWBOX / 12;

// ─────────────────────────────────────────────────────────────
// CSS @keyframes generation. Each piecewise segment of the motion
// becomes one keyframe stop whose `animation-timing-function` is the
// matching cubic-bezier (from EASE), so the browser interpolates the
// drop/recover/exit/fade curves natively.
// ─────────────────────────────────────────────────────────────

function pct(frame, total) {
  // Frame → keyframe offset percentage, trimmed of noise.
  return `${+((frame / total) * 100).toFixed(4)}%`;
}

function cb(coeffs) {
  return `cubic-bezier(${coeffs.join(',')})`;
}

// stops: ordered [{f, decl, ease}]. `decl` is the CSS declarations for
// that stop; `ease` (optional) is the timing function for the segment
// starting at it. Stops sharing a frame are de-duped (first wins).
type Stop = {f: number; decl: string; ease?: readonly number[] | null};

function emitKeyframes(name: string, stops: Stop[], total: number) {
  let body = '';
  let lastPct: string | null = null;
  for (const s of stops) {
    const p = pct(s.f, total);
    if (p === lastPct) continue;
    lastPct = p;
    const ease = s.ease ? `animation-timing-function:${cb(s.ease)};` : '';
    body += `${p}{${s.decl}${ease}}`;
  }
  return `@keyframes ${name}{${body}}`;
}

// Use the individual `translate`/`scale` transform properties so the drop and
// the pop can animate on the same element without clobbering one another.
const ty = v => `translate:0 ${v}px;`;
const sc = v => `scale:${v};`;
const op = v => `opacity:${v};`;

function cellYKeyframes(name, c, total) {
  const s = c.stagger;
  const e = exitStartOf(c);
  const stops: Stop[] = [{f: 0, decl: ty(Y_START), ease: s > 0 ? null : EASE.drop}];
  if (s > 0) {
    stops.push({f: s, decl: ty(Y_START), ease: EASE.drop});
  }
  stops.push({f: s + 10, decl: ty(Y_OVERSHOOT), ease: EASE.recover});
  stops.push({f: s + DROP_SETTLE, decl: ty(0)}); // settled — hold until exit
  stops.push({f: e, decl: ty(0), ease: EASE.exit});
  stops.push({f: e + EXIT_FALL, decl: ty(Y_EXIT)});
  stops.push({f: total, decl: ty(Y_EXIT)}); // hold offscreen until wrap
  return emitKeyframes(name, stops, total);
}

// Per-cell scale pop, applied to the inner cell element (transform-origin
// center, so no layout shift). The entrance completes ENT_LEAD frames before
// the cell settles; the exit starts as the cell begins to fall away.
function cellScaleKeyframes(name, c, total) {
  const inEnd = c.stagger + DROP_SETTLE - ENT_LEAD;
  const inStart = inEnd - ENT_DUR;
  const outStart = exitStartOf(c);
  const outEnd = outStart + EXIT_DUR;
  return emitKeyframes(
    name,
    [
      {f: 0, decl: sc(0)},
      {f: inStart, decl: sc(ENT_FLOOR), ease: EASE.scaleIn},
      {f: inEnd, decl: sc(1)},
      {f: outStart, decl: sc(1), ease: EASE.scaleOut},
      {f: outEnd, decl: sc(EXIT_FLOOR)},
      {f: outStart + EXIT_FALL, decl: sc(0)},
      {f: total, decl: sc(0)}
    ],
    total
  );
}

// Group opacity envelope for the whole loader, applied once to the cell-grid
// container so overlapping cells never stack their alpha.
function groupOpacityKeyframes(name, total) {
  return emitKeyframes(
    name,
    [
      {f: 0, decl: op(0), ease: EASE.fade},
      {f: OP_FADE_IN, decl: op('var(--loader-opacity, 1)')},
      {f: total - OP_FADE_OUT, decl: op('var(--loader-opacity, 1)'), ease: EASE.fade},
      {f: total, decl: op(0)}
    ],
    total
  );
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
    const total = loopFramesFor(cells);
    css =
      cells
        .map(
          (c, i) =>
            cellYKeyframes(`${id}-${i}-y`, c, total) + cellScaleKeyframes(`${id}-${i}-s`, c, total)
        )
        .join('') + groupOpacityKeyframes(`${id}-group-o`, total);
    cssCache.set(cells, css);
  }
  return css;
}

export interface PixelLoaderProps {
  /**
   * Size of the loader in pixels. Multiples of 7 render evenly on the pixel grid.
   */
  size?: number;
  /**
   * Whether the animation is playing.
   */
  isPlaying?: boolean;
  /**
   * The icon or sequence of icons to display. These should be imported from
   * '@react-spectrum/ai/loader'.
   */
  icon?: Cell[] | Cell[][];
  /**
   * The color of the icon.
   *
   * @default 'currentColor'
   */
  color?: string;
  /**
   * A custom CSS class to apply.
   */
  className?: string;
}

export function PixelLoader(props: PixelLoaderProps) {
  const {
    size = 21,
    isPlaying: isPlayingProp = true,
    icon = aiLogo,
    color = 'currentColor',
    className,
    ...rest
  } = props;
  let isReducedMotion = useReducedMotion();
  let isPlaying = isReducedMotion ? false : isPlayingProp;

  // Normalize to a sequence.
  const sequence = React.useMemo(
    () => (Array.isArray(icon[0]) ? icon : [icon]) as Cell[][],
    [icon]
  );
  const isSequence = sequence.length > 1;

  // `tick` increments once per cycle; the current icon is `tick % len`.
  const [tick, setTick] = React.useState(0);

  // Restart from the first icon whenever the sequence changes.
  let [lastSequence, setLastSequence] = React.useState(sequence);
  if (lastSequence !== sequence) {
    setLastSequence(sequence);
    setTick(0);
  }

  const cells = sequence[isSequence ? tick % sequence.length : 0];
  // The loop length — and therefore the cycle duration — is dynamic: it grows
  // with the current icon's stagger spread so every cell shares one cadence.
  const duration = React.useMemo(() => (loopFramesFor(cells) / FPS) * 1000, [cells]);

  // Advance the sequence one icon per cycle while playing. Single-icon
  // loaders never start a timer — they're a pure infinite CSS loop.
  React.useEffect(() => {
    if (!isPlaying || !isSequence) {
      return undefined;
    }
    const id = setInterval(() => setTick(t => t + 1), duration);
    return () => clearInterval(id);
  }, [isPlaying, isSequence, duration, sequence]);

  const animId = iconId(cells);
  const css = keyframesFor(cells);
  // Sequences play each icon once and hold its faded-out final frame
  // (`forwards`) until the next remount; a single icon loops forever.
  const iteration = isSequence ? '1 forwards' : 'infinite';

  const cellSize = size / 7;
  const offset = (size - cellSize * 7) / 2;
  const matrix = React.useMemo(() => {
    let matrix = Array.from({length: 7}, () => Array.from({length: 7}, () => false));
    for (let c of cells) {
      let x = (c.cx - 120) / CELL;
      let y = (c.cy - 120) / CELL;
      matrix[y][x] = true;
    }
    return matrix;
  }, [cells]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        lineHeight: 0,
        position: 'relative',
        // @ts-ignore
        forcedColorAdjust: 'none',
        ...(isPlaying && {
          animation: `${animId}-group-o ${duration}ms linear ${iteration}`,
          willChange: 'opacity'
        })
      }}
      {...rest}>
      {isPlaying ? <style>{css}</style> : null}
      {cells.map((c, i) => {
        let x = (c.cx - 120) / CELL;
        let y = (c.cy - 120) / CELL;

        // Convex-corner rounding: round a corner only when both orthogonal neighbors toward it,
        // and the diagonal neighbor toward it, are all absent.
        let left = matrix[y][x - 1];
        let right = matrix[y][x + 1];
        let top = matrix[y - 1]?.[x];
        let bottom = matrix[y + 1]?.[x];
        let topLeft = matrix[y - 1]?.[x - 1];
        let topRight = matrix[y - 1]?.[x + 1];
        let bottomLeft = matrix[y + 1]?.[x - 1];
        let bottomRight = matrix[y + 1]?.[x + 1];
        let corner = (a, b, diag) => (!a && !b && !diag ? '1px' : '0px');

        // Adjust position for outer cells on high DPI displays.
        let xPx = x * cellSize + offset;
        let yPx = y * cellSize + offset;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: xPx,
              top: yPx,
              width: cellSize,
              height: cellSize,
              transformOrigin: 'center',
              borderRadius: `${corner(left, top, topLeft)} ${corner(right, top, topRight)} ${corner(right, bottom, bottomRight)} ${corner(left, bottom, bottomLeft)}`,
              backgroundColor: color,
              ...(isPlaying && {
                animation:
                  `${animId}-${i}-y ${duration}ms linear ${iteration}, ` +
                  `${animId}-${i}-s ${duration}ms linear ${iteration}`,
                willChange: 'transform'
              })
            }}
          />
        );
      })}
    </div>
  );
}

function useReducedMotion() {
  const [isReducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    let mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let update = () => {
      setReducedMotion(mq.matches);
    };

    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isReducedMotion;
}
