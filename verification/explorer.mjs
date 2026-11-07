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

import {now} from './runtime.mjs';

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
 * @property {TargetModel} [model] A TLA+ model of the same behavior; see model.mjs.
 */

/**
 * @typedef {object} TargetModel
 * @property {string} spec The .tla file, relative to the target's directory.
 * @property {(observation: any) => Record<string, unknown>} project Maps an observation
 *   onto the model's `View` record, for conformance.
 * @property {number} [depth] Default model-checking depth; defaults to bounds.depth.
 * @property {string[]} [invariants] Target invariants to model-check; defaults to all of
 *   them. Each must be a target invariant so that its counterexamples can be replayed.
 * @property {Record<string, unknown>} [constants] Extra CONSTANT values, as JSON.
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
  if (
    spec.model !== undefined &&
    (typeof spec.model?.spec !== 'string' ||
      !spec.model.spec.endsWith('.tla') ||
      typeof spec.model.project !== 'function')
  )
    fail('model needs a .tla spec and a project function.');
  let modelInvariants = spec.model?.invariants ?? [];
  if (
    !Array.isArray(modelInvariants) ||
    modelInvariants.some(name => !Object.hasOwn(spec.invariants, name))
  )
    fail('model.invariants must name target invariants, so their counterexamples can be replayed.');
  return {
    ...spec,
    actions: Object.fromEntries(
      actions.map(([name, action]) => {
        let normalized = typeof action === 'function' ? {run: action} : action;
        if (typeof normalized?.run !== 'function') fail(`action ${name} needs a run function.`);
        let enabled = normalized.enabled ?? (() => true);
        if (typeof enabled !== 'function') fail(`action ${name} needs an enabled function.`);
        return [name, {...normalized, enabled}];
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
// 'timed-out', or 'error' (setup, an action, an invariant, or observe threw).
// `onStep(index, action)` runs after each observation, for screenshots.
// `trackEnabled` also records the actions enabled after each observation.
export async function execute(
  target,
  env,
  actions,
  {invariants = true, checkDeadline = () => {}, onStep = async () => {}, trackEnabled = false} = {}
) {
  let ctx;
  let observations = [];
  let enabledSteps = [];
  let step = 0;
  let current = null;
  let result;
  try {
    checkDeadline();
    ctx = await target.setup(env);
    checkDeadline();
    let record = () => {
      observations.push(JSON.parse(stableStringify(target.observe(ctx) ?? null)));
      if (trackEnabled) enabledSteps.push(enabledActions(target, ctx));
    };
    target.check?.(ctx);
    let failures = invariants ? failedInvariants(target, ctx) : [];
    record();
    await onStep(0, null);
    while (!failures.length && step < actions.length) {
      current = actions[step];
      step++;
      checkDeadline();
      let action = target.actions[current];
      if (!action) throw new Error(`Unknown action: ${current}`);
      if (!action.enabled(ctx)) {
        result = {status: 'disabled', step, action: current};
        break;
      }
      await action.run(ctx);
      checkDeadline();
      target.check?.(ctx);
      failures = invariants ? failedInvariants(target, ctx) : [];
      record();
      await onStep(step, current);
    }
    result ??= failures.length
      ? {status: 'violation', step, failures}
      : {status: 'completed', step, enabled: enabledActions(target, ctx)};
  } catch (error) {
    result = {
      status: error?.name === 'TimeoutError' ? 'timed-out' : 'error',
      step,
      action: current,
      error: error instanceof Error ? error.stack || error.message : String(error)
    };
  } finally {
    if (ctx !== undefined && target.teardown) {
      try {
        await target.teardown(ctx);
      } catch (error) {
        result = {
          ...result,
          status: result?.status === 'timed-out' ? 'timed-out' : 'error',
          step,
          error: [result?.error, `teardown: ${error?.message ?? error}`].filter(Boolean).join('\n')
        };
      }
    }
  }
  return {...result, actions, observations, ...(trackEnabled ? {enabledSteps} : {})};
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
 * `invariants: false` skips them; `collect: true` returns the path, observations,
 * and finally enabled actions of every run, including runs that reach an
 * already-seen state, so that model conformance covers every explored transition.
 */
