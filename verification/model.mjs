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
// tla-ts; `conformModel` replays the real code's explored paths through the model
// and compares View at every step.

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

// Splits a formatted TLA+ record such as [a |-> 1, b |-> <<1, 2>>] into fields.
export function parseRecord(text) {
  let body = text.trim().replace(/^\[|\]$/g, '');
  let parts = [];
  let depth = 0;
  let quoted = false;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    let char = body[i];
    if (quoted) {
      if (char === '\\') i++;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (body.startsWith('|->', i)) i += 2;
    else if ('[<({'.includes(char)) depth++;
    else if (']>)}'.includes(char)) depth--;
    else if (char === ',' && depth === 0) {
      parts.push(body.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(body.slice(start));
  return Object.fromEntries(
    parts.map(part => {
      let index = part.indexOf('|->');
      return [part.slice(0, index).trim(), part.slice(index + 3).trim()];
    })
  );
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
async function run(source, loadModule, cfg) {
  try {
    return await check({source, config: cfg, loadModule, workers: 1, seed: 1n});
  } catch (error) {
    return {status: 'error', failure: {message: error.message}, distinctStates: 0};
  }
}

/**
 * Model-checks each invariant separately, so one violation does not stop the
 * others, and converts counterexamples into traces `replay` runs on real code.
 */
export async function checkModel(target, model, options = {}) {
  let started = now();
  let depth = options.depth ?? target.model.depth ?? target.bounds.depth;
  let invariants = [];
  let violations = [];
  for (let invariant of target.model.invariants ?? Object.keys(target.invariants)) {
    options.checkDeadline?.();
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
    options.checkDeadline?.();
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
      : violations.length
        ? 'violations'
        : 'passed',
    depth,
    invariants,
    violations,
    durationMs: now() - started
  };
}

// Follows each trace's actions through the model, comparing View with the
// projected observation after every step. Deadlock means the model cannot take
// the trace's next action.
export function conformanceModule(name, traces, views) {
  return [
    `---- MODULE ${name}Conformance ----`,
    `EXTENDS ${name}, Integers, Sequences`,
    `Traces == ${toTla(traces)}`,
    `Views == ${toTla(views)}`,
    'VARIABLES trace, modelView',
    'ConformInit == Init /\\ trace \\in 1..Len(Traces) /\\ modelView = View',
    'ConformNext ==',
    '  \\/ /\\ step < Len(Traces[trace])',
    '     /\\ Next',
    "     /\\ action' = Traces[trace][step + 1]",
    "     /\\ modelView' = View'",
    '     /\\ UNCHANGED trace',
    '  \\/ /\\ step = Len(Traces[trace])',
    '     /\\ UNCHANGED <<vars, trace, modelView>>',
    'Conforms == View = Views[trace][step + 1]',
    '===='
  ].join('\n');
}

/**
 * Checks that every explored path of the real code is a behavior of the model with
 * the same View at each step. This is one-directional: it does not show that the
 * code can do everything the model allows.
 */
export async function conformModel(target, model, paths, options = {}) {
  let started = now();
  // A path that is a prefix of another is checked as part of it.
  let maximal = paths.filter(
    path =>
      !paths.some(
        other =>
          other.actions.length > path.actions.length &&
          path.actions.every((action, index) => other.actions[index] === action)
      )
  );
  let traces = maximal.map(path => path.actions);
  let views = maximal.map(path => path.observations.map(target.model.project));
  options.checkDeadline?.();
  let result = await run(
    conformanceModule(model.name, traces, views),
    module => (module === model.name ? model.source : model.loadModule(module)),
    config(target.model, Math.max(1, ...traces.map(trace => trace.length)), [
      'INIT ConformInit',
      'NEXT ConformNext',
      'INVARIANT Conforms',
      'CHECK_DEADLOCK TRUE'
    ])
  );
  options.checkDeadline?.();
  let summary = {
    schemaVersion: 1,
    target: target.name,
    paths: paths.length,
    traces: traces.length,
    steps: traces.reduce((total, trace) => total + trace.length, 0),
    distinctStates: result.distinctStates,
    durationMs: now() - started
  };
  if (result.status === 'success') return {...summary, status: 'conforms'};
  let last = result.violation?.trace.at(-1)?.state;
  if (!last || (result.status !== 'deadlock' && result.violation?.name !== 'Conforms'))
    return {
      ...summary,
      status: 'error',
      error: result.failure?.message ?? `tla-ts reported ${result.status}.`
    };
  let index = Number(formatValue(last.trace)) - 1;
  let step = Number(formatValue(last.step));
  let actions = traces[index];
  let after = step ? actions.slice(0, step).join(' -> ') : 'setup';
  if (result.status === 'deadlock')
    return {
      ...summary,
      status: 'mismatch',
      mismatch: {
        kind: 'action',
        actions: actions.slice(0, step + 1),
        detail: `the code took ${actions[step]} after ${after}, but the model does not allow it`
      }
    };
  let modelView = parseRecord(formatValue(last.modelView));
  let observed = views[index][step];
  let fields = [...new Set([...Object.keys(modelView), ...Object.keys(observed)])]
    .sort()
    .map(field => ({
      field,
      model: modelView[field] ?? null,
      code: field in observed ? toTla(observed[field]) : null
    }))
    .filter(item => item.model !== item.code);
  return {
    ...summary,
    status: 'mismatch',
    mismatch: {
      kind: 'state',
      actions: actions.slice(0, step),
      fields,
      detail: `after ${after}, ${fields.map(item => `${item.field} is ${item.code} in the code but ${item.model} in the model`).join('; ')}`
    }
  };
}
