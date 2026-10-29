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
import {defineTarget, execute, explore, replay} from '../explorer.mjs';
import {discoverTargets, runTarget} from '../targets.mjs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {main} from '../cli.mjs';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {test} from 'node:test';
import {tmpdir} from 'node:os';

const env = {name: 'node', input: {hover: async () => {}}};

// A two-slot ref count whose release is not guarded, and a third action that
// is never enabled so coverage can report it.
function counter(overrides = {}) {
  return defineTarget({
    name: 'counter',
    description: 'Toy ref count.',
    sources: ['counter.js'],
    bounds: {depth: 4},
    setup: () => ({count: 0}),
    actions: {
      acquire: {enabled: ctx => ctx.count < 2, run: ctx => void ctx.count++},
      release: ctx => void ctx.count--,
      reset: {enabled: () => false, run: ctx => void (ctx.count = 0)}
    },
    observe: ctx => ({count: ctx.count}),
    invariants: {
      NonNegative: ctx => ctx.count >= 0 || `count is ${ctx.count}`,
      BelowTwo: ctx => ctx.count < 2
    },
    ...overrides
  });
}

function directory(t) {
  let path = mkdtempSync(join(tmpdir(), 'verification-explorer-test-'));
  t.after(() => rmSync(path, {recursive: true, force: true}));
  return path;
}

test('defineTarget rejects incomplete targets', () => {
  assert.throws(() => counter({name: 'Not Kebab'}), /kebab-case/);
  assert.throws(() => counter({bounds: {depth: 0}}), /depth/);
  assert.throws(() => counter({invariants: {}}), /invariant/);
  assert.throws(() => counter({actions: {broken: {}}}), /run function/);
});

test('explore reports the shortest trace per invariant and coverage gaps', async () => {
  let result = await explore(counter(), env);
  assert.equal(result.status, 'violations');
  let traces = Object.fromEntries(result.violations.map(item => [item.invariant, item]));
  assert.deepEqual(traces.NonNegative.actions, ['release']);
  assert.equal(traces.NonNegative.detail, 'count is -1');
  assert.deepEqual(traces.BelowTwo.actions, ['acquire', 'acquire']);
  assert.equal(traces.BelowTwo.detail, 'BelowTwo failed.');
  assert.deepEqual(traces.BelowTwo.observations, [{count: 0}, {count: 1}, {count: 2}]);
  assert.deepEqual(result.neverEnabled, ['reset']);
});

test('equivalent observations are merged unless dedupe is disabled', async () => {
  let target = counter({invariants: {Always: () => true}});
  let merged = await explore(target, env);
  let all = await explore(target, env, {dedupe: false});
  assert.equal(merged.status, 'passed');
  assert.equal(all.status, 'passed');
  assert.ok(merged.runs < all.runs);
  assert.ok(merged.distinctStates < all.distinctStates);
});

test('run budgets, thrown errors, failed checks, and nondeterminism are not passes', async () => {
  let safe = counter({invariants: {Always: () => true}});
  assert.equal((await explore(safe, env, {maxRuns: 3})).status, 'incomplete');

  let throwing = counter({
    actions: {
      boom: () => {
        throw new Error('boom');
      }
    }
  });
  let error = await explore(throwing, env);
  assert.equal(error.status, 'error');
  assert.match(error.error, /boom/);

  let diverged = counter({
    check: ctx => {
      if (ctx.count > 1) throw new Error('Input diverged');
    }
  });
  let check = await explore(diverged, env);
  assert.equal(check.status, 'error');
  assert.match(check.error, /Input diverged/);
  assert.equal(
    (
      await replay(diverged, env, {
        schemaVersion: 1,
        target: 'counter',
        invariant: 'BelowTwo',
        actions: ['acquire', 'acquire']
      })
    ).status,
    'error'
  );

  let setups = 0;
  let leaky = counter({setup: () => ({count: 0, run: setups++}), observe: ctx => ctx.run > 1});
  let nondeterministic = await explore(leaky, env);
  assert.equal(nondeterministic.status, 'error');
  assert.match(nondeterministic.error, /Nondeterministic/);
});