export async function explore(target, env, options = {}) {
  let depth = options.depth ?? target.bounds.depth;
  let maxRuns = options.maxRuns ?? target.bounds.maxRuns ?? 20000;
  let started = now();
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
    durationMs: now() - started,
    coverage,
    neverEnabled: Object.keys(coverage).filter(name => !coverage[name].enabled),
    neverRan: Object.keys(coverage).filter(name => !coverage[name].ran),
    violations: [...violations.values()],
    ...(options.collect ? {paths} : {})
  });

  let record = (actions, result) => {
    for (let failure of result.failures)
      if (!violations.has(failure.invariant))
        violations.set(failure.invariant, trace(target, actions, failure, result.observations));
  };
  // Coverage counts the distinct states that enable each action, including states
  // at the depth bound that are not extended, and the runs that took it.
  let discovered = enabled => enabled.forEach(name => coverage[name].enabled++);

  let checkInvariants = options.invariants !== false;
  let paths = [];
  let root = await execute(target, env, [], {
    invariants: checkInvariants,
    checkDeadline: options.checkDeadline
  });
  runs++;
  if (['error', 'timed-out'].includes(root.status))
    return {...summary(root.status), error: root.error, actions: []};
  if (root.status === 'violation') {
    record([], root);
    return summary('violations');
  }
  seen.set(stableStringify(root.observations.at(-1)), []);
  discovered(root.enabled);
  paths.push({actions: [], observations: root.observations, enabled: root.enabled});
  let frontier = [{actions: [], enabled: root.enabled, observation: root.observations.at(-1)}];
  for (; level < depth && frontier.length; level++) {
    let next = [];
    let candidates = frontier.flatMap(state => state.enabled.map(name => ({state, name})));
    for (let {state, name} of candidates) {
      if (runs >= maxRuns) {
        complete = false;
        break;
      }
      let actions = [...state.actions, name];
      let result = await execute(target, env, actions, {
        invariants: checkInvariants,
        checkDeadline: options.checkDeadline
      });
      runs++;
      // The prefix must reproduce the state it was reached from.
      let replayed = result.observations[state.actions.length];
      if (
        (result.status === 'violation' && result.step < actions.length) ||
        (replayed !== undefined && stableStringify(replayed) !== stableStringify(state.observation))
      )
        return {
          ...summary('error'),
          error: 'Nondeterministic target: replaying a prefix produced a different observation.',
          actions,
          expected: state.observation,
          actual: replayed
        };
      if (['error', 'disabled', 'timed-out'].includes(result.status))
        return {
          ...summary(result.status === 'timed-out' ? 'timed-out' : 'error'),
          error:
            result.status === 'disabled'
              ? `Action ${result.action} was enabled during search but not on replay.`
              : result.error,
          actions
        };
      coverage[name].ran++;
      if (options.collect)
        paths.push({actions, observations: result.observations, enabled: result.enabled});
      if (result.status === 'violation') {
        record(actions, result);
        continue;
      }
      let observation = result.observations.at(-1);
      let key = options.dedupe === false ? stableStringify(actions) : stableStringify(observation);
      if (seen.has(key)) continue;
      seen.set(key, actions);
      discovered(result.enabled);
      next.push({actions, enabled: result.enabled, observation});
    }
    if (!complete) break;
    frontier = next;
  }
  return summary(!complete ? 'incomplete' : violations.size ? 'violations' : 'passed');
}

/**
 * Runs tests generated from a model, without invariants, and returns every prefix
 * of each as a path for conformModel, with what the code enabled after it. A test
 * stops where the code does not enable its next action; conformance reports that.
 */
export async function runTests(target, env, tests, options = {}) {
  let started = now();
  let paths = new Map();
  let runs = 0;
  let steps = 0;
  let disabled = 0;
  let summary = status => ({
    schemaVersion: 1,
    target: target.name,
    environment: env.name,
    status,
    runs,
    steps,
    disabled,
    durationMs: now() - started
  });
  // Every run records setup, so setup alone runs only when there are no tests.
  for (let actions of tests.length ? tests : [[]]) {
    let result = await execute(target, env, actions, {
      invariants: false,
      checkDeadline: options.checkDeadline,
      trackEnabled: true
    });
    runs++;
    if (['error', 'timed-out'].includes(result.status))
      return {...summary(result.status), error: result.error, actions};
    if (result.status === 'disabled') disabled++;
    steps += result.observations.length - 1;
    for (let k = 0; k < result.observations.length; k++) {
      let prefix = actions.slice(0, k);
      let key = stableStringify(prefix);
      let observation = stableStringify(result.observations[k]);
      let seen = paths.get(key);
      if (seen && stableStringify(seen.observations.at(-1)) !== observation)
        return {
          ...summary('error'),
          error: 'Nondeterministic target: the same actions produced a different observation.',
          actions: prefix,
          expected: seen.observations.at(-1),
          actual: result.observations[k]
        };
      if (!seen)
        paths.set(key, {
          actions: prefix,
          observations: result.observations.slice(0, k + 1),
          enabled: result.enabledSteps[k]
        });
    }
  }
  return {...summary('passed'), paths: [...paths.values()]};
}

// The first step where the code's projected observation differs from the
// model's View, with the fields that differ.
function divergence(target, actions, observations, views) {
  let count = Math.min(observations.length, views.length);
  for (let step = 0; step < count; step++) {
    let code = target.model.project(observations[step]);
    let model = views[step];
    let fields = [...new Set([...Object.keys(code), ...Object.keys(model)])]
      .sort()
      .filter(field => stableStringify(code[field]) !== stableStringify(model[field]))
      .map(field => ({field, model: model[field] ?? null, code: code[field] ?? null}));
    if (fields.length) return {step, actions: actions.slice(0, step), fields};
  }
  return null;
}

/**
 * Replays a trace and reports whether its invariant fails. `reproduced` requires
 * the same invariant to fail; a different failure is reported as such. For a
 * model counterexample, which has the model's View at each step, `divergence` is
 * the first step where the code's projected observation differs from it.
 */
export async function replay(target, env, input, options = {}) {
  if (input?.schemaVersion !== 1 || input.target !== target.name || !Array.isArray(input.actions))
    throw new Error(`Expected a schemaVersion 1 trace for ${target.name}.`);
  // Otherwise the trace could never be reproduced, and would read as a pass.
  if (!Object.hasOwn(target.invariants, input.invariant))
    throw new Error(`${target.name} has no invariant named ${input.invariant}.`);
  let result = await execute(target, env, input.actions, options);
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
    observations: result.observations,
    ...(Array.isArray(input.views) && target.model
      ? {divergence: divergence(target, input.actions, result.observations, input.views)}
      : {})
  };
}
