/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {classify, commandFor, inspectTools, requirements} from '../adapters.mjs';
import {fileURLToPath} from 'node:url';
import {fromTlaTS} from '../use-press/replay.mjs';
import {inspectTlaTS, runtimeHash} from '../tla-ts.mjs';
import {join} from 'node:path';
import {main} from '../cli.mjs';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {readPackage, selectChecks} from '../metadata.mjs';
import {runPackage} from '../runner.mjs';
import {runProcess} from '../process.mjs';
import {test} from 'node:test';
import {tmpdir} from 'node:os';

const root = fileURLToPath(new URL('../..', import.meta.url));
const metadata = readPackage(root, 'use-press');
const check = selectChecks(metadata, 'PointerOwnership')[0];
const actions = ['Init', 'PointerDown', 'OtherPointerDown', 'OtherPointerCancel'];
const report = () => ({
  schemaVersion: 1,
  backend: 'tla-ts',
  version: '0.0.3',
  status: 'invariant-violation',
  statistics: {generatedStates: 19, distinctStates: 19, depth: 4},
  failure: null,
  violation: {
    name: 'PointerOwnership',
    loopStart: null,
    trace: actions.map((action, step) => ({
      action: 'Next',
      state: {action: JSON.stringify(action), step: String(step)}
    }))
  }
});

function directory(t) {
  let path = mkdtempSync(join(tmpdir(), 'verification-tla-ts-test-'));
  t.after(() => rmSync(path, {recursive: true, force: true}));
  return path;
}

test('model checks use tla-ts and the CLI rejects backend selection', async () => {
  let selected = selectChecks(metadata, 'PointerOwnership');
  assert.equal(selected[0].kind, 'tla-ts');
  assert.deepEqual(requirements(selected[0]), ['tla-ts']);
  assert.equal(selected[1].kind, 'vitest');
  assert.equal(selected[1].testNamePattern, 'pointer ownership:');
  assert.equal(selected[2].kind, 'jest');
  for (let command of ['run', 'doctor', 'validate', 'list', 'replay']) {
    for (let backend of ['tlc', 'tla-ts']) {
      let output;
      assert.equal(
        await main(
          [command, 'use-press', '--backend', backend, '--json'],
          root,
          value => (output = value),
          () => {}
        ),
        2
      );
      assert.match(JSON.parse(output).error, /Unknown option.*backend/);
    }
  }
});

test('doctor verifies every runtime chunk and reports a missing installation', async t => {
  let path = directory(t);
  mkdirSync(join(path, 'dist'));
  writeFileSync(join(path, 'package.json'), JSON.stringify({name: 'tla-ts', version: '0.0.3'}));
  writeFileSync(join(path, 'dist/index.js'), 'entry');
  writeFileSync(join(path, 'dist/chunk.js'), 'chunk');
  let tool = {...metadata.tools['tla-ts'], sha256: runtimeHash(path)};
  let tools = await inspectTools(root, {...metadata, tools: {'tla-ts': tool}}, [check], {
    TLA_TS_DIR: path
  });
  assert.deepEqual(Object.keys(tools), ['tla-ts']);
  assert.equal(tools['tla-ts'].available, true);
  assert.equal(inspectTlaTS(root, path, tool).version, '0.0.3');
  writeFileSync(join(path, 'dist/chunk.js'), 'changed chunk');
  assert.throws(() => inspectTlaTS(root, path, tool), /checksum mismatch/);
  rmSync(join(path, 'dist/chunk.js'));
  symlinkSync(join(path, 'dist/index.js'), join(path, 'dist/chunk.js'));
  assert.throws(() => runtimeHash(path), /symbolic links/);
  tools = await inspectTools(root, metadata, [check], {});
  assert.equal(tools['tla-ts'].available, false);
  assert.match(tools['tla-ts'].error, /TLA_TS_DIR/);
});

