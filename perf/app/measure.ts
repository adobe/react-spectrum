/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {layoutSignature, readLayout, settleLayout} from './layout.mjs';

export interface Condition {
  selector: string;
  count?: number;
  attribute?: string;
  value?: string;
  text?: string;
  focused?: boolean;
  activeDescendant?: string;
  scrollTop?: number;
  style?: {property: string; value: string};
  orderedValues?: {attribute: string; values: string[]};
}

interface EventEntry extends PerformanceEntry {
  interactionId: number;
  processingStart: number;
  processingEnd: number;
}

interface ScriptEntry {
  invoker: string;
  invokerType: string;
  sourceURL: string;
  sourceFunctionName: string;
  duration: number;
  forcedStyleAndLayoutDuration: number;
}

interface LongFrameEntry extends PerformanceEntry {
  blockingDuration: number;
  renderStart: number;
  styleAndLayoutStart: number;
  scripts: ScriptEntry[];
}

interface ArmOptions {
  event: 'pointerdown' | 'pointerover' | 'keydown' | 'wheel';
  target: string;
  key?: string;
  conditions: Condition[];
  frames?: boolean;
  layout?: {viewport: string; width: number; total: number; atTop?: boolean};
}

export interface Sample {
  start: number;
  semanticReady: number;
  renderingOpportunity: number;
  frameIntervals: number[];
  events: Array<{
    name: string;
    startTime: number;
    duration: number;
    interactionId: number;
    inputDelay: number;
    processing: number;
  }>;
  eventTimingSupported: boolean;
  longFrames: Array<{
    startTime: number;
    duration: number;
    blockingDuration: number;
    renderStart: number;
    styleAndLayoutStart: number;
    scripts: ScriptEntry[];
  }>;
  longFramesSupported: boolean;
  visibility: DocumentVisibilityState;
  inputEvents: number;
  // DOM work the action caused before the rendering opportunity: mutation records,
  // plus nodes added and removed. Unlike times, these barely vary between trials.
  mutations: number;
  nodesAdded: number;
  nodesRemoved: number;
  layout?: ReturnType<typeof readLayout>;
}

let events: Sample['events'] = [];
let observer: PerformanceObserver | undefined;
let longFrames: Sample['longFrames'] = [];
let frameObserver: PerformanceObserver | undefined;
let armed: ArmOptions | undefined;
let sample: Sample | undefined;
let lastFrame: number | undefined;
let frame = 0;
let finishing = false;
let previousLayout: string | undefined;
let stableLayoutFrames = 0;
// Conditions that read layout (scroll position, geometry) are only evaluated from
// the frame loop, so DOM mutations inside the window never force synchronous layout.
let frameOnly = false;
// Diagnostic trace reruns mark the measurement window with User Timing measures, so
// traces show exactly what the score covered. Measured trials never add them.
const marking = new URLSearchParams(location.search).has('trace');

const eventTimingSupported = PerformanceObserver.supportedEntryTypes.includes('event');
if (eventTimingSupported) {
  observer = new PerformanceObserver(list => collect(list.getEntries() as EventEntry[]));
  observer.observe({
    type: 'event',
    buffered: true,
    durationThreshold: 16
  } as PerformanceObserverInit);
}

function collect(entries: EventEntry[]) {
  for (let entry of entries) {
    if (entry.interactionId > 0) {
      events.push({
        name: entry.name,
        startTime: entry.startTime,
        duration: entry.duration,
        interactionId: entry.interactionId,
        inputDelay: entry.processingStart - entry.startTime,
        processing: entry.processingEnd - entry.processingStart
      });
    }
  }
}

// Long Animation Frames attribute slow frames to script, style/layout, and rendering.
// The browser reports only frames of at least 50 ms, and scripts of at least 5 ms.
const longFramesSupported =
  PerformanceObserver.supportedEntryTypes.includes('long-animation-frame');
if (longFramesSupported) {
  frameObserver = new PerformanceObserver(list =>
    collectFrames(list.getEntries() as LongFrameEntry[])
  );
  frameObserver.observe({type: 'long-animation-frame', buffered: true});
}

function collectFrames(entries: LongFrameEntry[]) {
  for (let entry of entries) {
    longFrames.push({
      startTime: entry.startTime,
      duration: entry.duration,
      blockingDuration: entry.blockingDuration,
      renderStart: entry.renderStart,
      styleAndLayoutStart: entry.styleAndLayoutStart,
      scripts: entry.scripts.map(script => ({
        invoker: script.invoker,
        invokerType: script.invokerType,
        sourceURL: script.sourceURL,
        sourceFunctionName: script.sourceFunctionName,
        duration: script.duration,
        forcedStyleAndLayoutDuration: script.forcedStyleAndLayoutDuration
      }))
    });
  }
}

function matches(conditions: Condition[]) {
  return conditions.every(condition => {
    let nodes = document.querySelectorAll<HTMLElement>(condition.selector);
    if (condition.count !== undefined && nodes.length !== condition.count) {
      return false;
    }
    if (condition.orderedValues) {
      let {attribute, values} = condition.orderedValues;
      if (
        nodes.length !== values.length ||
        [...nodes].some((node, i) => node.getAttribute(attribute) !== values[i])
      ) {
        return false;
      }
    }
    let node = nodes[0];
    if (!node) {
      return condition.count === 0;
    }
    return (
      (!condition.attribute || node.getAttribute(condition.attribute) === condition.value) &&
      (condition.text === undefined || node.textContent === condition.text) &&
      (!condition.style ||
        node.style.getPropertyValue(condition.style.property) === condition.style.value) &&
      // Fixtures live in the top-level document, with no shadow roots.
      // oxlint-disable-next-line rsp-rules/shadow-safe-active-element
      (!condition.focused || node === document.activeElement) &&
      (!condition.activeDescendant ||
        node.getAttribute('aria-activedescendant') ===
          document.querySelector(condition.activeDescendant)?.id) &&
      (condition.scrollTop === undefined || node.scrollTop >= condition.scrollTop)
    );
  });
}

