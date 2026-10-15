/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {
  binomialTail,
  compare,
  metrics,
  missedFrames,
  percentile,
  random,
  report,
  signedRankInterval
} from '../report.mjs';
import {test} from 'node:test';

function paired(base, candidate) {
  return base.flatMap((value, block) => [
    {block, arm: 'base', metrics: {opportunity: value}},
    {block, arm: 'candidate', metrics: {opportunity: candidate[block]}}
  ]);
}

test('missing Event Timing stays missing and events from one interaction are grouped', () => {
  let sample = {
    start: 100,
    semanticReady: 110,
    renderingOpportunity: 132,
    frameIntervals: [],
    events: []
  };
  assert.equal(metrics(sample).reportedInteractionMax, null);
  assert.equal(metrics(sample).frameP95, null);
  assert.equal(metrics(sample).frameMean, null);
  assert.equal(metrics(sample).ready, 10);
  assert.equal(metrics(sample).opportunity, 32);
  sample.events = [
    {interactionId: 7, duration: 16},
    {interactionId: 7, duration: 24},
    {interactionId: 9, duration: 16}
  ];
  assert.equal(metrics(sample).reportedInteractions, 2);
  assert.equal(metrics(sample).reportedInteractionMax, 24);
});

test('paired blocks account for a shared machine drift', () => {
  let base = [40, 60, 80, 100, 120, 140, 160, 180];
  let result = compare(
    paired(
      base,
      base.map(value => value + 40)
    ),
    'opportunity'
  );
  assert.equal(result.delta, 40);
  assert.deepEqual(result.interval, [40, 40]);
  assert.equal(result.verdict, 'regression detected');
  assert.equal(
    compare(
      paired(
        base,
        base.map(value => value - 30)
      ),
      'opportunity'
    ).verdict,
    'improvement detected'
  );
});

test('A/A is within threshold; a tiny percentage win is not declared meaningful', () => {
  let values = Array(8).fill(10);
  assert.equal(
    compare(paired(values, values), 'opportunity').verdict,
    'within practical threshold'
  );
  assert.equal(
    compare(paired(values, Array(8).fill(7)), 'opportunity').verdict,
    'within practical threshold'
  );
});

test('too few independent blocks remain inconclusive regardless of trial count', () => {
  let samples = paired([100, 100], [20, 20]);
  let result = compare(Array.from({length: 100}, () => samples).flat(), 'opportunity');
  assert.equal(result.verdict, 'inconclusive');
  assert.equal(result.interval, null);
});

test('large uncertainty is not mistaken for equivalence', () => {
  let result = compare(
    paired(Array(8).fill(100), [30, 40, 50, 80, 120, 150, 160, 170]),
    'opportunity'
  );
  assert.equal(result.verdict, 'inconclusive');
});

test('incomplete or non-finite pairs cannot generate a comparison', () => {
  assert.throws(() => compare([], 'opportunity'), /requires samples/);
  assert.throws(() => compare(paired([10], [20]).slice(0, 1), 'opportunity'), /complete/);
  assert.throws(() => compare(paired([10], [null]), 'opportunity'), /finite/);
  assert.throws(() => compare(paired([10], [NaN]), 'opportunity'), /finite/);
});

test('percentiles retain zero values and interpolate without changing inputs', () => {
  let values = [20, 0, 10, 30];
  assert.equal(percentile(values, 0.5), 15);
  assert.equal(percentile([], 0.95), null);
  assert.deepEqual(values, [20, 0, 10, 30]);
});

test('failed runs expose their error and never present partial samples as a win', () => {
  let result = {
    status: 'failed',
    error: 'Focus did not move',
    started: 'test',
    environment: {browser: 'test'},
    builds: {base: {name: 'base', versions: {react: 'test'}, source: {sha: '1234567890'}}},
    options: {blocks: 8, samples: 5, warmup: 2},
    samples: [],
    scenarios: []
  };
  let text = report(result);
  assert.match(text, /Focus did not move/);
  assert.match(text, /no comparison verdicts/);
  assert.equal(result.comparisons, undefined);
});

