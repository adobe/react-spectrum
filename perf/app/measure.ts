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

interface ArmOptions {
  event: 'pointerdown' | 'pointerover' | 'keydown' | 'wheel';
  target: string;
  key?: string;
  conditions: Condition[];
  frames?: boolean;
  eventCount?: number;
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
  visibility: DocumentVisibilityState;
  inputEvents: number;
  layout?: ReturnType<typeof readLayout>;
}

let events: Sample['events'] = [];
let observer: PerformanceObserver | undefined;
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
    sample.inputEvents < (armed.eventCount ?? 1) ||
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
      }
    })
  );
}

function observe() {
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
document.addEventListener('focusin', () => queueMicrotask(observe), true);
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
  if (
    armed.layout &&
    !finishing &&
    sample.inputEvents >= (armed.eventCount ?? 1) &&
    matches(armed.conditions)
  ) {
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
    visibility: document.visibilityState,
    inputEvents: 1
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
    events = [];
    armed = undefined;
    sample = undefined;
    lastFrame = undefined;
    finishing = false;
    previousLayout = undefined;
    stableLayoutFrames = 0;
    frameOnly = false;
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
    return {
      ...sample,
      events: events.filter(
        event => event.startTime >= sample!.start && event.startTime <= sample!.renderingOpportunity
      )
    };
  }
};