test('structured results distinguish violations from unsupported features, incomplete searches and malformed reports', t => {
  let path = join(directory(t), 'report.json');
  let classifyReport = (value, processResult = {code: 1}) => {
    writeFileSync(path, JSON.stringify(value));
    return classify(check, processResult, path);
  };
  assert.equal(classifyReport(report()).outcome, 'model-counterexample');
  let pass = {...report(), status: 'success', violation: null};
  assert.equal(classifyReport(pass, {code: 0}).outcome, 'bounded-model-pass');
  for (let value of [
    null,
    {},
    {...pass, status: 'error'},
    {...pass, status: 'deadlock'},
    {...pass, statistics: {}},
    {...pass, failure: {message: 'evaluation error'}},
    {...report(), violation: {...report().violation, name: 'Unknown'}}
  ]) {
    assert.equal(classifyReport(value, {code: 0}).outcome, 'infrastructure-error');
  }
  assert.equal(classifyReport(report(), {code: 0}).outcome, 'infrastructure-error');
  assert.equal(classifyReport(pass, {code: 1}).outcome, 'infrastructure-error');
  assert.equal(classifyReport(pass, {code: 0, timedOut: true}).outcome, 'inconclusive');
  assert.equal(classifyReport(pass, {code: 0, interrupted: true}).outcome, 'inconclusive');
  rmSync(path);
  assert.equal(classify(check, {code: 0}, path).outcome, 'infrastructure-error');
});

test('structured replay requires explicit sequential action labels and rejects loops or unsupported input', () => {
  assert.deepEqual(
    fromTlaTS(report(), 'PointerOwnership').actions.map(action => action.type),
    actions.slice(1)
  );
  for (let mutate of [
    value => (value.violation.trace[1].state.step = '3'),
    value => delete value.violation.trace[1].state.action,
    value => (value.violation.trace[0].state.action = '"OtherPointerDown"'),
    value => (value.violation.trace[2].state.action = '"Unknown"'),
    value => (value.violation.loopStart = 0),
    value => (value.violation.name = 'OtherProperty')
  ]) {
    let value = report();
    mutate(value);
    assert.throws(() => fromTlaTS(value, 'PointerOwnership'));
  }
});

test('runner exports structured counterexamples with checker provenance without parsing stdout', async t => {
  let path = directory(t);
  let result = await runPackage(
    root,
    metadata,
    {checks: [check], output: path},
    {
      doctor: async () => ({
        'tla-ts': {available: true, directory: path, ...metadata.tools['tla-ts']}
      }),
      execute: async (command, args) => {
        assert.equal(command, process.execPath);
        writeFileSync(args.at(-1), JSON.stringify(report()));
        return {code: 1, output: 'No textual trace'};
      }
    }
  );
  assert.equal(result.exitCode, 1);
  assert.equal(result.checks[0].kind, 'tla-ts');
  assert.equal(result.checks[0].replay.status, 'exported');
  let trace = JSON.parse(readFileSync(result.checks[0].replay.trace, 'utf8'));
  assert.equal(trace.origin.kind, 'tla-ts');
  assert.deepEqual(
    trace.actions.map(action => action.type),
    actions.slice(1)
  );
  assert.equal(result.provenance.valid, true);
});

test('worker rechecks runtime integrity and an unresponsive checker is terminated by the parent', async t => {
  let path = directory(t);
  mkdirSync(join(path, 'dist'));
  writeFileSync(
    join(path, 'package.json'),
    JSON.stringify({name: 'tla-ts', version: '0.0.3', type: 'module'})
  );
  writeFileSync(
    join(path, 'dist/index.js'),
    'export function check() { while (true) {} } export const formatValue = String;'
  );
  let tools = {'tla-ts': {directory: path, version: '0.0.3', sha256: runtimeHash(path)}};
  let command = commandFor(root, check, path, tools);
  let options = {cwd: root, timeoutMs: 300, log: join(path, 'worker.log')};
  let result = await runProcess(command.command, command.args, options);
  assert.equal(result.timedOut, true);
  assert.equal(classify(check, result, command.report).outcome, 'inconclusive');
  writeFileSync(join(path, 'dist/index.js'), 'throw new Error("should never import")');
  result = await runProcess(command.command, command.args, {
    ...options,
    timeoutMs: 5000,
    log: join(path, 'changed-runtime.log')
  });
  assert.equal(result.code, 2);
  assert.match(result.output, /checksum mismatch/);
  assert.doesNotMatch(result.output, /should never import/);
});
