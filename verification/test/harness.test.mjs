/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {classify, commandFor, inspectTools} from '../adapters.mjs';
import {coveredFiles, discoverPackages, readPackage, selectChecks} from '../metadata.mjs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {inspectPackage} from '../status.mjs';
import {join} from 'node:path';
import {main} from '../cli.mjs';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {runPackage} from '../runner.mjs';
import {runProcess} from '../process.mjs';
import {test} from 'node:test';
import {tmpdir} from 'node:os';

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));

function fixture(t) {
  let directory = mkdtempSync(join(tmpdir(), 'verification-test-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  let root = join(directory, 'repo');
  let output = join(directory, 'evidence');
  mkdirSync(join(root, 'verification', 'example'), {recursive: true});
  let metadata = {
    schemaVersion: 1,
    name: 'example',
    description: 'Example checks',
    properties: [{id: 'Safety', contract: 'An operation preserves the value.'}],
    sources: [
      {
        path: 'source.ts',
        functions: ['operation'],
        properties: ['Safety'],
        mapping: 'Step maps to operation.'
      }
    ],
    bounds: 'Two steps.',
    assumptions: ['Sequential execution.'],
    exclusions: ['Concurrency.'],
    verificationFiles: [
      'verification/example/Model.tla',
      'verification/example/Model.cfg',
      'test.ts',
      'vitest.config.ts',
      'jest.config.js'
    ],
    tools: {
      tlc: {
        version: '1.7.4',
        jarEnv: 'TLA2TOOLS_JAR',
        sha256: 'a'.repeat(64),
        minimumJavaVersion: 11,
        acquisition: 'See README.'
      }
    },
    mutationEnvironment: ['EXAMPLE_MUTATION'],
    checks: [
      {
        id: 'model',
        kind: 'tlc',
        properties: ['Safety'],
        model: 'verification/example/Model.tla',
        config: 'verification/example/Model.cfg',
        timeoutMs: 1000
      },
      {
        id: 'implementation',
        kind: 'vitest',
        properties: ['Safety'],
        testFile: 'test.ts',
        config: 'vitest.config.ts',
        browser: 'chromium',
        project: 'chromium-desktop',
        testNamePatterns: {Safety: 'safety:'},
        timeoutMs: 1000
      }
    ]
  };
  let save = () =>
    writeFileSync(join(root, 'verification/example/verification.json'), JSON.stringify(metadata));
  save();
  for (let path of [...metadata.verificationFiles, 'source.ts', 'yarn.lock'])
    writeFileSync(join(root, path), 'fixture\n');
  writeFileSync(join(root, 'package.json'), JSON.stringify({packageManager: 'yarn@4.18.0'}));
  let hash = path =>
    createHash('sha256')
      .update(readFileSync(join(root, path)))
      .digest('hex');
  let review = {
    schemaVersion: 1,
    reviewedAt: '2026-10-23',
    reviewedCommit: 'a'.repeat(40),
    note: 'Fixture correspondence.',
    ...Object.fromEntries(
      Object.entries(coveredFiles(metadata)).map(([group, paths]) => [
        group,
        Object.fromEntries(paths.map(path => [path, hash(path)]))
      ])
    )
  };
  let reviewPath = join(root, 'verification/example/review.json');
  writeFileSync(reviewPath, JSON.stringify(review));
  let report = join(directory, 'report.json');
  let writeReport = (assertions, extra = {}) =>
    writeFileSync(
      report,
      JSON.stringify({success: true, testResults: [{assertionResults: assertions}], ...extra})
    );
  return {root, directory, metadata, output, report, reviewPath, save, writeReport};
}

test('discovery uses package markers and ignores harness directories', t => {
  let {root, metadata} = fixture(t);
  mkdirSync(join(root, 'verification', 'adapters'));
  mkdirSync(join(root, 'verification', 'test'));
  assert.deepEqual(discoverPackages(root), ['example']);
  assert.deepEqual(readPackage(root, 'example'), metadata);
  assert.throws(() => readPackage(root, '../example'), /Invalid package/);
});

test('metadata rejects duplicate IDs, unknown properties, missing registrations, invalid filters, and unbounded budgets', t => {
  let {root, metadata, save} = fixture(t);
  let original = structuredClone(metadata);
  for (let change of [
    value => value.properties.push(value.properties[0]),
    value => value.checks[0].properties.push('Unknown'),
    value => (value.checks[0].config = '../outside.cfg'),
    value => (value.checks[0].timeoutMs = 0),
    value => (value.checks[1].testNamePatterns.Safety = '['),
    value => (value.tools.tlc.sha256 = 'wrong'),
    value => (value.mutationEnvironment = ['bad-name']),
    value => (value.sources[0].path = '/outside.ts')
  ]) {
    Object.assign(metadata, structuredClone(original));
    change(metadata);
    save();
    assert.throws(() => readPackage(root, 'example'));
  }
});

test('new coverage cannot silently match an older review record', t => {
  let {root, metadata, save} = fixture(t);
  metadata.verificationFiles.push('new-test.ts');
  writeFileSync(join(root, 'new-test.ts'), 'new coverage');
  save();
  let status = inspectPackage(root, 'example');
  assert.equal(status.status, 'needs-review');
  assert.ok(
    status.changes.some(change => change.path === 'new-test.ts' && change.status === 'unrecorded')
  );
});

test('usePress metadata selects existing checks and preserves the shared safety configuration', () => {
  let metadata = readPackage(repositoryRoot, 'use-press');
  let selected = selectChecks(metadata, 'CancellationSafe');
  assert.deepEqual(
    selected.map(check => check.id),
    ['safety', 'browser', 'regression']
  );
  assert.equal(selected[0].properties.length, 4);
  assert.equal(selected[1].testNamePattern, 'cancellation safety:');
  assert.throws(() => selectChecks(metadata, 'Unknown'), /Unknown property/);
  for (let path of Object.values(coveredFiles(metadata)).flat())
    assert.doesNotThrow(() => readFileSync(join(repositoryRoot, path)));
  let command = commandFor(repositoryRoot, selected[1], '/tmp/space in path', {});
  assert.ok(command.args.includes('/tmp/space in path/browser.json'));
  assert.ok(command.args.includes('cancellation safety:'));
});

test('TLC results distinguish bounded completion, counterexamples, timeout, and tool errors', () => {
  let check = {kind: 'tlc', properties: ['Safety', 'Ownership']};
  assert.equal(
    classify(check, {code: 0, output: 'Model checking completed. No error has been found.'})
      .outcome,
    'bounded-model-pass'
  );
  let failure = classify(check, {code: 12, output: 'Error: Invariant Safety is violated.'});
  assert.equal(failure.outcome, 'model-counterexample');
  assert.deepEqual(failure.uncheckedProperties, ['Ownership']);
  assert.equal(classify(check, {code: 1, output: 'Parse error'}).outcome, 'infrastructure-error');
  assert.equal(classify(check, {code: 0, output: ''}).outcome, 'infrastructure-error');
  assert.equal(
    classify(check, {
      code: 0,
      timedOut: true,
      output: 'Model checking completed. No error has been found.'
    }).outcome,
    'inconclusive'
  );
});

test('test reports do not confuse skipped tests, thrown errors, or missing reports with successful checks', t => {
  let {report, writeReport} = fixture(t);
  let check = {kind: 'vitest', testNamePattern: 'safety:'};
  writeReport([
    {fullName: 'safety: works', status: 'passed'},
    {fullName: 'other property', status: 'pending'}
  ]);
  assert.equal(classify(check, {code: 0}, report).outcome, 'implementation-checks-pass');
  writeReport([{fullName: 'safety: works', status: 'pending'}]);
  assert.equal(classify(check, {code: 0}, report).outcome, 'inconclusive');
  writeReport([]);
  assert.equal(classify(check, {code: 0}, report).outcome, 'inconclusive');
  writeReport(
    [
      {
        fullName: 'safety: works',
        status: 'failed',
        failureMessages: ['AssertionError: expected 1 to be 0']
      }
    ],
    {success: false}
  );
  assert.equal(classify(check, {code: 1}, report).outcome, 'implementation-failure');
  writeReport(
    [{fullName: 'safety: works', status: 'failed', failureMessages: ['Browser launch failed']}],
    {success: false}
  );
  assert.equal(classify(check, {code: 1}, report).outcome, 'infrastructure-error');
  rmSync(report);
  assert.equal(classify(check, {code: 0}, report).outcome, 'infrastructure-error');
});

test('process failures and timeouts produce evidence and cannot pass', async t => {
  let {directory} = fixture(t);
  let failed = await runProcess(
    process.execPath,
    ['-e', 'console.error("failure evidence"); process.exit(7)'],
    {timeoutMs: 5000, log: join(directory, 'failure.log')}
  );
  assert.equal(failed.code, 7);
  assert.match(readFileSync(join(directory, 'failure.log'), 'utf8'), /failure evidence/);
  let missing = await runProcess(join(directory, 'missing-program'), [], {
    timeoutMs: 5000,
    log: join(directory, 'missing.log')
  });
  assert.match(missing.error, /ENOENT/);
  let timedOut = await runProcess(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    timeoutMs: 100,
    log: join(directory, 'timeout.log')
  });
  assert.equal(timedOut.timedOut, true);
  let controller = new AbortController();
  controller.abort();
  let interrupted = await runProcess(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    timeoutMs: 5000,
    log: join(directory, 'interrupted.log'),
    signal: controller.signal
  });
  assert.equal(interrupted.interrupted, true);
});

