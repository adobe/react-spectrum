/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {createHash} from 'node:crypto';
import {fingerprints, runPackage} from './runner.mjs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFileSync, statSync, writeFileSync} from 'node:fs';

const hash = value => createHash('sha256').update(value).digest('hex');
const save = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function compareProvenance(result, other) {
  let changed = [
    ...new Set([...Object.keys(result.provenance.files), ...Object.keys(other)])
  ].filter(path => result.provenance.files[path] !== other[path]);
  result.provenance.changedFiles = [
    ...new Set([...(result.provenance.changedFiles || []), ...changed])
  ];
  if (changed.length) result.provenance.valid = false;
}

export function assessReplay(check, evidence, trace) {
  if (['infrastructure-error', 'inconclusive'].includes(check.outcome)) {
    return evidence?.limitation?.startsWith('Unsupported replay') ? 'unsupported' : check.outcome;
  }
  if (
    !evidence ||
    evidence.schemaVersion !== 1 ||
    evidence.property !== trace.property ||
    evidence.inputMode !== 'synthetic' ||
    !Array.isArray(evidence.observations) ||
    evidence.limitation
  )
    return 'infrastructure-error';
  let observations = evidence.observations;
  if (
    !observations.length ||
    observations.some(
      (item, index) => item.step !== index + 1 || item.action !== trace.actions[index]?.type
    )
  )
    return 'infrastructure-error';
  let marker = `verification:replay:${trace.property}`;
  if (
    check.outcome === 'implementation-failure' &&
    evidence.violation?.property === trace.property &&
    evidence.violation.step === observations.length &&
    check.failures?.length === 1 &&
    check.failures[0].messages.every(message => message.includes(marker))
  )
    return 'reproduced';
  if (
    check.outcome === 'implementation-checks-pass' &&
    evidence.violation === null &&
    observations.length === trace.actions.length
  )
    return 'not-reproduced';
  return 'infrastructure-error';
}

async function replayOnce(root, metadata, trace, options, run) {
  let replay = metadata.replay;
  let check = {
    ...metadata.checks.find(check => check.id === replay.check),
    id: 'replay',
    testFile: replay.testFile,
    properties: [trace.property],
    requestedProperties: [trace.property],
    testNamePattern: replay.testNamePattern,
    testNamePatterns: {[trace.property]: replay.testNamePattern}
  };
  let evidencePath;
  let result = await run(root, metadata, {
    ...options,
    mode: 'replay',
    checks: [check],
    prepare: directory => {
      let tracePath = join(directory, 'trace.json');
      evidencePath = join(directory, 'observations.json');
      save(tracePath, trace);
      return {
        environment: {
          [replay.traceEnvironment]: tracePath,
          [replay.resultEnvironment]: evidencePath
        },
        inputs: {trace: tracePath, sha256: hash(JSON.stringify(trace))}
      };
    }
  });
  let evidence;
  try {
    evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
  } catch {
    /* Missing evidence cannot confirm a replay. */
  }
  result.replay = {
    outcome: assessReplay(result.checks[0], evidence, trace),
    property: trace.property,
    inputMode: 'synthetic',
    evidence: evidencePath,
    originChangedFiles: trace.origin?.files
      ? Object.keys(trace.origin.files).filter(
          path => result.provenance.files[path] !== trace.origin.files[path]
        )
      : null
  };
  result.exitCode = !result.provenance.valid
    ? 2
    : result.replay.outcome === 'reproduced'
      ? 1
      : result.replay.outcome === 'not-reproduced'
        ? 0
        : 2;
  save(join(result.directory, 'results.json'), result);
  return result;
}

