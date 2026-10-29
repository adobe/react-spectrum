/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {createHash} from 'node:crypto';
import {join, relative, sep} from 'node:path';
import {lstatSync, readdirSync, readFileSync, realpathSync} from 'node:fs';

// Pin every distributed runtime file, including imported chunks, before importing code.
export function runtimeHash(directory) {
  let files = [];
  let visit = path => {
    let stat = lstatSync(join(directory, path));
    if (stat.isSymbolicLink()) throw new Error('tla-ts runtime must not contain symbolic links.');
    if (stat.isDirectory()) {
      for (let name of readdirSync(join(directory, path)).sort()) visit(`${path}/${name}`);
    } else if (stat.isFile()) {
      files.push([
        path,
        createHash('sha256')
          .update(readFileSync(join(directory, path)))
          .digest('hex')
      ]);
    } else throw new Error('Unsupported tla-ts runtime file.');
  };
  visit('package.json');
  visit('dist');
  return createHash('sha256').update(JSON.stringify(files)).digest('hex');
}

export function inspectTlaTS(root, directory, tool) {
  if (!directory) throw new Error(`Set ${tool.directoryEnv}. ${tool.acquisition}`);
  directory = realpathSync(directory);
  let local = relative(realpathSync(root), directory);
  if (local === '' || (!local.startsWith(`..${sep}`) && local !== '..' && !local.startsWith(sep)))
    throw new Error('Keep the tla-ts installation outside the checkout.');
  let sha256 = runtimeHash(directory);
  if (sha256 !== tool.sha256) throw new Error(`tla-ts checksum mismatch. ${tool.acquisition}`);
  let metadata = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  if (metadata.name !== 'tla-ts' || metadata.version !== tool.version)
    throw new Error(`Expected tla-ts ${tool.version}.`);
  return {directory, sha256, version: metadata.version};
}

export function classifyTlaTS(check, processResult, report) {
  if (report.schemaVersion !== 1 || report.backend !== 'tla-ts')
    throw new Error('Invalid tla-ts report.');
  let statistics = report.statistics;
  if (
    !statistics ||
    !['generatedStates', 'distinctStates', 'depth'].every(
      key => Number.isSafeInteger(statistics[key]) && statistics[key] >= 0
    )
  )
    throw new Error('Missing tla-ts state counts.');
  if (
    processResult.code === 0 &&
    report.status === 'success' &&
    !report.violation &&
    !report.failure
  )
    return {execution: 'completed', outcome: 'bounded-model-pass', statistics};
  if (
    processResult.code === 1 &&
    report.status === 'invariant-violation' &&
    !report.failure &&
    check.properties.includes(report.violation?.name) &&
    Array.isArray(report.violation.trace) &&
    report.violation.trace.length > 0
  ) {
    return {
      execution: 'completed',
      outcome: 'model-counterexample',
      statistics,
      violatedProperty: report.violation.name,
      uncheckedProperties: check.properties.filter(id => id !== report.violation.name)
    };
  }
  throw new Error(
    `tla-ts did not complete successfully or report a configured invariant violation (${report.status}). ${report.failure?.message || ''}`
  );
}
