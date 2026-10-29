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

// Bounded exhaustive exploration of real code. A target drives the actual
// implementation through named actions; the explorer searches every enabled
// action sequence breadth-first, so the first trace found for an invariant is
// a shortest one. Real code cannot be snapshotted, so each candidate replays
// its prefix from a fresh setup.

/**
 * @typedef {object} Environment
 * @property {'jsdom' | 'chromium' | 'node'} name
 * @property {{
 *   hover(element: Element): Promise<void>;
 *   touch(element: Element, type: 'start' | 'cancel'): Promise<number>;
 * }} input
 *   `touch` starts or cancels a touch on an element and resolves to its pointerId.
 */

/**
 * @template Ctx
 * @typedef {object} Action
 * @property {(ctx: Ctx) => boolean} [enabled]
 * @property {(ctx: Ctx) => void | Promise<void>} run
 */

/**
 * @template Ctx
 * @typedef {object} TargetSpec
 * @property {string} name
 * @property {string} description
 * @property {string[]} sources Repository paths of the code the target drives.
 * @property {{depth: number; maxRuns?: number}} bounds
 * @property {(env: Environment) => Ctx | Promise<Ctx>} setup
 * @property {(ctx: Ctx) => void | Promise<void>} [teardown]
 * @property {(ctx: Ctx) => void} [check] Throws when the environment did not do what the
 *   actions intended (e.g. real input did not register), making the run an error, not evidence.
 * @property {Record<string, Action<Ctx> | Action<Ctx>['run']>} actions
 * @property {(ctx: Ctx) => unknown} observe JSON state used to merge equivalent states.
 * @property {Record<string, (ctx: Ctx) => boolean | string>} invariants Return true when the
 *   invariant holds, or false/a message when it fails.
 */

/**
 * @template Ctx
 * @param {TargetSpec<Ctx>} spec
 * @returns {Omit<TargetSpec<Ctx>, 'actions'> & {actions: Record<string, Required<Action<Ctx>>>}}
 */
export function defineTarget(spec) {
  let fail = message => {
    throw new Error(`Invalid target${spec?.name ? ` ${spec.name}` : ''}: ${message}`);
  };
  if (!spec || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(spec.name)) fail('name must be kebab-case.');
  if (typeof spec.description !== 'string' || !spec.description.trim())
    fail('description is required.');
  if (!Array.isArray(spec.sources) || !spec.sources.length) fail('sources are required.');
  if (!Number.isSafeInteger(spec.bounds?.depth) || spec.bounds.depth < 1)
    fail('bounds.depth must be a positive integer.');
  for (let key of ['setup', 'observe'])
    if (typeof spec[key] !== 'function') fail(`${key} must be a function.`);
  let actions = Object.entries(spec.actions || {});
  if (!actions.length) fail('at least one action is required.');
  if (!Object.keys(spec.invariants || {}).length) fail('at least one invariant is required.');
  return {
    ...spec,
    actions: Object.fromEntries(
      actions.map(([name, action]) => {
        let normalized = typeof action === 'function' ? {run: action} : action;
        if (typeof normalized?.run !== 'function') fail(`action ${name} needs a run function.`);
        return [name, {enabled: () => true, ...normalized}];
      })
    )
  };
}

export function stableStringify(value) {
  return JSON.stringify(value, (_key, item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map(key => [key, item[key]])
        )
      : item
  );
}

function enabledActions(target, ctx) {
  return Object.keys(target.actions).filter(name => target.actions[name].enabled(ctx));
}

function failedInvariants(target, ctx) {
  let failures = [];
  for (let [name, invariant] of Object.entries(target.invariants)) {
    let result = invariant(ctx);
    if (result !== true) failures.push({invariant: name, detail: result || `${name} failed.`});
  }
  return failures;
}

// Runs one action sequence from a fresh setup, stopping at the first failure.
// `status` is 'completed', 'violation', 'disabled' (an action was not enabled),
// or 'error' (setup, an action, an invariant, or observe threw).
export async function execute(target, env, actions) {
  let ctx;
  let observations = [];
  let step = 0;
  let current = null;
  let result;
  try {
    ctx = await target.setup(env);
    let record = () => observations.push(JSON.parse(stableStringify(target.observe(ctx) ?? null)));
    target.check?.(ctx);
    let failures = failedInvariants(target, ctx);
    record();
    for (; !failures.length && step < actions.length; step++) {
      current = actions[step];
      let action = target.actions[current];
      if (!action) throw new Error(`Unknown action: ${current}`);
      if (!action.enabled(ctx)) {
        result = {status: 'disabled', step: step + 1, action: current};
        break;
      }
      await action.run(ctx);
      target.check?.(ctx);
      failures = failedInvariants(target, ctx);
      record();
    }
    result ??= failures.length
      ? {status: 'violation', step, failures}
      : {status: 'completed', step, enabled: enabledActions(target, ctx)};
  } catch (error) {
    result = {
      status: 'error',
      step,
      action: current,
      error: error instanceof Error ? error.stack || error.message : String(error)
    };
  } finally {
    if (ctx !== undefined && target.teardown) {
      try {
        await target.teardown(ctx);
      } catch (error) {
        result = {status: 'error', step, error: `teardown: ${error?.message ?? error}`};
      }
    }
  }
  return {...result, actions, observations};
}

