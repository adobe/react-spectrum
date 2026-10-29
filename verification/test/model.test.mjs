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

import assert from 'node:assert/strict';
import {checkModel, conformModel, loadModel, parseRecord, toTla} from '../model.mjs';
import {defineTarget, explore} from '../explorer.mjs';
import {join} from 'node:path';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {test} from 'node:test';
import {tmpdir} from 'node:os';

const env = {name: 'node', input: {hover: async () => {}, touch: async () => 2}};

// The real code: a ref count whose release is not guarded.
const target = defineTarget({
  name: 'counter',
  description: 'Toy ref count.',
  sources: ['counter.js'],
  bounds: {depth: 3},
  model: {spec: 'Counter.tla', project: observation => observation},
  setup: () => ({count: 0}),
  actions: {
    acquire: {enabled: ctx => ctx.count < 2, run: ctx => void ctx.count++},
    release: ctx => void ctx.count--
  },
  observe: ctx => ({count: ctx.count}),
  invariants: {
    NonNegative: ctx => ctx.count >= 0,
    BelowTwo: ctx => ctx.count < 2
  }
});

function counterModel(t, {release = "count' = count - 1", acquire = "count' = count + 1"} = {}) {
  let directory = mkdtempSync(join(tmpdir(), 'verification-model-test-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  writeFileSync(
    join(directory, 'Counter.tla'),
    `---- MODULE Counter ----
EXTENDS Integers
CONSTANT MaxSteps
VARIABLES count, step, action
vars == <<count, step, action>>
Init == count = 0 /\\ step = 0 /\\ action = "Init"
Next ==
  /\\ step < MaxSteps
  /\\ step' = step + 1
  /\\ \\/ (count < 2 /\\ ${acquire} /\\ action' = "acquire")
     \\/ (${release} /\\ action' = "release")
View == [count |-> count]
NonNegative == count >= 0
BelowTwo == count < 2
====
`
  );
  return loadModel(directory, 'Counter.tla');
}

async function paths() {
  return (await explore(target, env, {invariants: false, collect: true})).paths;
}

test('TLA+ values are converted from JSON and records are parsed back', () => {
  assert.equal(toTla({b: [1, 'x'], a: {c: true}}), '[a |-> [c |-> TRUE], b |-> <<1, "x">>]');
  assert.throws(() => toTla(1.5), /integers/);
  assert.throws(() => toTla({}), /empty record/);
  assert.throws(() => toTla(null), /project/);
  assert.deepEqual(parseRecord('[a |-> "x, y", b |-> <<1, 2>>, c |-> [d |-> TRUE]]'), {
    a: '"x, y"',
    b: '<<1, 2>>',
    c: '[d |-> TRUE]'
  });
});

test('check model-checks each invariant and returns replayable traces', async t => {
  let result = await checkModel(target, counterModel(t));
  assert.equal(result.status, 'violations');
  assert.deepEqual(
    result.invariants.map(item => [item.invariant, item.status]),
    [
      ['NonNegative', 'violated'],
      ['BelowTwo', 'violated']
    ]
  );
  let traces = Object.fromEntries(result.violations.map(item => [item.invariant, item.actions]));
  assert.deepEqual(traces, {NonNegative: ['release'], BelowTwo: ['acquire', 'acquire']});
  assert.equal(result.violations[0].origin, 'model');

  let missing = await checkModel(
    {...target, model: {...target.model, invariants: ['Nope']}},
    counterModel(t)
  );
  assert.equal(missing.status, 'error');
});

test('collected paths include transitions back to already-seen states', async () => {
  let collected = await paths();
  assert.ok(collected.some(path => path.actions.join() === 'acquire,release'));
  assert.deepEqual(collected[0], {actions: [], observations: [{count: 0}]});
});

test('conform passes when the model matches and pinpoints action and state mismatches', async t => {
  let collected = await paths();
  let conforms = await conformModel(target, counterModel(t), collected);
  assert.equal(conforms.status, 'conforms');

  let guarded = await conformModel(
    target,
    counterModel(t, {release: "count > 0 /\\ count' = count - 1"}),
    collected
  );
  assert.equal(guarded.status, 'mismatch');
  assert.equal(guarded.mismatch.kind, 'action');
  assert.deepEqual(guarded.mismatch.actions, ['release']);

  let wrong = await conformModel(
    target,
    counterModel(t, {acquire: "count' = count + 2"}),
    collected
  );
  assert.equal(wrong.status, 'mismatch');
  assert.equal(wrong.mismatch.kind, 'state');
  assert.deepEqual(wrong.mismatch.actions, ['acquire']);
  assert.deepEqual(wrong.mismatch.fields, [{field: 'count', model: '2', code: '1'}]);
});

test('model operations respect the shared run deadline', async t => {
  let model = counterModel(t);
  let options = {
    checkDeadline: () => {
      let error = new Error('deadline');
      error.name = 'TimeoutError';
      throw error;
    }
  };
  await assert.rejects(checkModel(target, model, options), {name: 'TimeoutError'});
  await assert.rejects(conformModel(target, model, await paths(), options), {name: 'TimeoutError'});
});