export async function runReplay(root, metadata, options, dependencies = {}) {
  if (!metadata.replay) throw new Error('This package has no replay adapter.');
  if (!options.trace) throw new Error('replay requires --trace <file>.');
  if (statSync(options.trace).size > 1024 * 1024) throw new Error('Trace exceeds 1 MiB.');
  let trace = JSON.parse(readFileSync(options.trace, 'utf8'));
  let adapter = await import(pathToFileURL(resolve(root, metadata.replay.adapter)).href);
  adapter.validateTrace(trace);
  if (trace.adapter !== metadata.replay.adapterId)
    throw new Error('Trace adapter does not match package metadata.');
  let run = dependencies.run || runPackage;
  let result = await replayOnce(root, metadata, trace, options, run);
  if (options.minimize && result.replay.outcome === 'reproduced' && result.provenance.valid) {
    let current = trace;
    let trials = [];
    let budget = options.maxReplays || 20;
    let complete = true;
    for (let index = 0; index < current.actions.length && current.actions.length > 1; ) {
      let candidate = {...current, actions: current.actions.filter((_, i) => i !== index)};
      try {
        adapter.validateTrace(candidate);
      } catch {
        index++;
        continue;
      }
      if (trials.length >= budget || options.signal?.aborted) {
        complete = false;
        break;
      }
      let trial = await replayOnce(root, metadata, candidate, {...options, minimize: false}, run);
      trials.push({directory: trial.directory, outcome: trial.replay.outcome, removedIndex: index});
      if (!trial.provenance.valid || !same(trial.provenance.files, result.provenance.files)) {
        compareProvenance(result, trial.provenance.files);
        result.provenance.valid = false;
        complete = false;
        break;
      }
      if (['infrastructure-error', 'inconclusive'].includes(trial.replay.outcome)) {
        complete = false;
        break;
      }
      if (trial.replay.outcome === 'reproduced') {
        current = candidate;
        index = 0;
      } else index++;
    }
    let path = join(result.directory, 'minimized.trace.json');
    save(path, {
      ...current,
      origin: {...trace.origin, kind: 'minimized', parentTraceHash: hash(JSON.stringify(trace))}
    });
    result.replay.minimization = {
      trace: path,
      complete,
      trials,
      originalActions: trace.actions.length,
      actions: current.actions.length,
      guarantee:
        'Single-action deletion minimum within the validated input protocol when complete; not a globally shortest trace.'
    };
  }
  let after = fingerprints(root, metadata);
  compareProvenance(result, after);
  if (!result.provenance.valid) result.exitCode = 2;
  save(join(result.directory, 'results.json'), result);
  return result;
}

export function assessMutation(control, before, mutated, restored, receipt, sourceHash, source) {
  if (before.outcome === 'implementation-failure') return 'baseline-failure';
  if (
    before.outcome !== 'implementation-checks-pass' ||
    restored.outcome !== 'implementation-checks-pass'
  )
    return 'inconclusive';
  if (
    !same(before.testNames, mutated.testNames) ||
    !same(before.testNames, restored.testNames) ||
    !before.testNames?.length ||
    mutated.counts?.skipped
  )
    return 'inconclusive';
  if (
    !receipt ||
    receipt.schemaVersion !== 1 ||
    receipt.mutation !== control.id ||
    receipt.source !== source ||
    receipt.originalHash !== sourceHash ||
    !/^[a-f0-9]{64}$/.test(receipt.mutatedHash) ||
    receipt.mutatedHash === sourceHash
  )
    return 'infrastructure-error';
  if (mutated.outcome === 'implementation-checks-pass') return 'survived';
  if (mutated.outcome !== 'implementation-failure') return 'inconclusive';
  return mutated.failures?.length > 0 &&
    mutated.failures.every(
      failure =>
        new RegExp(control.testNamePattern).test(failure.name) &&
        failure.messages?.length > 0 &&
        failure.messages.every(message => message.includes(control.failureMarker))
    )
    ? 'detected'
    : 'unexpected-failure';
}