function trace(target, actions, failure, observations) {
  return {
    schemaVersion: 1,
    target: target.name,
    invariant: failure.invariant,
    detail: failure.detail,
    actions,
    observations
  };
}

/**
 * Searches all enabled action sequences up to `depth`, merging sequences that
 * reach the same observation. Each invariant reports its first, and therefore
 * shortest, violating trace. Sequences are not extended past a violation.
 */
export async function explore(target, env, options = {}) {
  let depth = options.depth ?? target.bounds.depth;
  let maxRuns = options.maxRuns ?? target.bounds.maxRuns ?? 20000;
  let started = Date.now();
  let coverage = Object.fromEntries(
    Object.keys(target.actions).map(name => [name, {enabled: 0, ran: 0}])
  );
  let violations = new Map();
  let seen = new Map();
  let runs = 0;
  let level = 0;
  let complete = true;
  let summary = status => ({
    schemaVersion: 1,
    target: target.name,
    environment: env.name,
    status,
    bounds: {depth, maxRuns},
    depthReached: level,
    runs,
    distinctStates: seen.size,
    durationMs: Date.now() - started,
    coverage,
    neverEnabled: Object.keys(coverage).filter(name => !coverage[name].enabled),
    neverRan: Object.keys(coverage).filter(name => !coverage[name].ran),
    violations: [...violations.values()]
  });

  let record = (actions, result) => {
    for (let failure of result.failures)
      if (!violations.has(failure.invariant))
        violations.set(failure.invariant, trace(target, actions, failure, result.observations));
  };

  let root = await execute(target, env, []);
  runs++;
  if (root.status === 'error') return {...summary('error'), error: root.error, actions: []};
  if (root.status === 'violation') {
    record([], root);
    return summary('violations');
  }
  seen.set(stableStringify(root.observations.at(-1)), []);
  let frontier = [{actions: [], enabled: root.enabled, observation: root.observations.at(-1)}];
  for (; level < depth && frontier.length; level++) {
    let next = [];
    let candidates = frontier.flatMap(state => state.enabled.map(name => ({state, name})));
    for (let {name} of candidates) coverage[name].enabled++;
    for (let {state, name} of candidates) {
      if (runs >= maxRuns) {
        complete = false;
        break;
      }
      let actions = [...state.actions, name];
      let result = await execute(target, env, actions);
      runs++;
      // The prefix must reproduce the state it was reached from.
      let replayed = result.observations[state.actions.length];
      if (
        replayed !== undefined &&
        stableStringify(replayed) !== stableStringify(state.observation)
      )
        return {
          ...summary('error'),
          error: 'Nondeterministic target: replaying a prefix produced a different observation.',
          actions,
          expected: state.observation,
          actual: replayed
        };
      if (result.status === 'error' || result.status === 'disabled')
        return {
          ...summary('error'),
          error:
            result.status === 'disabled'
              ? `Action ${result.action} was enabled during search but not on replay.`
              : result.error,
          actions
        };
      coverage[name].ran++;
      if (result.status === 'violation') {
        record(actions, result);
        continue;
      }
      let observation = result.observations.at(-1);
      let key = options.dedupe === false ? stableStringify(actions) : stableStringify(observation);
      if (seen.has(key)) continue;
      seen.set(key, actions);
      next.push({actions, enabled: result.enabled, observation});
    }
    if (!complete) break;
    frontier = next;
  }
  return summary(!complete ? 'incomplete' : violations.size ? 'violations' : 'passed');
}

/**
 * Replays a trace and reports whether its invariant fails. `reproduced` requires
 * the same invariant to fail; a different failure is reported as such.
 */
export async function replay(target, env, input) {
  if (input?.schemaVersion !== 1 || input.target !== target.name || !Array.isArray(input.actions))
    throw new Error(`Expected a schemaVersion 1 trace for ${target.name}.`);
  let result = await execute(target, env, input.actions);
  let failure = result.failures?.find(item => item.invariant === input.invariant);
  return {
    schemaVersion: 1,
    target: target.name,
    environment: env.name,
    invariant: input.invariant,
    actions: input.actions,
    status:
      result.status === 'violation'
        ? failure
          ? 'reproduced'
          : 'different-violation'
        : result.status === 'completed'
          ? 'not-reproduced'
          : result.status,
    step: result.step,
    failures: result.failures ?? [],
    error: result.error ?? null,
    observations: result.observations
  };
}
