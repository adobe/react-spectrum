/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

export const adapterId = 'use-press-pointer-v1';
const properties = [
  'PointerOwnership',
  'ActivationUnique',
  'CancellationSafe',
  'LifecycleBalanced',
  'CleanupComplete'
];
export const initial = {mounted: true, isDisabled: false, pointerType: 'touch', pointerIds: [1, 2]};

export function createTrace(property, actions) {
  return validateTrace({
    schemaVersion: 1,
    package: 'use-press',
    adapter: adapterId,
    property,
    initial,
    actions: actions.map(type => ({type}))
  });
}

// Validate the input protocol, not a second implementation of the hook.
// State-dependent feasibility (e.g. a pending fallback) is checked during replay.
export function validateTrace(trace) {
  if (
    !trace ||
    trace.schemaVersion !== 1 ||
    trace.package !== 'use-press' ||
    trace.adapter !== adapterId ||
    !properties.includes(trace.property)
  ) {
    throw new Error('Unsupported usePress trace version, adapter, package, or property.');
  }
  if (
    Object.keys(trace).some(
      key =>
        ![
          'schemaVersion',
          'package',
          'adapter',
          'property',
          'initial',
          'actions',
          'origin'
        ].includes(key)
    )
  )
    throw new Error('Unknown trace field.');
  let input = trace.initial;
  if (
    !input ||
    Object.keys(input).length !== 4 ||
    input.mounted !== true ||
    input.isDisabled !== false ||
    input.pointerType !== 'touch' ||
    JSON.stringify(input.pointerIds) !== '[1,2]'
  )
    throw new Error('Unsupported initial conditions.');
  if (!Array.isArray(trace.actions) || trace.actions.length < 1 || trace.actions.length > 8)
    throw new Error('Replay requires 1–8 actions.');
  let mounted = true;
  let disabled = false;
  let phase = 'idle';
  let otherDown = false;
  for (let action of trace.actions) {
    if (!action || Object.keys(action).length !== 1 || typeof action.type !== 'string')
      throw new Error('Actions must contain only a type.');
    let valid = true;
    switch (action.type) {
      case 'PointerDown':
        valid = mounted && !disabled && phase === 'idle';
        phase = 'down';
        break;
      case 'PointerUp':
        valid = phase === 'down';
        phase = 'released';
        break;
      case 'PointerCancel':
        valid = phase === 'down';
        phase = 'canceled';
        break;
      case 'OtherPointerDown':
        valid = !otherDown;
        otherDown = true;
        break;
      case 'OtherPointerCancel':
        valid = otherDown;
        otherDown = false;
        break;
      case 'NativeClick':
        valid = mounted && phase === 'released';
        phase = 'done';
        break;
      case 'OtherClick':
        valid = mounted && phase === 'released';
        break;
      case 'Fallback':
        valid = mounted && phase === 'released';
        break;
      case 'Disable':
        valid = mounted && !disabled;
        disabled = true;
        break;
      case 'Enable':
        valid = mounted && disabled;
        disabled = false;
        break;
      case 'Unmount':
        valid = mounted;
        mounted = false;
        break;
      default:
        throw new Error(`Unsupported action: ${action.type}`);
    }
    if (!valid) throw new Error(`Invalid input ordering at ${action.type}.`);
  }
  return trace;
}

// Values in the checker report use TLA+ syntax, not tla-ts's internal value classes.
// Use the explicit model variable rather than the checker's possibly generic Next label.
export function fromTlaTS(report, property) {
  let states = report.violation?.trace;
  if (
    report.schemaVersion !== 1 ||
    report.backend !== 'tla-ts' ||
    report.status !== 'invariant-violation' ||
    report.violation?.name !== property ||
    report.violation.loopStart !== null ||
    !Array.isArray(states) ||
    states.length < 2 ||
    states.length > 9
  )
    throw new Error('Missing or unsupported tla-ts state trace.');
  let actions = states.map((item, index) => {
    let action = item.state?.action?.match(/^"(\w+)"$/)?.[1];
    if (item.state?.step !== String(index) || !action)
      throw new Error('Trace lacks sequential steps and action labels.');
    return action;
  });
  if (actions.shift() !== 'Init') throw new Error('Unsupported initial model state.');
  return createTrace(property, actions);
}
