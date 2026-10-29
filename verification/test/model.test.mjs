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
import {checkModel, conformModel, coverModel, fromTla, loadModel, toTla} from '../model.mjs';
import {defineTarget, explore, runTests} from '../explorer.mjs';
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

// `hidden` is model state the View does not show; the defaults never change it.
function counterModel(
  t,
  {
    release = "count' = count - 1",
    acquire = "count' = count + 1",
    guard = 'count < 2',
    init = 'count = 0',
    hidden = 'hidden = 0',
    coverage
  } = {}
) {
  let directory = mkdtempSync(join(tmpdir(), 'verification-model-test-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  writeFileSync(
    join(directory, 'Counter.tla'),
    `---- MODULE Counter ----
EXTENDS Integers
CONSTANT MaxSteps
VARIABLES count, hidden, step, action
vars == <<count, hidden, step, action>>
Init == ${init} /\\ ${hidden} /\\ step = 0 /\\ action = "Init"
Next ==
  /\\ step < MaxSteps
  /\\ step' = step + 1
  /\\ hidden' = hidden
  /\\ \\/ (${guard} /\\ ${acquire} /\\ action' = "acquire")
     \\/ (${release} /\\ action' = "release")
View == [count |-> count]
NonNegative == count >= 0
BelowTwo == count < 2
${coverage ? `Coverage == ${coverage}` : ''}
====
`
  );
  return loadModel(directory, 'Counter.tla');
}

async function paths() {
  return (await explore(target, env, {invariants: false, collect: true})).paths;
}

test('TLA+ values are converted from JSON', () => {
  assert.equal(toTla({b: [1, 'x'], a: {c: true}}), '[a |-> [c |-> TRUE], b |-> <<1, "x">>]');
  assert.throws(() => toTla(1.5), /integers/);
  assert.throws(() => toTla({}), /empty record/);
  assert.throws(() => toTla(null), /project/);
});

test('TLA+ values are converted back to JSON', async () => {
  let {check} = await import('tla-ts');
  let result = await check({
    source: `---- MODULE Values ----
VARIABLE x
Init == x = [a |-> <<3, 1>>, b |-> {"p"}, c |-> <<>>, d |-> [k |-> TRUE]]
Next == UNCHANGED x
Inv == x.a = <<>>
====`,
    config: 'INIT Init\nNEXT Next\nINVARIANT Inv\n',
    workers: 1
  });
  assert.deepEqual(fromTla(result.violation.trace[0].state.x), {
    a: [3, 1],
    b: ['p'],
    c: [],
    d: {k: true}
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
  assert.deepEqual(result.violations[1].views, [{count: 0}, {count: 1}, {count: 2}]);
  assert.ok(result.violations.every(item => !('verifyView' in item.observations[0])));

  let missing = await checkModel(
    {...target, model: {...target.model, invariants: ['Nope']}},
    counterModel(t)
  );
  assert.equal(missing.status, 'error');
});

test('collected paths include transitions back to already-seen states', async () => {
  let collected = await paths();
  assert.ok(collected.some(path => path.actions.join() === 'acquire,release'));
  assert.deepEqual(collected[0], {
    actions: [],
    observations: [{count: 0}],
    enabled: ['acquire', 'release']
  });
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

  let extra = await conformModel(target, counterModel(t, {guard: 'count < 3'}), collected);
  assert.equal(extra.status, 'mismatch');
  assert.equal(extra.mismatch.kind, 'extra');
  assert.equal(extra.mismatch.action, 'acquire');
  assert.deepEqual(extra.mismatch.actions, ['acquire', 'acquire']);
  assert.match(extra.mismatch.detail, /model allows acquire after acquire -> acquire/);

  let start = await conformModel(target, counterModel(t, {init: 'count = 5'}), collected);
  assert.equal(start.status, 'mismatch');
  assert.deepEqual(start.mismatch.actions, []);
  assert.match(start.mismatch.detail, /^after setup, count is 0 in the code but 5 in the model/);
});

test('conform accepts a nondeterministic model when one of its behaviors matches', async t => {
  let collected = await paths();
  let either = await conformModel(
    target,
    counterModel(t, {acquire: "(count' = count + 1 \\/ count' = count + 2)"}),
    collected
  );
  assert.equal(either.status, 'conforms');

  // Both branches look the same, but only one can release afterwards.
  let hidden = await conformModel(
    target,
    counterModel(t, {
      hidden: 'hidden \\in {0, 1}',
      release: "hidden = 0 /\\ count' = count - 1"
    }),
    collected
  );
  assert.equal(hidden.status, 'conforms');

  let neither = await conformModel(
    target,
    counterModel(t, {acquire: "(count' = count + 2 \\/ count' = count + 3)"}),
    collected
  );
  assert.equal(neither.status, 'mismatch');
  assert.equal(neither.mismatch.kind, 'state');
  assert.deepEqual(neither.mismatch.actions, ['acquire']);
});

// Release is unguarded, so count is unbounded below; Coverage merges negatives.
const negatives = 'IF count < 0 THEN -1 ELSE count';

test('cover generates tests that take every transition between coverage states', async t => {
  let result = await coverModel(target, counterModel(t, {coverage: negatives}));
  assert.equal(result.status, 'generated');
  assert.equal(result.coverageStates, 4);
  assert.equal(result.transitions, 7);
  assert.deepEqual(result.tests.map(actions => actions.join()).sort(), [
    'acquire,acquire,release',
    'acquire,release',
    'release,acquire',
    'release,release'
  ]);
  assert.equal(result.longest, 3);
  assert.equal(result.truncated, false);

  let shallow = await coverModel(target, counterModel(t, {coverage: negatives}), {depth: 2});
  assert.equal(shallow.truncated, true);

  let missing = await coverModel(target, counterModel(t));
  assert.equal(missing.status, 'error');
  assert.match(missing.error, /no Coverage operator/);
});

test('cover runs its tests on the code and checks them for conformance', async t => {
  let model = counterModel(t, {coverage: negatives});
  let executed = await runTests(target, env, (await coverModel(target, model)).tests);
  assert.equal(executed.status, 'passed');
  assert.equal(executed.runs, 4);
  assert.equal(executed.disabled, 0);
  assert.equal((await conformModel(target, model, executed.paths)).status, 'conforms');

  // A model that allows a third acquire generates a test the code cannot take.
  let looser = counterModel(t, {guard: 'count < 3', coverage: negatives});
  let truncated = await runTests(target, env, (await coverModel(target, looser)).tests);
  assert.equal(truncated.disabled, 1);
  let extra = await conformModel(target, looser, truncated.paths);
  assert.equal(extra.status, 'mismatch');
  assert.equal(extra.mismatch.kind, 'extra');
  assert.deepEqual(extra.mismatch.actions, ['acquire', 'acquire']);
});

test('model operations respect the shared run deadline', async t => {
  let model = counterModel(t);
  let deadline = after => {
    let calls = 0;
    return () => {
      if (calls++ < after) return;
      let error = new Error('deadline');
      error.name = 'TimeoutError';
      throw error;
    };
  };
  let none = await checkModel(target, model, {checkDeadline: deadline(0)});
  assert.equal(none.status, 'timed-out');
  assert.deepEqual(none.invariants, []);
  // The first invariant's counterexample is kept when time runs out before the second.
  let partial = await checkModel(target, model, {checkDeadline: deadline(1)});
  assert.equal(partial.status, 'timed-out');
  assert.deepEqual(
    partial.violations.map(item => item.invariant),
    ['NonNegative']
  );
  await assert.rejects(conformModel(target, model, await paths(), {checkDeadline: deadline(0)}), {
    name: 'TimeoutError'
  });
  await assert.rejects(
    coverModel(target, counterModel(t, {coverage: negatives}), {checkDeadline: deadline(0)}),
    {name: 'TimeoutError'}
  );
});
