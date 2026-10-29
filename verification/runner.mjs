/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {classify, commandFor, inspectTools, requirements} from './adapters.mjs';
import {coveredFiles, selectChecks} from './metadata.mjs';
import {createHash} from 'node:crypto';
import {inspectPackage} from './status.mjs';
import {join, relative, resolve, sep} from 'node:path';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync
} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {runProcess} from './process.mjs';
import {tmpdir} from 'node:os';

export function fingerprints(root, metadata) {
  let groups = coveredFiles(metadata);
  let paths = new Set([
    ...groups.sourceFiles,
    ...groups.verificationFiles,
    `verification/${metadata.name}/review.json`,
    'package.json',
    'yarn.lock',
    ...readdirSync(join(root, 'verification'))
      .filter(name => name.endsWith('.mjs'))
      .map(name => `verification/${name}`)
  ]);
  return Object.fromEntries(
    [...paths].sort().map(path => {
      try {
        return [
          path,
          createHash('sha256')
            .update(readFileSync(join(root, path)))
            .digest('hex')
        ];
      } catch (error) {
        if (error.code === 'ENOENT') return [path, null];
        throw error;
      }
    })
  );
}

export function exitCode(result) {
  if (
    !result.provenance.valid ||
    result.checks.some(check => ['infrastructure-error', 'inconclusive'].includes(check.outcome))
  )
    return 2;
  return result.checks.some(check =>
    ['model-counterexample', 'implementation-failure'].includes(check.outcome)
  )
    ? 1
    : 0;
}

export async function runPackage(root, metadata, options = {}, dependencies = {}) {
  let execute = dependencies.execute || runProcess;
  let doctor = dependencies.doctor || inspectTools;
  let env = {...(options.env || process.env), COREPACK_ENABLE_NETWORK: '0'};
  for (let variable of [
    ...(metadata.mutationEnvironment || []),
    metadata.replay?.traceEnvironment,
    metadata.replay?.resultEnvironment,
    metadata.validation?.receiptEnvironment
  ].filter(Boolean)) {
    if (env[variable])
      throw new Error(
        `Unset ${variable} before running the harness. Use replay or validate for controlled runs.`
      );
  }
  let checks = options.checks || selectChecks(metadata, options.property);
  let correspondence = inspectPackage(root, metadata.name);
  if (correspondence.status === 'error') throw new Error(correspondence.error);
  let before = fingerprints(root, metadata);
  for (let path of Object.values(coveredFiles(metadata)).flat()) {
    if (!before[path]) throw new Error(`Missing covered file: ${path}`);
  }
  let parent = resolve(options.output || tmpdir());
  mkdirSync(parent, {recursive: true});
  let local = relative(realpathSync(root), realpathSync(parent));
  if (local === '' || (!local.startsWith(`..${sep}`) && local !== '..' && !local.startsWith(sep))) {
    throw new Error('Run evidence must be outside the checkout. Use a temporary output directory.');
  }
  let directory = mkdtempSync(join(parent, `verification-${metadata.name}-`));
  let result = {
    schemaVersion: 1,
    package: metadata.name,
    mode: options.mode || 'run',
    startedAt: new Date().toISOString(),
    directory,
    property: options.property || null,
    scope: {
      bounds: metadata.bounds,
      assumptions: metadata.assumptions,
      exclusions: metadata.exclusions
    },
    correspondence,
    provenance: {
      valid: true,
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      files: before
    },
    tools: {},
    checks: []
  };
  if (options.prepare) {
    let prepared = await options.prepare(directory);
    Object.assign(env, prepared.environment);
    result.inputs = prepared.inputs;
  }
  let save = () =>
    writeFileSync(join(directory, 'results.json'), JSON.stringify(result, null, 2) + '\n');
  save();
  options.onProgress?.(`Evidence: ${directory}`);
  result.tools = await doctor(root, metadata, checks, env);
  save();
  for (let check of checks) {
    let item = {
      id: check.id,
      kind: check.kind,
      properties: check.properties,
      requestedProperties: check.requestedProperties
    };
    let missing = requirements(check).filter(name => !result.tools[name]?.available);
    if (options.signal?.aborted) {
      result.checks.push({
        ...item,
        execution: 'not-run',
        outcome: 'inconclusive',
        detail: 'Run interrupted.'
      });
    } else if (missing.length) {
      result.checks.push({
        ...item,
        execution: 'not-run',
        outcome: 'infrastructure-error',
        detail: `Unavailable tools: ${missing.join(', ')}`
      });
    } else {
      let command = commandFor(root, check, directory, result.tools);
      let log = join(directory, `${check.id}.log`);
      let timeoutMs = options.timeoutMs || check.timeoutMs;
      options.onProgress?.(`Running ${check.id} (${check.kind}, ${timeoutMs} ms budget)...`);
      let processResult;
      try {
        processResult = await execute(command.command, command.args, {
          cwd: command.cwd,
          env,
          timeoutMs,
          log,
          signal: options.signal
        });
      } catch (error) {
        processResult = {error: error.message};
      }
      result.checks.push({
        ...item,
        command,
        log,
        timeoutMs,
        exitCode: processResult.code,
        durationMs: processResult.durationMs,
        ...classify(check, processResult, command.report)
      });
      let completed = result.checks.at(-1);
      if (completed.outcome === 'model-counterexample' && metadata.replay) {
        try {
          let adapter = await import(pathToFileURL(resolve(root, metadata.replay.adapter)).href);
          let trace = adapter.fromTlaTS(
            JSON.parse(readFileSync(command.report, 'utf8')),
            completed.violatedProperty
          );
          trace.origin = {kind: check.kind, check: check.id, files: before};
          let path = join(directory, `${check.id}.trace.json`);
          writeFileSync(path, JSON.stringify(trace, null, 2) + '\n');
          completed.replay = {status: 'exported', trace: path};
        } catch (error) {
          completed.replay = {status: 'unsupported', detail: error.message};
        }
      }
    }
    options.onProgress?.(`${check.id}: ${result.checks.at(-1).outcome}`);
    save();
  }
  let after = fingerprints(root, metadata);
  result.provenance.changedFiles = [
    ...new Set([...Object.keys(before), ...Object.keys(after)])
  ].filter(path => before[path] !== after[path]);
  result.provenance.valid = result.provenance.changedFiles.length === 0;
  result.completedAt = new Date().toISOString();
  result.exitCode = exitCode(result);
  save();
  return result;
}