test('replay distinguishes reproduced, not reproduced, other failures, and disabled actions', async () => {
  let target = counter();
  let trace = actions => ({schemaVersion: 1, target: 'counter', invariant: 'NonNegative', actions});
  assert.equal((await replay(target, env, trace(['release']))).status, 'reproduced');
  assert.equal((await replay(target, env, trace(['acquire']))).status, 'not-reproduced');
  assert.equal(
    (await replay(target, env, trace(['acquire', 'acquire']))).status,
    'different-violation'
  );
  assert.equal((await replay(target, env, trace(['reset']))).status, 'disabled');
  await assert.rejects(replay(target, env, {...trace([]), target: 'other'}), /trace for counter/);
  let teardown = [];
  await execute(counter({teardown: ctx => teardown.push(ctx.count)}), env, ['acquire']);
  assert.deepEqual(teardown, [1]);
});

test('targets run in Vitest with evidence outside the checkout', async t => {
  let root = fileURLToPath(new URL('../..', import.meta.url));
  assert.deepEqual(discoverTargets(root), ['toast-queue', 'use-press']);
  let output = directory(t);
  let requests = [];
  let execute = async (command, args, options) => {
    let request = JSON.parse(options.env.VERIFY_REQUEST);
    requests.push({command, args, request});
    writeFileSync(
      request.output,
      JSON.stringify({
        schemaVersion: 1,
        status: 'violations',
        violations: [{invariant: 'Example', actions: ['add'], observations: []}]
      })
    );
    return {code: 0};
  };
  let result = await runTarget(root, 'toast-queue', {output, depth: 3}, {execute});
  assert.equal(result.exitCode, 1);
  assert.deepEqual(requests[0].args, [
    'vitest',
    'run',
    '--config',
    'verification/targets.config.ts'
  ]);
  assert.equal(requests[0].request.environment, 'jsdom');
  assert.equal(requests[0].request.options.depth, 3);
  let saved = JSON.parse(readFileSync(result.violations[0].path, 'utf8'));
  assert.deepEqual(saved.actions, ['add']);

  let tracePath = join(output, 'trace.json');
  writeFileSync(tracePath, JSON.stringify({schemaVersion: 1, actions: []}));
  let missing = async () => ({code: 1, output: 'crash'});
  let replayed = await runTarget(
    root,
    'toast-queue',
    {mode: 'replay', trace: tracePath, output},
    {execute: missing}
  );
  assert.equal(replayed.environment, 'chromium');
  assert.equal(replayed.status, 'error');
  assert.equal(replayed.exitCode, 2);

  await assert.rejects(runTarget(root, 'toast-queue', {output: root}, {execute}), /outside/);
  await assert.rejects(runTarget(root, 'missing', {output}, {execute}), /Unknown target/);
  await assert.rejects(
    runTarget(root, 'toast-queue', {mode: 'replay', output}, {execute}),
    /--trace/
  );
});

test('CLI validates explore and replay options before running', async t => {
  let root = directory(t);
  mkdirSync(join(root, 'verification', 'example'), {recursive: true});
  writeFileSync(join(root, 'verification', 'example', 'target.tsx'), '');
  for (let args of [
    ['explore'],
    ['explore', 'example', '--depth', '0'],
    ['explore', 'example', '--max-runs', 'many'],
    ['explore', 'example', '--trace', 'trace.json'],
    ['explore', 'example', '--output', ''],
    ['replay', 'example', '--depth', '3'],
    ['confirm', 'example'],
    ['list', 'example'],
    ['run', 'example'],
    ['explore', 'example', '--property', 'Safety']
  ]) {
    let output;
    assert.equal(await main([...args, '--json'], root, value => (output = value)), 2);
    assert.ok(JSON.parse(output).error, args.join(' '));
  }
  let output;
  assert.equal(await main(['list', '--json'], root, value => (output = value)), 0);
  assert.deepEqual(JSON.parse(output).targets, ['example']);
});