test('missing property tests and mixed assertion/runtime failures are not successful verification', t => {
  let {report, writeReport} = fixture(t);
  let check = {kind: 'vitest', testNamePatterns: {Safety: 'safety:', Ownership: 'ownership:'}};
  writeReport([{fullName: 'safety: works', status: 'passed'}]);
  let result = classify(check, {code: 0}, report);
  assert.equal(result.outcome, 'inconclusive');
  assert.deepEqual(result.missingProperties, ['Ownership']);
  writeReport(
    [
      {
        fullName: 'safety: works',
        status: 'failed',
        failureMessages: ['AssertionError: expected 1 to be 0']
      }
    ],
    {success: false, numUnhandledErrors: 1}
  );
  result = classify(check, {code: 1}, report);
  assert.equal(result.outcome, 'infrastructure-error');
  assert.equal(result.failures.length, 1);
});

test('malformed metadata is an error even without a review record', t => {
  let {root, reviewPath} = fixture(t);
  rmSync(reviewPath);
  writeFileSync(join(root, 'verification/example/verification.json'), '{}');
  assert.equal(inspectPackage(root, 'example').status, 'error');
});

const availableTools = Object.fromEntries(
  ['java', 'tlc', 'yarn', 'react', 'react-dom', 'vitest', 'chromium'].map(name => [
    name,
    {available: true, path: '/tmp/tool.jar'}
  ])
);