function completed(overrides = {}) {
  return {
    status: 'complete',
    started: 'test',
    environment: {browser: 'test'},
    builds: {
      base: {name: 'base', versions: {react: 'test'}, source: {sha: '1234567890'}},
      candidate: {name: 'candidate', versions: {react: 'test'}, source: {sha: '0987654321'}}
    },
    options: {blocks: 1, samples: 1, warmup: 0},
    samples: paired([0], [5]).map(sample => ({
      ...sample,
      scenario: 'listbox.mount',
      metrics: {...sample.metrics, ready: 0, reportedInteractionMax: null, frameMax: null}
    })),
    scenarios: [{id: 'listbox.mount'}],
    diagnostics: [],
    ...overrides
  };
}

test('runs in progress are reported as incomplete, not failed', () => {
  let result = completed({status: 'running', options: {blocks: 8, samples: 1, warmup: 0}});
  let text = report(result);
  assert.match(text, /IN PROGRESS \/ INCOMPLETE: 1 of 8 blocks saved/);
  assert.doesNotMatch(text, /FAILED/);
  assert.equal(result.comparisons, undefined);
});

test('a zero base median reports the relative change as unavailable', () => {
  let text = report(completed());
  assert.match(text, /\(n\/a\)/);
  assert.doesNotMatch(text, /undefined/);
});

test('trace failures are listed without invalidating a completed comparison', () => {
  let text = report(completed({diagnosticsError: 'Tracing was interrupted.'}));
  assert.match(text, /Traces incomplete: Tracing was interrupted\./);
  assert.doesNotMatch(text, /FAILED \/ INCOMPLETE/);
});

function longFrame(startTime, duration, rest = {}) {
  return {
    startTime,
    duration,
    blockingDuration: Math.max(0, duration - 50),
    renderStart: startTime + duration - 20,
    styleAndLayoutStart: startTime + duration - 12,
    scripts: [],
    ...rest
  };
}

test('long animation frames stay missing without entries and are summed when present', () => {
  let sample = {
    start: 0,
    semanticReady: 10,
    renderingOpportunity: 20,
    frameIntervals: [],
    events: [],
    longFrames: []
  };
  assert.equal(metrics(sample).longFrames, 0);
  assert.equal(metrics(sample).longFrameMax, null);
  assert.equal(metrics(sample).longFrameScript, null);
  sample.longFrames = [
    longFrame(0, 80, {
      scripts: [
        {invoker: 'BUTTON#mount.onclick', duration: 40, forcedStyleAndLayoutDuration: 6},
        {invoker: 'FrameRequestCallback', duration: 10, forcedStyleAndLayoutDuration: 0}
      ]
    }),
    longFrame(100, 60)
  ];
  let result = metrics(sample);
  assert.equal(result.longFrames, 2);
  assert.equal(result.longFrameMax, 80);
  assert.equal(result.longFrameBlocking, 40);
  assert.equal(result.longFrameScript, 50);
  assert.equal(result.longFrameStyleLayout, 24);
  assert.equal(result.longFrameForcedLayout, 6);
});

test('the report attributes long frames and counts trials without them', () => {
  let slow = {
    scenario: 'listbox.mount',
    arm: 'base',
    block: 0,
    longFramesSupported: true,
    longFrames: [
      longFrame(0, 90, {
        scripts: [
          {invoker: 'DIV#root.onpointerdown', duration: 60, forcedStyleAndLayoutDuration: 0}
        ]
      })
    ]
  };
  let fast = {...slow, block: 1, longFrames: []};
  let samples = [slow, fast].map(sample => ({
    ...sample,
    metrics: {
      ...metrics({
        start: 0,
        semanticReady: 0,
        renderingOpportunity: 0,
        frameIntervals: [],
        events: [],
        ...sample
      }),
      opportunity: 1
    }
  }));
  let text = report(
    completed({
      builds: {base: {name: 'base', versions: {react: 'test'}, source: {sha: '1234567890'}}},
      samples
    })
  );
  assert.match(text, /\| listbox\.mount \/ base \| 1\/2 \| 90\.00 ms \| 40\.00 ms \| 60\.00 ms \|/);
  assert.match(text, /`DIV#root\.onpointerdown`/);
});

