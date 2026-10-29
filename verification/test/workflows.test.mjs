/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {adapterId, fromTLC, initial, validateTrace} from '../use-press/replay.mjs';
import assert from 'node:assert/strict';
import {assessMutation, assessReplay, runReplay, runValidation} from '../workflows.mjs';
import {fileURLToPath} from 'node:url';
import {fingerprints} from '../runner.mjs';
import {join} from 'node:path';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {readPackage} from '../metadata.mjs';
import {test} from 'node:test';
import {tmpdir} from 'node:os';

const root = fileURLToPath(new URL('../..', import.meta.url));
const metadata = readPackage(root, 'use-press');
const trace = () => ({
  schemaVersion: 1,
  package: 'use-press',
  adapter: adapterId,
  property: 'PointerOwnership',
  initial,
  actions: ['PointerDown', 'OtherPointerDown', 'OtherPointerCancel'].map(type => ({type}))
});
const passed = {
  outcome: 'implementation-checks-pass',
  testNames: ['target assertion'],
  counts: {passed: 1, failed: 0, skipped: 0}
};
const control = {id: 'defect', testNamePattern: 'target', failureMarker: 'intended assertion'};
const failed = {
  ...passed,
  outcome: 'implementation-failure',
  counts: {passed: 0, failed: 1, skipped: 0},
  failures: [{name: 'target assertion', messages: ['AssertionError: intended assertion']}]
};
const receipt = {
  schemaVersion: 1,
  mutation: 'defect',
  source: 'source.ts',
  originalHash: 'a'.repeat(64),
  mutatedHash: 'b'.repeat(64)
};

