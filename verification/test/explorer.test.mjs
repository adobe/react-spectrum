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
import {cleanup, deadline} from '../runtime.mjs';
import {defineTarget, execute, explore, replay} from '../explorer.mjs';
import {discoverTargets, runTarget} from '../targets.mjs';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {main, printResult} from '../cli.mjs';
import {runProcess} from '../process.mjs';
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
  assert.throws(
    () => counter({model: {spec: 'Counter.tla', project: x => x, invariants: ['Nope']}}),
    /model.invariants/
  );
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

test('actions enabled only at the depth bound are not reported as never enabled', async () => {
  let result = await explore(
    counter({
      bounds: {depth: 2},
      actions: {
        acquire: {enabled: ctx => ctx.count < 2, run: ctx => void ctx.count++},
        full: {enabled: ctx => ctx.count === 2, run: () => {}}
      },
      invariants: {Always: () => true}
    }),
    env
  );
  assert.deepEqual(result.neverEnabled, []);
  assert.deepEqual(result.neverRan, ['full']);
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
  // A trace for an invariant the target lacks could never be reproduced.
  await assert.rejects(
    replay(target, env, {...trace(['release']), invariant: 'Nope'}),
    /no invariant named Nope/
  );
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
    let request = JSON.parse(readFileSync(options.env.VERIFY_REQUEST_PATH, 'utf8'));
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
  let inside = join(root, 'verification', `.evidence-${process.pid}`);
  await assert.rejects(runTarget(root, 'toast-queue', {output: inside}, {execute}), /outside/);
  assert.equal(existsSync(inside), false);
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

test('the CLI prints runs that failed before reporting without undefined fields', () => {
  for (let mode of ['explore', 'replay', 'check', 'conform']) {
    let lines = [];
    printResult(
      // What runTarget reports when Vitest wrote no result.
      {
        mode,
        target: 'example',
        environment: 'jsdom',
        status: 'error',
        error: 'Vitest failed.',
        directory: '/tmp/evidence'
      },
      line => lines.push(line)
    );
    assert.doesNotMatch(lines.join('\n'), /undefined/, mode);
  }
});

test('a violation in an already explored prefix is nondeterminism, not a counterexample', async () => {
  for (let failAt of [0, 1]) {
    let setups = 0;
    let target = counter({
      setup: () => ({count: 0, run: ++setups}),
      actions: {acquire: ctx => ctx.count++},
      observe: ctx => ctx.count,
      invariants: {Stable: ctx => ctx.run < 3 || ctx.count < failAt}
    });
    let result = await explore(target, env);
    assert.equal(result.status, 'error');
    assert.match(result.error, /Nondeterministic/);
    assert.deepEqual(result.violations, []);
  }
});

test('errors and disabled actions use one-based steps, with setup at zero', async () => {
  let target = counter({
    actions: {
      ok: () => {},
      boom: () => {
        throw new Error('boom');
      },
      off: {enabled: () => false, run: () => {}}
    }
  });
  assert.equal((await execute(target, env, ['boom'])).step, 1);
  assert.equal((await execute(target, env, ['ok', 'boom'])).step, 2);
  assert.equal((await execute(target, env, ['ok', 'off'])).step, 2);
  assert.equal(
    (
      await execute(
        counter({
          setup: () => {
            throw new Error('setup');
          }
        }),
        env,
        []
      )
    ).step,
    0
  );
});

test('omitted guards default to enabled and invalid guards fail at definition', async () => {
  let target = counter({actions: {acquire: {enabled: undefined, run: ctx => ctx.count++}}});
  assert.equal((await execute(target, env, ['acquire'])).status, 'completed');
  assert.throws(
    () => counter({actions: {acquire: {enabled: false, run: () => {}}}}),
    /enabled function/
  );
});

test('deadlines stop exploration and replay after cleanup, even with a fake Date', async () => {
  let original = Date.now;
  let cleaned = 0;
  let target = counter({
    setup: () => {
      Date.now = () => 0;
      return {count: 0};
    },
    actions: {
      slow: async ctx => {
        await new Promise(resolve => setTimeout(resolve, 20));
        ctx.count++;
      }
    },
    teardown: () => {
      cleaned++;
      Date.now = original;
    },
    invariants: {Safe: () => true}
  });
  try {
    let result = await explore(target, env, {checkDeadline: deadline(10)});
    assert.equal(result.status, 'timed-out');
    assert.ok(result.durationMs >= 0);
    assert.equal(cleaned, result.runs);
    let replayed = await replay(
      target,
      env,
      {schemaVersion: 1, target: 'counter', invariant: 'Safe', actions: ['slow']},
      {checkDeadline: deadline(10)}
    );
    assert.equal(replayed.status, 'timed-out');
  } finally {
    Date.now = original;
  }
});

test('cleanup restores resources after earlier failures and elapsed time survives failed teardown', async () => {
  let steps = [];
  await assert.rejects(
    cleanup(
      () => {
        steps.push('unmount');
        throw new Error('unmount failed');
      },
      async () => {
        steps.push('cancel');
        throw new Error('cancel failed');
      },
      () => steps.push('restore listeners'),
      () => steps.push('remove DOM'),
      () => steps.push('restore timers')
    ),
    AggregateError
  );
  assert.deepEqual(steps, [
    'unmount',
    'cancel',
    'restore listeners',
    'remove DOM',
    'restore timers'
  ]);
  let original = Date.now;
  try {
    let result = await explore(
      counter({
        setup: () => {
          Date.now = () => 0;
          return {count: 0};
        },
        teardown: () => {
          throw new Error('teardown failed');
        }
      }),
      env
    );
    assert.equal(result.status, 'error');
    assert.ok(result.durationMs >= 0);
  } finally {
    Date.now = original;
  }
});

test('failed, interrupted and timed-out runners override saved successes in every mode', async t => {
  let root = fileURLToPath(new URL('../..', import.meta.url));
  let output = directory(t);
  let trace = join(output, 'trace.json');
  writeFileSync(
    trace,
    JSON.stringify({schemaVersion: 1, actions: [], observations: ['x'.repeat(200000)]})
  );
  for (let mode of ['explore', 'replay', 'check', 'conform']) {
    for (let processResult of [
      {code: 1},
      {code: 0, timedOut: true},
      {code: 0, interrupted: true},
      {code: 0, error: 'log write failed'}
    ]) {
      let result = await runTarget(
        root,
        'use-press',
        {mode, output, trace},
        {
          execute: async (_command, _args, options) => {
            assert.equal(options.env.VERIFY_REQUEST, undefined);
            let request = JSON.parse(readFileSync(options.env.VERIFY_REQUEST_PATH, 'utf8'));
            if (mode === 'replay') assert.equal(request.trace.observations[0].length, 200000);
            writeFileSync(
              request.output,
              JSON.stringify({
                status:
                  mode === 'conform' ? 'conforms' : mode === 'replay' ? 'not-reproduced' : 'passed'
              })
            );
            return processResult;
          }
        }
      );
      assert.equal(result.exitCode, 2);
      assert.equal(
        result.status,
        processResult.timedOut ? 'timed-out' : processResult.interrupted ? 'interrupted' : 'error'
      );
    }
  }
});

test('process startup failures resolve as errors and hung runners are terminated', async t => {
  let output = directory(t);
  let invalid = await runProcess('invalid\0command', [], {
    log: join(output, 'invalid.log'),
    timeoutMs: 1000
  });
  assert.match(invalid.error, /null bytes/);
  let missing = await runProcess(join(output, 'missing'), [], {
    log: join(output, 'missing.log'),
    timeoutMs: 1000
  });
  assert.match(missing.error, /ENOENT/);
  let timedOut = await runProcess(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    log: join(output, 'timeout.log'),
    timeoutMs: 100
  });
  assert.equal(timedOut.timedOut, true);
  assert.notEqual(timedOut.code, 0);
  let untimed = await runProcess(process.execPath, ['-e', 'setTimeout(() => {}, 200)'], {
    log: join(output, 'untimed.log')
  });
  assert.equal(untimed.timedOut, false);
  assert.equal(untimed.code, 0);
});

test(
  'stopping a runner also stops descendants in their own process groups',
  {skip: process.platform === 'win32'},
  async t => {
    let output = directory(t);
    // Like Playwright's browser: a detached grandchild in a process group of its own.
    let script = `
      let {spawn} = require('node:child_process');
      let child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
      console.log(child.pid);
      setInterval(() => {}, 1000);`;
    let result = await runProcess(process.execPath, ['-e', script], {
      log: join(output, 'tree.log'),
      timeoutMs: 500
    });
    let pid = Number(result.output.trim());
    let alive = () => {
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        return false;
      }
    };
    t.after(() => alive() && process.kill(pid, 'SIGKILL'));
    assert.equal(result.timedOut, true);
    assert.ok(pid > 0);
    for (let i = 0; alive() && i < 50; i++) await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(alive(), false);
  }
);
