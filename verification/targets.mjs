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
import {join, relative, resolve, sep} from 'node:path';
import {runProcess} from './process.mjs';
import {tmpdir} from 'node:os';

const targetNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Targets drive real code through verification/<name>/target.tsx. Runs happen
// inside Vitest (targets.config.ts): jsdom for exploration, Chromium for replaying traces.
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

function evidenceDirectory(root, output, name) {
  let parent = resolve(output || tmpdir());
  mkdirSync(parent, {recursive: true});
  let local = relative(realpathSync(root), realpathSync(parent));
  if (local === '' || (!local.startsWith(`..${sep}`) && local !== '..' && !local.startsWith(sep)))
    throw new Error('Run evidence must be outside the checkout. Use a temporary output directory.');
  return mkdtempSync(join(parent, `verification-${name}-`));
}

export function exitCode(result) {
  if (result.mode === 'replay')
    return result.status === 'reproduced' ? 1 : result.status === 'not-reproduced' ? 0 : 2;
  return result.status === 'passed' ? 0 : result.status === 'violations' ? 1 : 2;
}

export async function runTarget(root, name, options = {}, dependencies = {}) {
  let execute = dependencies.execute || runProcess;
  if (!discoverTargets(root).includes(name)) throw new Error(`Unknown target: ${name}`);
  let mode = options.mode || 'explore';
  let environment = options.environment || (mode === 'replay' ? 'chromium' : 'jsdom');
  if (!['jsdom', 'chromium'].includes(environment))
    throw new Error('--environment must be jsdom or chromium.');
  let trace;
  if (mode === 'replay') {
    if (!options.trace) throw new Error('replay requires --trace <file>.');
    if (statSync(options.trace).size > 1024 * 1024) throw new Error('Trace exceeds 1 MiB.');
    trace = JSON.parse(readFileSync(options.trace, 'utf8'));
  }
  let timeoutMs = options.timeoutMs || 600000;
  let directory = evidenceDirectory(root, options.output, name);
  let request = {
    target: name,
    mode,
    environment,
    output: join(directory, 'result.json'),
    timeoutMs,
    options: {depth: options.depth, maxRuns: options.maxRuns},
    trace
  };
  let log = join(directory, 'vitest.log');
  options.onProgress?.(`Running ${mode} for ${name} in ${environment}. Evidence: ${directory}`);
  let processResult = await execute(
    'yarn',
    ['vitest', 'run', '--config', 'verification/targets.config.ts'],
    {
      cwd: root,
      env: {
        ...(options.env || process.env),
        COREPACK_ENABLE_NETWORK: '0',
        VERIFY_REQUEST: JSON.stringify(request)
      },
      // Leave time for Vitest and the browser to start and stop.
      timeoutMs: timeoutMs + 60000,
      log,
      signal: options.signal
    }
  );
  let result;
  try {
    result = JSON.parse(readFileSync(request.output, 'utf8'));
  } catch {
    result = {
      status: processResult.timedOut
        ? 'timed-out'
        : processResult.interrupted
          ? 'interrupted'
          : 'error',
      error: `Vitest did not produce a result. See ${log}.`,
      output: processResult.output?.slice(-4000)
    };
  }
  result = {...result, mode, target: name, environment, directory, log};
  for (let violation of result.violations || []) {
    violation.path = join(directory, `${violation.invariant}.trace.json`);
    let {path, ...trace} = violation;
    writeFileSync(path, JSON.stringify(trace, null, 2) + '\n');
  }
  result.exitCode = exitCode(result);
  writeFileSync(join(directory, 'summary.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}
