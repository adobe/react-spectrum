/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {discoverPackages, readPackage, selectChecks} from './metadata.mjs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {inspectTools} from './adapters.mjs';
import {parseArgs} from 'node:util';
import {resolve} from 'node:path';
import {runPackage} from './runner.mjs';
import {runReplay, runValidation} from './workflows.mjs';
import {runStatus} from './status.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const help = `Behavioral verification (local, opt-in)

  yarn verify list [package] [--json]
  yarn verify status [package] [--json]
  yarn verify doctor <package> [--property <id>] [--json]
  yarn verify run <package> [--property <id>] [--timeout-ms <ms>] [--output <directory>] [--json]
  yarn verify replay <package> --trace <file> [--minimize] [--max-replays <count>] [--json]
  yarn verify validate <package> [--property <id>] [--json]

list/status use only Node built-ins. doctor checks installed tools and launches
a short-lived browser when required. No command installs tools or renews review
records. run keeps logs/results in a fresh temporary directory outside the checkout.
--timeout-ms overrides each check's budget (1–3600000 ms).
A property filter selects associated checks; shared model configs and regression
suites may check additional properties. replay/validate also accept --timeout-ms
and --output. Replay uses the trace's property and records synthetic browser input.
--backend tlc|tla-ts selects the model checker for doctor/run/validate (default: tlc).
It does not change implementation checks. The optional tool must be registered.
--minimize attempts up to 20 replays (override: 1–100), preserving input validity
and the same property failure. Validation uses clean/mutated/restored runs.