test('runner continues after a counterexample and records stale correspondence without renewing it', async t => {
  let {root, metadata, output, reviewPath} = fixture(t);
  let review = readFileSync(reviewPath, 'utf8');
  writeFileSync(join(root, 'source.ts'), 'changed source');
  let calls = [];
  let result = await runPackage(
    root,
    metadata,
    {output},
    {
      doctor: async () => availableTools,
      execute: async (command, args) => {
        calls.push(command);
        if (command === 'java') return {code: 12, output: 'Invariant Safety is violated.'};
        writeFileSync(
          args[args.indexOf('--outputFile') + 1],
          JSON.stringify({
            success: true,
            testResults: [{assertionResults: [{fullName: 'safety: works', status: 'passed'}]}]
          })
        );
        return {code: 0};
      }
    }
  );
  assert.deepEqual(calls, ['java', 'yarn']);
  assert.equal(result.exitCode, 1);
  assert.equal(result.checks[1].outcome, 'implementation-checks-pass');
  assert.equal(result.correspondence.status, 'needs-review');
  assert.equal(readFileSync(reviewPath, 'utf8'), review);
  assert.equal(
    JSON.parse(readFileSync(join(result.directory, 'results.json'), 'utf8')).exitCode,
    1
  );
});

test('missing tools do not prevent independent checks; mid-run edits invalidate provenance', async t => {
  let {root, metadata, output} = fixture(t);
  let executed = [];
  let result = await runPackage(
    root,
    metadata,
    {output},
    {
      doctor: async () => ({
        java: {available: true},
        tlc: {available: true, path: '/tmp/tool.jar'}
      }),
      execute: async command => {
        executed.push(command);
        writeFileSync(join(root, 'source.ts'), 'edited during run');
        return {code: 0, output: 'Model checking completed. No error has been found.'};
      }
    }
  );
  assert.deepEqual(executed, ['java']);
  assert.equal(result.checks[1].execution, 'not-run');
  assert.equal(result.exitCode, 2);
  assert.equal(result.provenance.valid, false);
  assert.deepEqual(result.provenance.changedFiles, ['source.ts']);
});

test('normal runs reject active mutations and output inside the checkout', async t => {
  let {root, metadata} = fixture(t);
  await assert.rejects(
    runPackage(root, metadata, {env: {EXAMPLE_MUTATION: 'broken'}}),
    /Unset EXAMPLE_MUTATION/
  );
  await assert.rejects(runPackage(root, metadata, {output: root}), /outside the checkout/);
});

test('doctor refuses an unpinned JAR without downloading anything', async t => {
  let {root, metadata, directory} = fixture(t);
  let jar = join(directory, 'wrong.jar');
  writeFileSync(jar, 'wrong tool');
  let tools = await inspectTools(root, metadata, [metadata.checks[0]], {
    PATH: directory,
    TLA2TOOLS_JAR: jar
  });
  assert.equal(tools.java.available, false);
  assert.equal(tools.tlc.available, false);
  assert.match(tools.tlc.error, /checksum mismatch/);
});

test('CLI rejects unsupported commands, options, properties, and budgets before execution', async t => {
  let {root} = fixture(t);
  for (let args of [
    ['replay', 'example'],
    ['run'],
    ['list', '--property', 'Safety'],
    ['run', 'example', '--property', 'Unknown'],
    ['run', 'example', '--timeout-ms', '0'],
    ['run', 'example', '--timeout-ms', 'NaN'],
    ['run', 'example', '--unknown']
  ]) {
    let output;
    assert.equal(await main([...args, '--json'], root, value => (output = value)), 2);
    assert.ok(JSON.parse(output).error);
  }
  let output;
  assert.equal(await main(['list', '--json'], root, value => (output = value)), 0);
  assert.equal(JSON.parse(output).packages[0].name, 'example');
});
