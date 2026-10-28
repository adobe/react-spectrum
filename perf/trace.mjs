/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

const script = new Set([
  'EventDispatch',
  'FunctionCall',
  'TimerFire',
  'FireAnimationFrame',
  'FireIdleCallback',
  'RunMicrotasks',
  'EvaluateScript',
  'HandlePostMessage',
  'XHRReadyStateChange',
  'V8.Execute'
]);
const style = new Set(['UpdateLayoutTree', 'RecalculateStyles', 'ParseAuthorStyleSheet']);
const layout = new Set([
  'Layout',
  'HitTest',
  'UpdateLayerTree',
  'IntersectionObserverController::computeIntersections'
]);
const paint = new Set([
  'PrePaint',
  'Paint',
  'PaintImage',
  'Layerize',
  'Commit',
  'UpdateLayer',
  'CompositeLayers',
  'Decode Image'
]);

function classify(name) {
  if (/GC/.test(name)) {
    return 'gc';
  }
  if (script.has(name) || name.startsWith('v8.')) {
    return 'script';
  }
  if (style.has(name)) {
    return 'style';
  }
  if (layout.has(name)) {
    return 'layout';
  }
  return paint.has(name) ? 'paint' : null;
}

// Splits the renderer main thread's time inside the `bench:window` measure into
// script, style, layout, paint, GC, and other work, attributing each moment to the
// innermost trace event covering it (DevTools' self time). Events without their own
// category take their parent's; style and layout inside script are also counted as
// forced. Returns null when the trace has no measurement window.
export function summarizeTrace(trace) {
  let events = trace.traceEvents ?? trace;
  let begin = events.find(event => event.name === 'bench:window' && event.ph === 'b');
  let end = events.find(
    event =>
      event.name === 'bench:window' && event.ph === 'e' && event.id2?.local === begin?.id2?.local
  );
  if (!begin || !end) {
    return null;
  }
  let slices = events
    .filter(
      event =>
        event.ph === 'X' &&
        event.pid === begin.pid &&
        event.tid === begin.tid &&
        event.dur > 0 &&
        event.ts < end.ts &&
        event.ts + event.dur > begin.ts
    )
    .map(event => ({name: event.name, start: event.ts, end: event.ts + event.dur, children: []}))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  let roots = [];
  let stack = [];
  for (let slice of slices) {
    while (stack.length && stack.at(-1).end <= slice.start) {
      stack.pop();
    }
    let parent = stack.at(-1);
    if (parent) {
      // Rounded timestamps can overhang the parent slightly.
      slice.end = Math.min(slice.end, parent.end);
      parent.children.push(slice);
    } else {
      roots.push(slice);
    }
    stack.push(slice);
  }
  let totals = {script: 0, style: 0, layout: 0, paint: 0, gc: 0, other: 0, forced: 0};
  let clipped = (from, to) => Math.max(0, Math.min(to, end.ts) - Math.max(from, begin.ts));
  let visit = (slice, inherited, inScript) => {
    let own = classify(slice.name);
    let bucket = inherited === 'gc' ? 'gc' : (own ?? inherited ?? 'other');
    let self = 0;
    let cursor = slice.start;
    for (let child of slice.children) {
      self += clipped(cursor, child.start);
      cursor = Math.max(cursor, child.end);
    }
    self += clipped(cursor, slice.end);
    totals[bucket] += self;
    if (inScript && (bucket === 'style' || bucket === 'layout')) {
      totals.forced += self;
    }
    for (let child of slice.children) {
      visit(child, bucket, inScript || bucket === 'script');
    }
  };
  for (let root of roots) {
    visit(root, null, false);
  }
  let ms = value => value / 1000;
  let busy = totals.script + totals.style + totals.layout + totals.paint + totals.gc + totals.other;
  let window = end.ts - begin.ts;
  return {
    window: ms(window),
    busy: ms(busy),
    idle: ms(window - busy),
    script: ms(totals.script),
    style: ms(totals.style),
    layout: ms(totals.layout),
    forcedStyleLayout: ms(totals.forced),
    paint: ms(totals.paint),
    gc: ms(totals.gc),
    other: ms(totals.other)
  };
}