Exit codes: run: 0 checks passed, 1 counterexample/assertion failure,
2 invalid setup, incomplete run, or changed inputs. Correspondence is separate.
status: 0 matches record, 1 needs review/unrecorded, 2 invalid metadata.
replay: 0 not reproduced, 1 reproduced, 2 unsupported/inconclusive/error.
validate: 0 controls detected and checks pass, 1 baseline checks fail,
2 incomplete/failed sensitivity validation or infrastructure error.
See verification/README.md for scope and interpretation.`;

function printPackage(metadata, write) {
  write(`${metadata.name}: ${metadata.description}`);
  for (let property of metadata.properties) {
    write(`  ${property.id}: ${property.contract}`);
    write(
      `    Checks: ${selectChecks(metadata, property.id)
        .map(check => `${check.id} (${check.kind})`)
        .join(', ')}`
    );
    for (let source of metadata.sources.filter(source => source.properties.includes(property.id)))
      write(`    ${source.path}: ${source.functions.join(', ')}`);
  }
  write(`  Bounds: ${metadata.bounds}`);
}

function printResult(result, write) {
  write(`${result.package}: correspondence ${result.correspondence.status}`);
  for (let check of result.checks) {
    write(
      `  ${check.id}${check.backend ? ` [${check.backend}]` : ''}: ${check.outcome}${check.violatedProperty ? ` (${check.violatedProperty})` : ''}${check.detail ? ` — ${check.detail}` : ''}`
    );
    if (check.replay) write(`    Replay: ${check.replay.trace || check.replay.detail}`);
  }
  if (result.replay) write(`Replay: ${result.replay.outcome}; evidence: ${result.replay.evidence}`);
  if (result.replay?.minimization)
    write(
      `Minimized trace: ${result.replay.minimization.trace} (${result.replay.minimization.complete ? 'complete' : 'budgeted/incomplete'})`
    );
  if (result.validation) {
    for (let control of result.validation.controls)
      write(`  Mutation ${control.id} (${control.driver}): ${control.outcome}`);
    for (let property of result.validation.properties)
      write(`  Validation ${property.property}: ${property.outcome}`);
    write(`Validation report: ${result.directory}/validation.json`);
  }
  if (!result.provenance.valid)
    write(
      `INVALID PROVENANCE: files changed during execution: ${result.provenance.changedFiles.join(', ')}`
    );
  write(`Evidence: ${result.directory}`);
  write(
    'Model passes apply only to the stated bounds. Implementation checks cover selected traces. Review records were not changed.'
  );
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
        property: {type: 'string'},
        backend: {type: 'string'},
        'timeout-ms': {type: 'string'},
        output: {type: 'string'},
        trace: {type: 'string'},
        minimize: {type: 'boolean'},
        'max-replays': {type: 'string'}
      }
    });
    if (values.help || !positionals.length) {
      write(help);
      return 0;
    }
    let [command, name] = positionals;
    if (
      positionals.length > 2 ||
      !['list', 'status', 'doctor', 'run', 'replay', 'validate'].includes(command)
    )
      throw new Error('Unknown command or too many arguments. Use --help.');
    if (values.property !== undefined && !['run', 'doctor', 'validate'].includes(command))
      throw new Error('--property is only supported by run, doctor, and validate.');
    if (values.backend !== undefined && !['run', 'doctor', 'validate'].includes(command))
      throw new Error('--backend is only supported by run, doctor, and validate.');
    if (
      (values['timeout-ms'] !== undefined || values.output !== undefined) &&
      !['run', 'replay', 'validate'].includes(command)
    )
      throw new Error('--timeout-ms and --output require an execution command.');
    if (
      (values.trace !== undefined ||
        values.minimize !== undefined ||
        values['max-replays'] !== undefined) &&
      command !== 'replay'
    )
      throw new Error('Trace/minimization options require replay.');
    if (values['max-replays'] !== undefined && !values.minimize)
      throw new Error('--max-replays requires --minimize.');
    if (values.property === '' || values.output === '')
      throw new Error('Options must not be empty.');
    if (command === 'status')
      return runStatus(
        [...(name ? [name] : []), ...(values.json ? ['--json'] : [])],
        repositoryRoot,
        write
      );
    if (command === 'list') {
      let packages = (name ? [name] : discoverPackages(repositoryRoot)).map(name =>
        readPackage(repositoryRoot, name)
      );
      if (values.json) write(JSON.stringify({packages}, null, 2));
      else packages.forEach(metadata => printPackage(metadata, write));
      return 0;
    }
    if (!name) throw new Error(`${command} requires a package name.`);
    let metadata = readPackage(repositoryRoot, name);
    let checks = selectChecks(metadata, values.property, values.backend);
    if (command === 'doctor') {
      let tools = await inspectTools(repositoryRoot, metadata, checks);
      if (values.json)
        write(
          JSON.stringify({package: name, checks: checks.map(check => check.id), tools}, null, 2)
        );
      else
        for (let [tool, result] of Object.entries(tools))
          write(`${tool}: ${result.available ? `available (${result.version})` : result.error}`);
      return Object.values(tools).every(tool => tool.available) ? 0 : 2;
    }
    let timeoutMs = values['timeout-ms'] === undefined ? undefined : Number(values['timeout-ms']);
    if (
      timeoutMs !== undefined &&
      (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 3600000)
    )
      throw new Error('--timeout-ms must be an integer from 1 to 3600000.');
    let maxReplays = values['max-replays'] === undefined ? 20 : Number(values['max-replays']);
    if (!Number.isSafeInteger(maxReplays) || maxReplays < 1 || maxReplays > 100)
      throw new Error('--max-replays must be an integer from 1 to 100.');
    let controller = new AbortController();
    let abort = () => controller.abort();
    process.on('SIGINT', abort);
    process.on('SIGTERM', abort);
    try {
      let execute =
        command === 'replay' ? runReplay : command === 'validate' ? runValidation : runPackage;
      let result = await execute(repositoryRoot, metadata, {
        property: values.property,
        backend: values.backend,
        trace: values.trace,
        minimize: values.minimize,
        maxReplays,
        timeoutMs,
        output: values.output,
        signal: controller.signal,
        onProgress: values.json ? undefined : progress
      });
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