function check(layoutReady = false) {
  if (
    !sample ||
    !armed ||
    finishing ||
    (armed.layout && !layoutReady) ||
    !matches(armed.conditions)
  ) {
    return;
  }
  finishing = true;
  sample.semanticReady = performance.now();
  // This is a rendering-opportunity proxy, not a claim about presented pixels.
  // Waiting two frames also keeps a commit observed inside rAF from ending early.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (sample) {
        sample.renderingOpportunity = performance.now();
        cancelAnimationFrame(frame);
        if (marking) {
          performance.measure('bench:ready', {start: sample.start, end: sample.semanticReady});
          performance.measure('bench:window', {
            start: sample.start,
            end: sample.renderingOpportunity
          });
        }
      }
    })
  );
}

function observe(records: MutationRecord[] = []) {
  if (sample && !sample.renderingOpportunity) {
    sample.mutations += records.length;
    for (let record of records) {
      sample.nodesAdded += record.addedNodes.length;
      sample.nodesRemoved += record.removedNodes.length;
    }
  }
  if (!frameOnly) {
    check();
  }
}

new MutationObserver(observe).observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true
});
document.addEventListener('focusin', () => queueMicrotask(() => observe()), true);
document.addEventListener('visibilitychange', () => {
  if (sample && document.hidden) {
    sample.visibility = 'hidden';
  }
});

function tick(now: number) {
  if (!sample || !armed) {
    return;
  }
  if (armed.frames && lastFrame !== undefined) {
    sample.frameIntervals.push(now - lastFrame);
  }
  lastFrame = now;
  if (armed.layout && !finishing && matches(armed.conditions)) {
    let layout = readLayout(armed.layout);
    let signature = layout ? layoutSignature(layout) : undefined;
    stableLayoutFrames = signature && signature === previousLayout ? stableLayoutFrames + 1 : 1;
    previousLayout = signature;
    if (layout && stableLayoutFrames >= 3) {
      sample.layout = layout;
      check(true);
    }
  } else {
    if (armed.layout && !finishing) {
      previousLayout = undefined;
      stableLayoutFrames = 0;
    }
    check();
  }
  if (!sample.renderingOpportunity) {
    frame = requestAnimationFrame(tick);
  }
}

function start(event: Event) {
  if (!armed || event.type !== armed.event || !event.isTrusted) {
    return;
  }
  let target = event.composedPath()[0];
  if (!(target instanceof Element) || !target.closest(armed.target)) {
    return;
  }
  if (armed.key && (event as KeyboardEvent).key !== armed.key) {
    return;
  }
  if (sample) {
    sample.inputEvents++;
    return;
  }
  sample = {
    start: event.timeStamp,
    semanticReady: 0,
    renderingOpportunity: 0,
    frameIntervals: [],
    events: [],
    eventTimingSupported,
    longFrames: [],
    longFramesSupported,
    visibility: document.visibilityState,
    inputEvents: 1,
    mutations: 0,
    nodesAdded: 0,
    nodesRemoved: 0
  };
  frame = requestAnimationFrame(tick);
}

for (let event of ['pointerdown', 'pointerover', 'keydown', 'wheel']) {
  document.addEventListener(event, start, {capture: true, passive: true});
}

export const measurement = {
  settleLayout,
  arm(options: ArmOptions) {
    if (matches(options.conditions)) {
      throw new Error('Completion condition already holds before the action');
    }
    measurement.clear();
    armed = options;
    frameOnly =
      !!options.layout || options.conditions.some(condition => condition.scrollTop !== undefined);
  },
  clear() {
    cancelAnimationFrame(frame);
    observer?.takeRecords();
    frameObserver?.takeRecords();
    events = [];
    longFrames = [];
    armed = undefined;
    sample = undefined;
    lastFrame = undefined;
    finishing = false;
    previousLayout = undefined;
    stableLayoutFrames = 0;
    frameOnly = false;
    if (marking) {
      performance.clearMeasures();
    }
  },
  done() {
    return !!sample?.renderingOpportunity;
  },
  read(): Sample {
    if (!sample?.renderingOpportunity) {
      throw new Error('Measurement did not complete');
    }
    if (!armed || !matches(armed.conditions)) {
      throw new Error('The expected result did not remain correct after completion');
    }
    if (armed.layout) {
      let layout = readLayout(armed.layout);
      if (!layout || layoutSignature(layout) !== layoutSignature(sample.layout)) {
        throw new Error('The variable-height layout changed after completion.');
      }
    }
    collect((observer?.takeRecords() ?? []) as EventEntry[]);
    collectFrames((frameObserver?.takeRecords() ?? []) as LongFrameEntry[]);
    return {
      ...sample,
      events: events.filter(
        event => event.startTime >= sample!.start && event.startTime <= sample!.renderingOpportunity
      ),
      // A frame that began before the input event can still contain its handling.
      longFrames: longFrames.filter(
        frame =>
          frame.startTime + frame.duration >= sample!.start &&
          frame.startTime <= sample!.renderingOpportunity
      )
    };
  }
};
