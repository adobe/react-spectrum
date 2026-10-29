/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {classifyTlaTS, inspectTlaTS} from './tla-ts.mjs';
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join, resolve} from 'node:path';
import {promisify} from 'node:util';

const exec = promisify(execFile);

export async function inspectTools(root, metadata, checks, env = process.env) {
  env = {...env, COREPACK_ENABLE_NETWORK: '0'};
  let results = {};
  let probe = async (name, action) => {
    try {
      results[name] = {available: true, ...(await action())};
    } catch (error) {
      results[name] = {available: false, error: error.message};
    }
  };
  if (checks.some(check => check.kind === 'tla-ts')) {
    await probe('tla-ts', async () => {
      let tool = metadata.tools['tla-ts'];
      return inspectTlaTS(
        root,
        env[tool.directoryEnv] && resolve(root, env[tool.directoryEnv]),
        tool
      );
    });
  }
  if (checks.some(check => check.kind !== 'tla-ts')) {
    await probe('yarn', async () => {
      let {stdout} = await exec('yarn', ['--version'], {cwd: root, env, timeout: 15000});
      let expected = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).packageManager;
      if (expected !== `yarn@${stdout.trim()}`)
        throw new Error(`Expected ${expected}, found yarn@${stdout.trim()}.`);
      return {version: stdout.trim()};
    });
    let require = createRequire(join(root, 'package.json'));
    for (let name of new Set([
      'react',
      'react-dom',
      ...checks.filter(check => check.kind !== 'tla-ts').map(check => check.kind)
    ])) {
      await probe(name, async () => ({version: require(`${name}/package.json`).version}));
    }
    if (checks.some(check => check.kind === 'vitest')) {
      await probe('chromium', async () => {
        let {chromium} = require('playwright');
        // Headless Vitest uses Playwright's headless shell by default.
        let browser = await chromium.launch({headless: true, timeout: 15000});
        try {
          return {
            version: browser.version(),
            playwright: require('playwright/package.json').version
          };
        } finally {
          await browser.close();
        }
      });
    }
  }
  return results;
}

export function requirements(check) {
  return check.kind === 'tla-ts'
    ? ['tla-ts']
    : ['yarn', 'react', 'react-dom', check.kind, ...(check.kind === 'vitest' ? ['chromium'] : [])];
}

export function commandFor(root, check, directory, tools) {
  let report = join(directory, `${check.id}.json`);
  if (check.kind === 'tla-ts') {
    let tool = tools['tla-ts'];
    return {
      command: process.execPath,
      args: [
        '--max-old-space-size=512',
        fileURLToPath(new URL('./tla-ts-worker.mjs', import.meta.url)),
        root,
        tool.directory,
        tool.version,
        tool.sha256,
        resolve(root, check.model),
        resolve(root, check.config),
        report
      ],
      cwd: root,
      report
    };
  }
  let args =
    check.kind === 'vitest'
      ? [
          'vitest',
          'run',
          check.testFile,
          '--config',
          check.config,
          '--project',
          check.project,
          '--reporter=default',
          '--reporter=json',
          '--outputFile',
          report
        ]
      : [
          'jest',
          '--config',
          check.config,
          '--runTestsByPath',
          check.testFile,
          '--runInBand',
          '--json',
          '--outputFile',
          report
        ];
  if (check.testNamePattern) args.push('--testNamePattern', check.testNamePattern);
  return {command: 'yarn', args, cwd: root, report};
}

export function classify(check, processResult, reportPath) {
  if (processResult.interrupted) return {execution: 'interrupted', outcome: 'inconclusive'};
  if (processResult.timedOut) return {execution: 'timed-out', outcome: 'inconclusive'};
  if (processResult.error || processResult.signal)
    return {
      execution: 'error',
      outcome: 'infrastructure-error',
      detail: processResult.error || processResult.signal
    };
  if (check.kind === 'tla-ts') {
    try {
      return classifyTlaTS(check, processResult, JSON.parse(readFileSync(reportPath, 'utf8')));
    } catch (error) {
      return {execution: 'error', outcome: 'infrastructure-error', detail: error.message};
    }
  }
  try {
    if (!existsSync(reportPath)) throw new Error('Runner did not produce a JSON report.');
    let report = JSON.parse(readFileSync(reportPath, 'utf8'));
    if (!Array.isArray(report.testResults)) throw new Error('Invalid test report.');
    let pattern = check.testNamePattern && new RegExp(check.testNamePattern);
    let assertions = report.testResults
      .flatMap(suite => suite.assertionResults || [])
      .filter(item => !pattern || pattern.test(item.fullName));
    let counts = {passed: 0, failed: 0, skipped: 0};
    for (let assertion of assertions) {
      counts[
        assertion.status === 'passed'
          ? 'passed'
          : assertion.status === 'failed'
            ? 'failed'
            : 'skipped'
      ]++;
    }
    let failures = assertions
      .filter(item => item.status === 'failed')
      .map(item => ({name: item.fullName, messages: item.failureMessages}));
    let testNames = assertions.map(item => item.fullName).sort();
    // A runner error or thrown exception is not evidence of an invariant violation.
    let assertionFailures =
      failures.length > 0 &&
      failures.every(
        item =>
          item.messages?.length > 0 &&
          item.messages.every(message => /AssertionError|expect\(/.test(message))
      );
    let runtimeErrors =
      report.numRuntimeErrorTestSuites > 0 ||
      report.numUnhandledErrors > 0 ||
      (check.kind === 'vitest' &&
        /Unhandled (?:Errors|Error|Rejection|Exception)/.test(processResult.output || '')) ||
      report.testResults.some(
        suite =>
          (check.kind === 'vitest' && Boolean(suite.message)) ||
          (suite.status === 'failed' &&
            !(suite.assertionResults || []).some(item => item.status === 'failed'))
      );
    if (assertionFailures && processResult.code !== 0 && !runtimeErrors)
      return {
        execution: 'completed',
        outcome: 'implementation-failure',
        counts,
        failures,
        testNames
      };
    if (failures.length || runtimeErrors || report.success !== true || processResult.code !== 0) {
      return {
        execution: 'error',
        outcome: 'infrastructure-error',
        counts,
        failures,
        testNames,
        detail: 'Runner errors or non-assertion failures. Inspect the JSON report and log.'
      };
    }
    let missingProperties = Object.entries(check.testNamePatterns || {})
      .filter(
        ([id, pattern]) =>
          (!check.requestedProperties || check.requestedProperties.includes(id)) &&
          !assertions.some(item => new RegExp(pattern).test(item.fullName))
      )
      .map(([id]) => id);
    if (!assertions.length || counts.skipped || missingProperties.length)
      return {
        execution: 'incomplete',
        outcome: 'inconclusive',
        counts,
        testNames,
        missingProperties,
        detail: 'Selected tests were missing or skipped.'
      };
    return {execution: 'completed', outcome: 'implementation-checks-pass', counts, testNames};
  } catch (error) {
    return {execution: 'error', outcome: 'infrastructure-error', detail: error.message};
  }
}