export async function runValidation(root, metadata, options = {}, dependencies = {}) {
  if (!metadata.validation) throw new Error('This package has no registered mutation controls.');
  let run = dependencies.run || runPackage;
  let validation = metadata.validation;
  let controls = validation.mutations
    .filter(control => !options.property || control.property === options.property)
    .flatMap(control => [
      {...control, driver: 'tests'},
      ...(control.replayActions
        ? [
            {
              ...control,
              driver: 'replay',
              testNamePattern: metadata.replay.testNamePattern,
              failureMarker: `verification:replay:${control.property}`
            }
          ]
        : [])
    ]);
  let baseline = await run(root, metadata, {...options, mode: 'validation-baseline'});
  let result = {
    ...baseline,
    mode: 'validate',
    validation: {baseline: baseline.directory, controls: [], properties: []}
  };
  let record = () => save(join(result.directory, 'validation.json'), result);
  record();
  try {
    for (let control of controls) {
      if (options.signal?.aborted) break;
      let replayTrace;
      if (control.driver === 'replay') {
        let adapter = await import(pathToFileURL(resolve(root, metadata.replay.adapter)).href);
        replayTrace = adapter.createTrace(control.property, control.replayActions);
      }
      let prepareReplay = directory => {
        if (!replayTrace) return {environment: {}, inputs: {}};
        let path = join(directory, 'trace.json');
        save(path, replayTrace);
        return {
          environment: {
            [metadata.replay.traceEnvironment]: path,
            [metadata.replay.resultEnvironment]: join(directory, 'observations.json')
          },
          inputs: {trace: path}
        };
      };
      let check = {
        ...metadata.checks.find(check => check.id === validation.check),
        properties: [control.property],
        requestedProperties: [control.property],
        testNamePattern: control.testNamePattern,
        testNamePatterns: {[control.property]: control.testNamePattern}
      };
      if (replayTrace) check.testFile = metadata.replay.testFile;
      let before = await run(root, metadata, {
        ...options,
        mode: 'mutation-baseline',
        checks: [check],
        prepare: prepareReplay
      });
      let mutated;
      let restored;
      let receiptPath;
      try {
        if (before.checks[0].outcome === 'implementation-checks-pass' && before.provenance.valid) {
          mutated = await run(root, metadata, {
            ...options,
            mode: 'mutation',
            checks: [check],
            prepare: directory => {
              receiptPath = join(directory, 'mutation.json');
              return {
                environment: {
                  ...prepareReplay(directory).environment,
                  [validation.environment]: control.id,
                  [validation.receiptEnvironment]: receiptPath
                },
                inputs: {mutation: control.id, receipt: receiptPath}
              };
            }
          });
        }
      } finally {
        restored = await run(root, metadata, {
          ...options,
          mode: 'mutation-restored',
          checks: [check],
          prepare: prepareReplay
        });
      }
      let receipt;
      try {
        receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
      } catch {
        /* A receipt is required to claim detection. */
      }
      let outcome = assessMutation(
        control,
        before.checks[0],
        mutated?.checks[0] || {},
        restored.checks[0],
        receipt,
        before.provenance.files[validation.source],
        validation.source
      );
      let stable = [before, mutated, restored]
        .filter(Boolean)
        .every(
          run => run.provenance.valid && same(run.provenance.files, baseline.provenance.files)
        );
      if (!stable) {
        for (let phase of [before, mutated, restored].filter(Boolean))
          compareProvenance(result, phase.provenance.files);
        outcome = 'inconclusive';
        result.provenance.valid = false;
      }
      result.validation.controls.push({
        id: control.id,
        driver: control.driver,
        property: control.property,
        outcome,
        before: before.directory,
        mutated: mutated?.directory,
        restored: restored.directory,
        receipt: receiptPath
      });
      options.onProgress?.(`${control.id} (${control.driver}): ${outcome}`);
      record();
    }
  } finally {
    let restored = await run(root, metadata, {...options, mode: 'validation-restored'});
    result.validation.restored = restored.directory;
    result.validation.restoredExitCode = restored.exitCode;
    result.provenance.valid &&=
      restored.provenance.valid && same(restored.provenance.files, baseline.provenance.files);
    compareProvenance(result, restored.provenance.files);
    let properties = metadata.properties.filter(
      property => !options.property || property.id === options.property
    );
    for (let property of properties) {
      let matching = result.validation.controls.filter(control => control.property === property.id);
      let failed = baseline.checks.some(
        check =>
          check.kind === 'vitest' &&
          check.outcome === 'implementation-failure' &&
          check.failures?.some(failure =>
            new RegExp(
              metadata.checks.find(item => item.id === check.id)?.testNamePatterns?.[property.id] ||
                '(?!)'
            ).test(failure.name)
          )
      );
      result.validation.properties.push({
        property: property.id,
        outcome: matching.length
          ? matching.every(control => control.outcome === 'detected')
            ? 'detected'
            : 'not-validated'
          : failed
            ? 'baseline-failure'
            : 'not-covered'
      });
    }
    let incomplete =
      result.validation.controls.length !== controls.length ||
      result.validation.properties.some(property =>
        ['not-validated', 'not-covered'].includes(property.outcome)
      );
    result.exitCode =
      !result.provenance.valid || incomplete || baseline.exitCode === 2 || restored.exitCode === 2
        ? 2
        : baseline.exitCode || restored.exitCode;
    result.completedAt = new Date().toISOString();
    record();
  }
  return result;
}
