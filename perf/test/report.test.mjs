/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {compare, metrics, percentile, report} from '../report.mjs';
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
