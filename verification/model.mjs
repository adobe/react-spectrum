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

import {check, formatValue} from 'tla-ts';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {now} from './runtime.mjs';

// TLA+ models for targets. A model must declare `CONSTANT MaxSteps`, variables
// `action` and `step` (with `vars` listing all of them), `Init`, a `Next` that
// bounds `step < MaxSteps` and sets `action'` to the target's action name, a
// `View` record matching the target's `model.project`, and one operator per
// checked invariant. `checkModel` model-checks each invariant separately with
// tla-ts; `conformModel` checks that some behavior of the model follows each of
// the real code's explored paths with the same View at every step.

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function toTla(value) {
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new Error(`TLA+ values must be integers: ${value}`);
    return String(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `<<${value.map(toTla).join(', ')}>>`;
  if (value && typeof value === 'object') {
    let keys = Object.keys(value).sort();
    if (!keys.length) throw new Error('TLA+ has no empty record; project to a value instead.');
    for (let key of keys) if (!IDENTIFIER.test(key)) throw new Error(`Invalid field: ${key}`);
    return `[${keys.map(key => `${key} |-> ${toTla(value[key])}`).join(', ')}]`;
  }
  throw new Error(`Cannot express ${value} in TLA+; project it to a value.`);
}

export function loadModel(directory, spec) {
  let source = readFileSync(join(directory, spec), 'utf8');
  let name = source.match(/MODULE\s+(\w+)/)?.[1];
  if (!name) throw new Error(`${spec} has no MODULE header.`);
  let loadModule = module => {
    let path = join(directory, `${module}.tla`);
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
  };
  return {name, source, loadModule};
}

function config(model, maxSteps, lines) {
  let constants = Object.entries(model.constants ?? {}).map(
    ([name, value]) => `CONSTANT ${name} = ${toTla(value)}`
  );
  return [`CONSTANT MaxSteps = ${maxSteps}`, ...constants, ...lines].join('\n') + '\n';
}

let format = state =>
  Object.fromEntries(Object.entries(state).map(([key, value]) => [key, formatValue(value)]));

function actionsOf(trace) {
  return trace.slice(1).map(step => {
    if (!('action' in step.state)) throw new Error('The model has no `action` variable.');
    return JSON.parse(formatValue(step.state.action));
  });
}

// tla-ts throws for configuration errors (such as an undefined invariant) and
// returns 'error' for evaluation failures; report both as an 'error' result.
async function run(source, loadModule, cfg, onPrint) {
  try {
    return await check({source, config: cfg, loadModule, onPrint, workers: 1, seed: 1n});
  } catch (error) {
    return {status: 'error', failure: {message: error.message}, distinctStates: 0};
  }
}

// Whether the run's deadline has passed. A model check that finishes after the
// deadline is still kept; the deadline only stops the next one from starting.
function expired(options) {
  try {
    options.checkDeadline?.();
    return false;
  } catch (error) {
    if (error?.name === 'TimeoutError') return true;
    throw error;
  }
}

/**
 * Model-checks each invariant separately, so one violation does not stop the
 * others, and converts counterexamples into traces `replay` runs on real code.
 * When the deadline passes, the invariants checked so far are still reported.
 */
export async function checkModel(target, model, options = {}) {
  let started = now();
  let depth = options.depth ?? target.model.depth ?? target.bounds.depth;
  let invariants = [];
  let violations = [];
  let timedOut = false;
  for (let invariant of target.model.invariants ?? Object.keys(target.invariants)) {
    if (expired(options)) {
      timedOut = true;
      break;
    }
    let result = await run(
      model.source,
      model.loadModule,
      config(target.model, depth, [
        'INIT Init',
        'NEXT Next',
        `INVARIANT ${invariant}`,
        'CHECK_DEADLOCK FALSE'
      ])
    );
    let item = {
      invariant,
      status: 'passed',
      distinctStates: result.distinctStates,
      generatedStates: result.generatedStates,
      depth: result.depth
    };
    if (result.status === 'invariant-violation' && result.violation?.name === invariant) {
      let trace = result.violation.trace;
      item.status = 'violated';
      violations.push({
        schemaVersion: 1,
        target: target.name,
        origin: 'model',
        invariant,
        detail: `${invariant} fails in the model after ${trace.length - 1} steps`,
        actions: actionsOf(trace),
        observations: trace.map(step => format(step.state))
      });
    } else if (result.status !== 'success') {
      item.status = 'error';
      item.error = result.failure?.message ?? `tla-ts reported ${result.status}.`;
    }
    invariants.push(item);
  }
  return {
    schemaVersion: 1,
    target: target.name,
    status: invariants.some(item => item.status === 'error')
      ? 'error'
      : timedOut
        ? 'timed-out'
        : violations.length
          ? 'violations'
          : 'passed',
    depth,
    invariants,
    violations,
    durationMs: now() - started
  };
}

/**
 * Follows each trace's actions through the model, keeping only behaviors whose
 * View equals the code's projected observation after every step, so the model may
 * be nondeterministic. TLC register t records that some behavior followed trace t
 * to its end, and `AllReached` prints the first trace that none did.
 *
 * For diagnosis, `limit` stops comparing Views from that step on, and `diagnose`
 * records the model's View and which of its fields differ from the code's.
 */
export function conformanceModule(name, traces, views, {limit, diagnose = false} = {}) {
  let longest = traces.reduce((max, trace) => Math.max(max, trace.length), 0);
  let recorded = diagnose ? ['modelView', 'differs'] : [];
  return [
    `---- MODULE ${name}Conformance ----`,
    `EXTENDS ${name}, Integers, Sequences, TLC`,
    `Traces == ${toTla(traces)}`,
    `Views == ${toTla(views)}`,
    `Limit == ${limit ?? longest + 1}`,
    `VARIABLES ${['trace', ...recorded].join(', ')}`,
    'Expected == Views[trace][step + 1]',
    'Differs == {f \\in DOMAIN View \\cup DOMAIN Expected :',
    '  f \\notin DOMAIN View \\/ f \\notin DOMAIN Expected \\/ View[f] # Expected[f]}',
    'ASSUME \\A t \\in 1..Len(Traces) : TLCSet(t, FALSE)',
    'ConformInit ==',
    '  /\\ Init',
    '  /\\ trace \\in 1..Len(Traces)',
    '  /\\ 0 < Limit => View = Views[trace][1]',
    ...(diagnose ? ['  /\\ modelView = View', '  /\\ differs = Differs'] : []),
    'ConformNext ==',
    '  \\/ /\\ step < Len(Traces[trace])',
    '     /\\ UNCHANGED trace',
    '     /\\ Next',
    "     /\\ action' = Traces[trace][step + 1]",
    "     /\\ step' < Limit => View' = Views[trace][step + 2]",
    ...(diagnose ? ["     /\\ modelView' = View'", "     /\\ differs' = Differs'"] : []),
    '  \\/ /\\ step = Len(Traces[trace])',
    '     /\\ TLCSet(trace, TRUE)',
    `     /\\ UNCHANGED <<${['vars', 'trace', ...recorded].join(', ')}>>`,
    'Unreached == {t \\in 1..Len(Traces) : ~TLCGet(t)}',
    'AllReached ==',
    '  \\/ Unreached = {}',
    '  \\/ /\\ PrintT(<<"Unreached", CHOOSE t \\in Unreached : \\A u \\in Unreached : t <= u>>)',
    '     /\\ FALSE',
    'ConformBefore == step < Limit',
    ...Array.from({length: longest + 1}, (_, k) => `ConformReached${k} == step = ${k}`),
    '===='
  ].join('\n');
}

/**
 * Checks that for every explored path of the real code, some behavior of the model
 * takes the same actions with the same View at each step. This is one-directional:
 * it does not show that the code can do everything the model allows.
 */
export async function conformModel(target, model, paths, options = {}) {
  let started = now();
  // A path that is a prefix of another is checked as part of it. Every explored
  // path's parent is also a path, so the maximal paths are those with no child.
  let parents = new Set(
    paths.filter(path => path.actions.length).map(path => JSON.stringify(path.actions.slice(0, -1)))
  );
  let maximal = paths.filter(path => !parents.has(JSON.stringify(path.actions)));
  let traces = maximal.map(path => path.actions);
  let views = maximal.map(path => path.observations.map(target.model.project));
  let loadModule = module => (module === model.name ? model.source : model.loadModule(module));
  let conform = async (traces, views, lines, moduleOptions) => {
    let printed = [];
    let longest = traces.reduce((max, trace) => Math.max(max, trace.length), 1);
    let result = await run(
      conformanceModule(model.name, traces, views, moduleOptions),
      loadModule,
      config(target.model, longest, ['INIT ConformInit', 'NEXT ConformNext', ...lines]),
      text => printed.push(text)
    );
    return {...result, printed};
  };
  options.checkDeadline?.();
  let result = await conform(traces, views, ['POSTCONDITION AllReached', 'CHECK_DEADLOCK FALSE']);
  let summary = {
    schemaVersion: 1,
    target: target.name,
    paths: paths.length,
    traces: traces.length,
    steps: traces.reduce((total, trace) => total + trace.length, 0),
    distinctStates: result.distinctStates,
    durationMs: now() - started
  };
  let error = message => ({...summary, status: 'error', error: message});
  if (result.status === 'success') return {...summary, status: 'conforms'};
  let unreached = result.printed
    .map(text => text.match(/^<<"Unreached", (\d+)>>$/)?.[1])
    .find(Boolean);
  if (result.violation?.name !== 'AllReached' || !unreached)
    return error(result.failure?.message ?? `tla-ts reported ${result.status}.`);

  // Diagnose the first trace no behavior follows: find the first step that no
  // behavior reaches with matching Views, then see what the model does there.
  let index = Number(unreached) - 1;
  let actions = traces[index];
  // tla-ts reports the first predicate in this list that no state satisfied.
  let steps = Array.from({length: actions.length + 1}, (_, k) => `ConformReached${k}`);
  let reached = await conform(
    [actions],
    [views[index]],
    [`_POSSIBLE ${steps.join(' ')}`, 'CHECK_DEADLOCK FALSE']
  );
  let step = steps.indexOf(reached.violation?.name);
  if (reached.status !== 'postcondition-violation' || step < 0)
    return error(
      reached.failure?.message ?? `tla-ts reported ${reached.status} for trace ${index + 1}.`
    );
  let at = await conform(
    [actions],
    [views[index]],
    ['INVARIANT ConformBefore', 'CHECK_DEADLOCK FALSE'],
    {
      limit: step,
      diagnose: true
    }
  );
  let after = count => (count ? actions.slice(0, count).join(' -> ') : 'setup');
  if (at.status === 'success') {
    if (!step) return error('The model has no initial state.');
    return {
      ...summary,
      status: 'mismatch',
      mismatch: {
        kind: 'action',
        actions: actions.slice(0, step),
        detail: `the code took ${actions[step - 1]} after ${after(step - 1)}, but the model does not allow it`
      }
    };
  }
  let last = at.violation?.trace.at(-1)?.state;
  if (at.status !== 'invariant-violation' || !last)
    return error(at.failure?.message ?? `tla-ts reported ${at.status} for trace ${index + 1}.`);
  // Records and sets of strings, as the conformance module builds them.
  let modelFields = Object.fromEntries(
    last.modelView.domain.map((field, i) => [field, formatValue(last.modelView.range[i])])
  );
  let observed = views[index][step];
  let fields = [...last.differs.elements].sort().map(field => ({
    field,
    model: modelFields[field] ?? null,
    code: field in observed ? toTla(observed[field]) : null
  }));
  return {
    ...summary,
    status: 'mismatch',
    mismatch: {
      kind: 'state',
      actions: actions.slice(0, step),
      fields,
      detail: `after ${after(step)}, ${fields.map(item => `${item.field} is ${item.code} in the code but ${item.model} in the model`).join('; ')}`
    }
  };
}