function workspace(t) {
  let directory = mkdtempSync(join(tmpdir(), 'verification-workflows-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  return directory;
}

test('TLC conversion requires action labels and sequential bounded steps', () => {
  let actions = ['Init', ...trace().actions.map(action => action.type)];
  let log =
    actions
      .map(
        (action, index) =>
          `State ${index + 1}: <Next>\n/\\ action = "${action}"\n/\\ step = ${index}\n`
      )
      .join('\n') + '19 states generated\n';
  assert.deepEqual(fromTLC(log, 'PointerOwnership'), trace());
  assert.throws(
    () =>
      fromTLC(
        log.replace('/\\ action = "PointerDown"', '/\\ unsupported = TRUE'),
        'PointerOwnership'
      ),
    /action labels/
  );
  assert.throws(
    () => fromTLC(log.replace('/\\ step = 2', '/\\ step = 5'), 'PointerOwnership'),
    /sequential/
  );
  assert.throws(() => fromTLC(log, 'NotAProperty'), /Unsupported/);
});

test('replay rejects unsupported formats, parameters, and impossible input ordering', () => {
  for (let mutate of [
    value => (value.schemaVersion = 2),
    value => (value.package = 'other'),
    value => (value.initial.isDisabled = true),
    value => (value.actions[0].pointerId = 7),
    value => (value.actions[0].type = 'Eval'),
    value => value.actions.splice(1, 1),
    value => (value.actions = [{type: 'Enable'}]),
    value => (value.actions = Array(9).fill({type: 'OtherPointerDown'}))
  ]) {
    let value = structuredClone(trace());
    mutate(value);
    assert.throws(() => validateTrace(value));
  }
  assert.doesNotThrow(() =>
    validateTrace({
      ...trace(),
      property: 'CleanupComplete',
      actions: ['PointerDown', 'PointerUp', 'Disable'].map(type => ({type}))
    })
  );
});

test('replay requires observed actions and failure of the trace property, not just a failed process', () => {
  let value = trace();
  let evidence = {
    schemaVersion: 1,
    property: value.property,
    inputMode: 'synthetic',
    limitation: null,
    observations: value.actions.map((action, index) => ({action: action.type, step: index + 1})),
    violation: {property: value.property, step: 3}
  };
  let check = {
    ...failed,
    failures: [
      {
        name: 'counterexample replay',
        messages: ['AssertionError: verification:replay:PointerOwnership']
      }
    ]
  };
  assert.equal(assessReplay(check, evidence, value), 'reproduced');
  assert.equal(
    assessReplay({...check, outcome: 'infrastructure-error'}, evidence, value),
    'infrastructure-error'
  );
  assert.equal(assessReplay(failed, evidence, value), 'infrastructure-error');
  assert.equal(assessReplay(check, {...evidence, observations: []}, value), 'infrastructure-error');
  assert.equal(assessReplay(passed, {...evidence, violation: null}, value), 'not-reproduced');
  assert.equal(
    assessReplay(
      {outcome: 'infrastructure-error'},
      {limitation: 'Unsupported replay: no timer'},
      value
    ),
    'unsupported'
  );
});

test('mutation detection requires matching baseline/restored tests, an applied source defect, and the intended assertion', () => {
  let assess = (before = passed, mutant = failed, after = passed, applied = receipt) =>
    assessMutation(control, before, mutant, after, applied, 'a'.repeat(64), 'source.ts');
  assert.equal(assess(), 'detected');
  assert.equal(assess(failed), 'baseline-failure');
  assert.equal(assess(passed, passed), 'survived');
  assert.equal(assess(passed, failed, failed), 'inconclusive');
  assert.equal(
    assess(passed, failed, passed, {...receipt, originalHash: 'wrong'}),
    'infrastructure-error'
  );
  assert.equal(
    assess(passed, failed, passed, {...receipt, mutatedHash: receipt.originalHash}),
    'infrastructure-error'
  );
  assert.equal(assess(passed, {...failed, testNames: ['different test']}), 'inconclusive');
  assert.equal(
    assess(passed, {
      ...failed,
      failures: [{name: 'target assertion', messages: ['AssertionError: something else']}]
    }),
    'unexpected-failure'
  );
  assert.equal(assess(passed, {...failed, outcome: 'infrastructure-error'}), 'inconclusive');
});

function simulatedRun(directory, mutate = () => {}) {
  let calls = [];
  let run = async (_root, _metadata, options) => {
    calls.push(options.mode);
    let path = join(directory, `run-${calls.length}`);
    mkdirSync(path);
    let prepared = options.prepare ? await options.prepare(path) : null;
    let result = {
      directory: path,
      checks: [{...passed}],
      exitCode: 0,
      provenance: {valid: true, files: fingerprints(root, metadata)},
      correspondence: {status: 'needs-review'}
    };
    if (options.mode === 'mutation') {
      let id = prepared.environment.USE_PRESS_MUTATION;
      let selected = metadata.validation.mutations.find(control => control.id === id);
      result.checks = [
        {
          ...failed,
          failures: [
            {
              name: 'target assertion',
              messages: [
                `AssertionError: ${prepared.environment.USE_PRESS_TRACE ? `verification:replay:${selected.property}` : selected.failureMarker}`
              ]
            }
          ]
        }
      ];
      result.exitCode = 1;
      writeFileSync(
        prepared.environment.USE_PRESS_MUTATION_RECEIPT,
        JSON.stringify({
          schemaVersion: 1,
          mutation: id,
          source: metadata.validation.source,
          originalHash: result.provenance.files[metadata.validation.source],
          mutatedHash: 'b'.repeat(64)
        })
      );
    }
    if (options.checks?.[0]?.testNamePattern) {
      let name = options.checks[0].testNamePattern + ' assertion';
      result.checks[0].testNames = [name];
      result.checks[0].failures = result.checks[0].failures?.map(failure => ({...failure, name}));
    }
    await mutate(result, options, prepared);
    return result;
  };
  return {run, calls};
}

test('validation runs clean/mutated/restored checks and a final baseline without changing review metadata', async t => {
  let directory = workspace(t);
  let reviewPath = join(root, 'verification/use-press/review.json');
  let before = readFileSync(reviewPath, 'utf8');
  let {run, calls} = simulatedRun(directory);
  let result = await runValidation(root, metadata, {property: 'ActivationUnique'}, {run});
  assert.deepEqual(calls, [
    'validation-baseline',
    'mutation-baseline',
    'mutation',
    'mutation-restored',
    'mutation-baseline',
    'mutation',
    'mutation-restored',
    'validation-restored'
  ]);
  assert.equal(result.validation.controls[0].outcome, 'detected');
  assert.equal(result.exitCode, 0);
  assert.equal(readFileSync(reviewPath, 'utf8'), before);
});

test('a failing targeted baseline skips the mutation and still runs restoration checks', async t => {
  let {run, calls} = simulatedRun(workspace(t), (result, options) => {
    if (options.mode === 'mutation-baseline') result.checks = [{...failed}];
  });
  let result = await runValidation(root, metadata, {property: 'ActivationUnique'}, {run});
  assert.ok(!calls.includes('mutation'));
  assert.ok(calls.includes('mutation-restored'));
  assert.equal(calls.at(-1), 'validation-restored');
  assert.equal(result.validation.controls[0].outcome, 'baseline-failure');
  assert.equal(result.exitCode, 2);
});

test('source drift between phases invalidates otherwise detected mutations', async t => {
  let {run} = simulatedRun(workspace(t), (result, options) => {
    if (options.mode === 'mutation')
      result.provenance.files[metadata.validation.source] = 'c'.repeat(64);
  });
  let result = await runValidation(root, metadata, {property: 'ActivationUnique'}, {run});
  assert.equal(result.provenance.valid, false);
  assert.equal(result.exitCode, 2);
});

test('replay minimization only keeps valid candidates reproducing the same property', async t => {
  let directory = workspace(t);
  let original = {...trace(), actions: [...trace().actions, {type: 'Unmount'}]};
  let path = join(directory, 'input.json');
  writeFileSync(path, JSON.stringify(original));
  let {run} = simulatedRun(directory, (result, _options, prepared) => {
    let value = JSON.parse(readFileSync(prepared.environment.USE_PRESS_TRACE, 'utf8'));
    let reproduces =
      value.actions.some(action => action.type === 'PointerDown') &&
      value.actions.some(action => action.type === 'OtherPointerCancel');
    let actions = value.actions.slice(
      0,
      reproduces
        ? value.actions.findIndex(action => action.type === 'OtherPointerCancel') + 1
        : undefined
    );
    let evidence = {
      schemaVersion: 1,
      property: value.property,
      inputMode: 'synthetic',
      limitation: null,
      observations: actions.map((action, index) => ({step: index + 1, action: action.type})),
      violation: reproduces ? {property: value.property, step: actions.length} : null
    };
    writeFileSync(prepared.environment.USE_PRESS_REPLAY_RESULT, JSON.stringify(evidence));
    result.checks = reproduces
      ? [
          {
            ...failed,
            failures: [
              {
                name: 'counterexample replay',
                messages: [`AssertionError: verification:replay:${value.property}`]
              }
            ]
          }
        ]
      : [{...passed}];
  });
  let result = await runReplay(root, metadata, {trace: path, minimize: true}, {run});
  assert.equal(result.replay.outcome, 'reproduced');
  assert.equal(result.replay.minimization.complete, true);
  assert.equal(result.replay.minimization.actions, 3);
  assert.equal(
    JSON.parse(readFileSync(result.replay.minimization.trace, 'utf8')).origin.kind,
    'minimized'
  );
  assert.equal(readFileSync(path, 'utf8'), JSON.stringify(original));
});
