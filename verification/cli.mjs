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

import {discoverTargets, runTarget} from './targets.mjs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';
import {resolve} from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const help = `Behavioral verification (local, opt-in)

  yarn verify list [--json]
  yarn verify explore <target> [--depth <n>] [--max-runs <n>] [--environment jsdom|chromium]
  yarn verify replay <target> --trace <file> [--environment chromium|jsdom]
  yarn verify conform <target> [--depth <n>] [--max-runs <n>] [--environment jsdom|chromium]
  yarn verify check <target> [--depth <n>]

explore runs every action sequence of verification/<target>/target.tsx up to the
depth bound against the real code (jsdom by default) and writes one shortest trace
per violated invariant. replay runs a trace again, by default in Chromium with
Playwright and CDP input. For targets with a TLA+ model, conform checks that the
real code's explored paths are behaviors of the model, and check model-checks each
invariant with tla-ts (--depth up to 100) and writes counterexamples that replay
runs against the real code. All accept --timeout-ms <ms>, --output <directory>
(evidence goes in a fresh directory outside the checkout), and --json.

Exit codes: explore/check: 0 no violations, 1 violations found, 2 incomplete/error.
replay: 0 not reproduced, 1 reproduced, 2 different failure/error.
conform: 0 conforms, 1 mismatch, 2 error.
See verification/README.md.`;

function printViolations(result, write) {
  for (let violation of result.violations || []) {
    write(`  ${violation.invariant}: ${violation.detail}`);
    write(`    ${violation.actions.join(' -> ')}`);
    write(`    Replay: yarn verify replay ${result.target} --trace ${violation.path}`);
  }
}

let ms = value => `${Math.round(value)} ms`;

// A run that failed before reporting has only a status and an error, so each
// summary is printed only when its fields are present.
export function printResult(result, write) {
  if (result.mode === 'check') {
    write(
      `${result.target}: ${result.status}${result.invariants ? ` (model; depth ${result.depth}; ${ms(result.durationMs)})` : ''}`
    );
    for (let item of result.invariants || [])
      write(
        `  ${item.invariant}: ${item.status} (${item.distinctStates} distinct states)${item.error ? ` — ${item.error}` : ''}`
      );
    printViolations(result, write);
  } else if (result.mode === 'conform') {
    let exploration = result.exploration;
    write(
      `${result.target}: ${result.status}${result.traces === undefined ? '' : ` (${result.traces} traces, ${result.steps} steps from ${exploration.runs} runs of the real code; ${result.distinctStates} model states; ${ms(result.durationMs)})`}`
    );
    if (result.mismatch) {
      write(`  ${result.mismatch.detail}`);
      write(`    ${result.mismatch.actions.join(' -> ')}`);
    }
    if (exploration?.neverEnabled?.length)
      write(`  Never enabled (check guards or bounds): ${exploration.neverEnabled.join(', ')}`);
  } else if (result.mode === 'replay') {
    write(
      `${result.target}: ${result.status} in ${result.environment}${result.step != null ? ` at step ${result.step}` : ''}${result.invariant === undefined ? '' : ` (${result.invariant})`}`
    );
    for (let failure of result.failures || []) write(`  ${failure.invariant}: ${failure.detail}`);
  } else {
    write(
      `${result.target}: ${result.status} (${result.environment}${result.runs === undefined ? '' : `; depth ${result.depthReached}/${result.bounds.depth}; ${result.runs} runs; ${result.distinctStates} distinct states; ${ms(result.durationMs)}`})`
    );
    printViolations(result, write);
    if (result.neverEnabled?.length)
      write(`  Never enabled (check guards or bounds): ${result.neverEnabled.join(', ')}`);
  }
  if (result.error) write(`  Error: ${result.error.split('\n')[0]}`);
  if (result.consoleErrors?.length)
    write(`  Console errors: ${result.consoleErrors.length} (see result.json)`);
  write(`Evidence: ${result.directory}`);
}

export async function main(
  args,
  repositoryRoot = root,
  write = console.log,
  progress = console.error
) {
  try {
    let {values, positionals} = parseArgs({
      args,
      allowPositionals: true,
      options: {
        help: {type: 'boolean'},
        json: {type: 'boolean'},
        'timeout-ms': {type: 'string'},
        output: {type: 'string'},
        trace: {type: 'string'},
        depth: {type: 'string'},
        'max-runs': {type: 'string'},
        environment: {type: 'string'}
      }
    });
    if (values.help || !positionals.length) {
      write(help);
      return 0;
    }
    let [command, name] = positionals;
    if (
      !['list', 'explore', 'replay', 'conform', 'check'].includes(command) ||
      positionals.length > 2
    )
      throw new Error('Unknown command or too many arguments. Use --help.');
    if (command === 'list') {
      if (name || Object.keys(values).some(key => key !== 'json'))
        throw new Error('list takes no arguments other than --json.');
      let targets = discoverTargets(repositoryRoot);
      if (values.json) write(JSON.stringify({targets}, null, 2));
      else targets.forEach(target => write(`${target}: verification/${target}/README.md`));
      return 0;
    }
    if (!name) throw new Error(`${command} requires a target name.`);
    if (values.trace !== undefined && command !== 'replay')
      throw new Error('--trace requires replay.');
    if (values.depth !== undefined && command === 'replay')
      throw new Error('--depth requires explore, conform, or check.');
    if (values['max-runs'] !== undefined && !['explore', 'conform'].includes(command))
      throw new Error('--max-runs requires explore or conform.');
    if (values.output === '') throw new Error('--output must not be empty.');
    let count = (option, max) => {
      if (values[option] === undefined) return undefined;
      let value = Number(values[option]);
      if (!Number.isSafeInteger(value) || value < 1 || value > max)
        throw new Error(`--${option} must be an integer from 1 to ${max}.`);
      return value;
    };
    let options = {
      mode: command,
      environment: values.environment,
      trace: values.trace,
      depth: count('depth', command === 'check' ? 100 : 20),
      maxRuns: count('max-runs', 1000000),
      timeoutMs: count('timeout-ms', 3600000),
      output: values.output,
      onProgress: values.json ? undefined : progress
    };
    let controller = new AbortController();
    let abort = () => controller.abort();
    process.on('SIGINT', abort);
    process.on('SIGTERM', abort);
    try {
      let result = await runTarget(repositoryRoot, name, {...options, signal: controller.signal});
      if (values.json) write(JSON.stringify(result, null, 2));
      else printResult(result, write);
      return result.exitCode;
    } finally {
      process.off('SIGINT', abort);
      process.off('SIGTERM', abort);
    }
  } catch (error) {
    // Preserve a machine-readable error for automation callers too.
    write(
      args.includes('--json') ? JSON.stringify({error: error.message}) : `Error: ${error.message}`
    );
    return 2;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = await main(process.argv.slice(2));
}
