/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {summarizeTrace} from '../trace.mjs';
import {test} from 'node:test';

// Trace timestamps are microseconds; these helpers take milliseconds.
const slice = (name, start, end, tid = 1) => ({
  name,
  ph: 'X',
  pid: 1,
  tid,
  ts: start * 1000,
  dur: (end - start) * 1000
});
const window = (start, end) => [
  {name: 'bench:window', ph: 'b', pid: 1, tid: 1, id2: {local: '0x1'}, ts: start * 1000},
  {name: 'bench:window', ph: 'e', pid: 1, tid: 1, id2: {local: '0x1'}, ts: end * 1000}
];

test('main-thread time is split by the innermost event within the window', () => {
  let summary = summarizeTrace({
    traceEvents: [
      ...window(0, 110),
      // A task that starts before and ends after the window.
      slice('ThreadControllerImpl::RunTask', -10, 120),
      slice('EventDispatch', 0, 100),
      slice('FunctionCall', 10, 90),
      slice('Layout', 20, 30),
      slice('MinorGC', 40, 50),
      slice('V8.GC_SCAVENGER', 41, 49),
      slice('Paint', 100, 105),
      // Another thread's work is ignored.
      slice('FunctionCall', 0, 110, 2)
    ]
  });
  assert.deepEqual(summary, {
    window: 110,
    busy: 110,
    idle: 0,
    script: 80,
    style: 0,
    layout: 10,
    forcedStyleLayout: 10,
    paint: 5,
    gc: 10,
    other: 5
  });
});

test('style and layout outside script are not forced, and idle time is kept', () => {
  let summary = summarizeTrace([
    ...window(0, 50),
    slice('UpdateLayoutTree', 10, 14),
    slice('Layout', 14, 20),
    slice('FunctionCall', 30, 40)
  ]);
  assert.equal(summary.style, 4);
  assert.equal(summary.layout, 6);
  assert.equal(summary.forcedStyleLayout, 0);
  assert.equal(summary.script, 10);
  assert.equal(summary.idle, 30);
});

test('traces without a measurement window have no summary', () => {
  assert.equal(summarizeTrace({traceEvents: [slice('FunctionCall', 0, 10)]}), null);
});