test('missed frames count the periods each late interval skipped', () => {
  assert.equal(missedFrames([]), null);
  assert.equal(missedFrames([8.3, 8.4, 8.3, 8.2]), 0);
  // One interval spans three periods (two missed), another spans two (one missed).
  assert.equal(missedFrames([8.3, 8.3, 25, 8.4, 16.6, 8.3, 8.3]), 3);
});

test('scroll comparisons use the mean frame interval and the frame threshold', () => {
  let sample = {start: 0, semanticReady: 0, renderingOpportunity: 0, events: []};
  assert.equal(metrics({...sample, frameIntervals: [8, 8, 8, 16]}).frameMean, 10);
  let result = completed({
    options: {
      blocks: 1,
      samples: 1,
      warmup: 0,
      absoluteThreshold: 8,
      frameThreshold: 0.3,
      relativeThreshold: 0.05
    },
    scenarios: [{id: 'table.scroll', metric: 'frameMean'}],
    samples: paired([8.4], [8.6]).map(sample => ({
      ...sample,
      scenario: 'table.scroll',
      metrics: {
        frameMean: sample.metrics.opportunity,
        ready: 0,
        reportedInteractionMax: null,
        frameMax: null
      }
    }))
  });
  let text = report(result);
  // The relative threshold (5% of 8.4 ms) exceeds the 0.3 ms frame threshold.
  assert.ok(Math.abs(result.comparisons['table.scroll'].threshold - 0.42) < 1e-9);
  assert.match(text, /\| table\.scroll \| frameMean \|/);
});

test('signed-rank intervals use exact Walsh-average ranks for the block count', () => {
  let deltas = [1, 2, 3, 4, 5, 6, 7, 8];
  let {estimate, interval, confidence} = signedRankInterval(deltas);
  assert.equal(estimate, 4.5);
  // For 8 blocks, 95% trims 3 of 36 Walsh averages from each end (exact 96.1%).
  assert.deepEqual(interval, [2, 7]);
  assert.equal(confidence, 1 - 10 / 256);
  assert.deepEqual(signedRankInterval([1, 2, 3, 4, 5, 6]).interval, [1, 6]);
  assert.equal(signedRankInterval([1, 2, 3, 4, 5]).interval, null);
});

test('paired changes cancel drift between launches and keep A/A error near nominal', () => {
  let rng = random(11);
  let normal = () => Math.sqrt(-2 * Math.log(rng() || 1e-12)) * Math.cos(2 * Math.PI * rng());
  for (let drift of [0, 3]) {
    let excluded = 0;
    let runs = 300;
    for (let run = 0; run < runs; run++) {
      let samples = Array.from({length: 8}, (_, block) => {
        let shift = drift * normal();
        return ['base', 'candidate'].flatMap(arm =>
          Array.from({length: 5}, () => ({
            block,
            arm,
            // Mostly normal noise with occasional large stalls.
            metrics: {opportunity: 50 + shift + normal() + (rng() < 0.08 ? 20 * rng() : 0)}
          }))
        );
      }).flat();
      let {interval} = compare(samples, 'opportunity');
      excluded += interval[0] > 0 || interval[1] < 0;
    }
    // The exact 8-block interval has a 3.9% nominal error rate.
    assert.ok(excluded / runs < 0.07, `drift ${drift}: ${excluded}/${runs} excluded zero`);
  }
});

test('binomial tails give the chance of at least that many excluded intervals', () => {
  assert.equal(binomialTail(0, 10, 0.1), 1);
  assert.ok(Math.abs(binomialTail(10, 10, 0.5) - 1 / 1024) < 1e-12);
  assert.ok(Math.abs(binomialTail(2, 3, 0.5) - 0.5) < 1e-12);
});

test('reports show the achieved interval confidence', () => {
  let base = [40, 60, 80, 100, 120, 140, 160, 180];
  let text = report(
    completed({
      options: {blocks: 8, samples: 1, warmup: 0},
      samples: paired(
        base,
        base.map(value => value + 40)
      ).map(sample => ({
        ...sample,
        scenario: 'listbox.mount',
        metrics: {...sample.metrics, ready: 0, reportedInteractionMax: null, frameMax: null}
      }))
    })
  );
  assert.match(text, /40\.00 ms to 40\.00 ms \(96\.1%\) \| regression detected/);
});
