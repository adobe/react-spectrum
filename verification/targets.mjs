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

import {basename, dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync
} from 'node:fs';
import {runProcess} from './process.mjs';
import {tmpdir} from 'node:os';

const targetNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Targets drive real code through verification/<name>/target.tsx. Runs happen
// inside Vitest (targets.config.ts): Node for model checking, jsdom for exploring
// the real code, and Chromium for replaying traces.
export function discoverTargets(root) {
  return readdirSync(join(root, 'verification'), {withFileTypes: true})
    .filter(
      entry =>
        entry.isDirectory() &&
        targetNamePattern.test(entry.name) &&
        existsSync(join(root, 'verification', entry.name, 'target.tsx'))
    )
    .map(entry => entry.name)
    .sort();
}

// The real path of `path`, which may not exist yet.
function realpathOf(path) {
  let missing = [];
  while (!existsSync(path)) {
    missing.unshift(basename(path));
    path = dirname(path);
  }
  return join(realpathSync(path), ...missing);
}

// Check before creating anything, so a rejected path leaves nothing in the checkout.
// `relative` returns an absolute path for another drive on Windows.
function evidenceDirectory(root, output, name) {
  let parent = resolve(output || tmpdir());
  let local = relative(realpathSync(root), realpathOf(parent));
  if (!isAbsolute(local) && local !== '..' && !local.startsWith(`..${sep}`))
    throw new Error('Run evidence must be outside the checkout. Use a temporary output directory.');
  mkdirSync(parent, {recursive: true});
  return mkdtempSync(join(parent, `verification-${name}-`));
}

export function exitCode(result) {
  if (result.mode === 'replay')
    return result.status === 'reproduced' ? 1 : result.status === 'not-reproduced' ? 0 : 2;
  if (result.mode === 'conform')
    return result.status === 'conforms' ? 0 : result.status === 'mismatch' ? 1 : 2;
  return result.status === 'passed' ? 0 : result.status === 'violations' ? 1 : 2;
}

// Runs one request in Vitest. Each stage of a run has its own request, result,
// and log files in the evidence directory.
async function runStage(root, directory, stage, request, options, execute) {
  let file = name => join(directory, stage ? `${stage}.${name}` : name);
  request = {...request, output: file('result.json')};
  let requestPath = file('request.json');
  writeFileSync(requestPath, JSON.stringify(request));
  let log = file('vitest.log');
  let processResult = await execute(
    'yarn',
    ['vitest', 'run', '--config', 'verification/targets.config.ts'],
    {
      cwd: root,
      env: {
        ...(options.env || process.env),
        COREPACK_ENABLE_NETWORK: '0',
        VERIFY_REQUEST_PATH: requestPath
      },
      // Leave time for Vitest and the browser to start and stop.
      timeoutMs: request.timeoutMs + 60000,
      log,
      signal: options.signal
    }
  );
  let failure = processResult.timedOut
    ? {status: 'timed-out', reason: 'timed out'}
    : processResult.interrupted
      ? {status: 'interrupted', reason: 'was interrupted'}
      : {
          status: 'error',
          reason: `failed (exit ${processResult.code}, signal ${processResult.signal ?? 'none'})`
        };
  let result;
  try {
    result = JSON.parse(readFileSync(request.output, 'utf8'));
  } catch {
    result = {
      status: failure.status,
      error: `Vitest did not produce a result. See ${log}.`,
      output: processResult.output?.slice(-4000)
    };
  }
  if (
    processResult.timedOut ||
    processResult.interrupted ||
    processResult.error ||
    processResult.code !== 0
  ) {
    result = {
      ...result,
      status: failure.status,
      error: processResult.error || `Vitest ${failure.reason}. See ${log}.`,
      output: processResult.output?.slice(-4000)
    };
  }
  return {...result, log};
}

export async function runTarget(root, name, options = {}, dependencies = {}) {
  let execute = dependencies.execute || runProcess;
  if (!discoverTargets(root).includes(name)) throw new Error(`Unknown target: ${name}`);
  let mode = options.mode || 'explore';
  let configPath = join(root, 'verification', name, 'target.json');
  let defaults = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
  let environment =
    options.environment ||
    (mode === 'check' ? 'jsdom' : mode === 'replay' ? 'chromium' : defaults.environment || 'jsdom');
  if (!['jsdom', 'chromium'].includes(environment))
    throw new Error('--environment must be jsdom or chromium.');
  if (mode === 'check' && environment !== 'jsdom') throw new Error(`${mode} runs in jsdom only.`);
  if (options.headed && (mode !== 'replay' || environment !== 'chromium'))
    throw new Error('--headed applies to replay in chromium only.');
  let trace;
  if (mode === 'replay') {
    if (!options.trace) throw new Error('replay requires --trace <file>.');
    if (statSync(options.trace).size > 1024 * 1024) throw new Error('Trace exceeds 1 MiB.');
    trace = JSON.parse(readFileSync(options.trace, 'utf8'));
  }
  let timeoutMs = options.timeoutMs || 600000;
  let directory = evidenceDirectory(root, options.output, name);
  options.onProgress?.(`Running ${mode} for ${name} in ${environment}. Evidence: ${directory}`);
  let request = {
    target: name,
    mode,
    environment,
    timeoutMs,
    options: {depth: options.depth, maxRuns: options.maxRuns},
    trace,
    headed: options.headed || undefined
  };
  let {log, ...output} = await runStage(root, directory, '', request, options, execute);
  let result = {...output, mode, target: name, environment, directory, log};
  for (let violation of result.violations || [])
    violation.path = join(directory, `${violation.invariant}.trace.json`);
  for (let {path, ...trace} of result.violations || [])
    writeFileSync(path, JSON.stringify(trace, null, 2) + '\n');
  // Replay each model counterexample on the real code in Chromium, comparing the
  // code with the model's View at each step and saving a screenshot of each.
  if (
    mode === 'check' &&
    options.replay !== false &&
    ['violations', 'timed-out'].includes(result.status) &&
    result.violations?.length
  ) {
    options.onProgress?.(
      `Replaying ${result.violations.length} counterexample(s) on the real code in chromium.`
    );
    let replayed = await runStage(
      root,
      directory,
      'replay',
      {
        ...request,
        mode: 'replay',
        environment: 'chromium',
        traces: result.violations.map(({path, ...trace}) => trace)
      },
      options,
      execute
    );
    result.violations.forEach((violation, i) => {
      let item = replayed.replays?.[i];
      violation.replay = item
        ? {
            status: item.status,
            step: item.step,
            failures: item.failures,
            error: item.error,
            divergence: item.divergence ?? null,
            screenshots: join(directory, `${violation.invariant}.steps`)
          }
        : {status: replayed.status, error: replayed.error ?? 'No replay result.'};
    });
    result.replayLog = replayed.log;
  }
  result.exitCode = exitCode(result);
  writeFileSync(join(directory, 'summary.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}
