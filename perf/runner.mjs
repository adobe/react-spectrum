/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {binomialTail, metrics, random, report, shuffled} from './report.mjs';
import {buildPath, loadBuild, local} from './build.mjs';
import {chromium} from 'playwright';
import {driver, pause} from './drivers.mjs';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {scenarios, sizes} from './scenarios.mjs';
import {summarizeTrace} from './trace.mjs';

async function serve(builds) {
  let server = http.createServer(async (request, response) => {
    try {
      let [arm, ...parts] = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
        .split('/')
        .filter(Boolean);
      if (!builds[arm]) {
        response.writeHead(404).end();
        return;
      }
      let dir = buildPath(builds[arm].name);
      let file = path.resolve(dir, parts.join('/') || 'index.html');
      if (!file.startsWith(dir + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      let content = await fs.readFile(file);
      let type =
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json'
        }[path.extname(file)] ?? 'application/octet-stream';
      response.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-store'}).end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise(resolve => server.close(resolve))
  };
}

async function prepare(page, scenario, size) {
  let {fixture, action, name} = driver(scenario);
  let context = {page, size, action};
  await page.evaluate(() => window.__bench.reset());
  // Mount actions measure mounting itself; every other action starts mounted.
  if (name !== 'mount') {
    await page.locator('#mount').click();
    await page.waitForFunction(
      () => document.querySelector('#fixture')?.getAttribute('data-mounted') === 'true'
    );
    await fixture.prepare?.(context);
  }
  await action.prepare?.(context);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function perform({page, session, size}, scenario) {
  let {fixture, action} = driver(scenario);
  let spec = action.spec(size);
  // Resolve pointer coordinates before arming, so input timestamps are the
  // measurement boundary and locator polling/layout reads cannot enter the score.
  let box = ['pointerover', 'wheel'].includes(spec.event)
    ? await page.locator(spec.target).boundingBox()
    : undefined;
  if (box === null) {
    throw new Error(`The ${spec.event} target is not visible.`);
  }
  let center = box && {x: box.x + box.width / 2, y: box.y + box.height / 2};
  await page.evaluate(spec => window.__bench.arm(spec), spec);
  if (action.input) {
    await action.input(page);
  } else if (spec.event === 'wheel') {
    // Chromium generates the wheel stream at its own frame cadence, so Node timers and
    // protocol round trips don't shape the input. The call resolves when it finishes.
    await session.send('Input.synthesizeScrollGesture', {
      ...center,
      yDistance: -spec.distance,
      speed: spec.speed,
      gestureSourceType: 'mouse',
      preventFling: true
    });
  } else if (spec.event === 'keydown') {
    await page.keyboard.press(spec.key);
  } else if (spec.event === 'pointerover') {
    await page.mouse.move(center.x, center.y);
  } else {
    await page.locator(spec.target).click();
  }
  await page.waitForFunction(() => window.__bench.done(), null, {timeout: 15000});
  // Event Timing notifications may arrive after the semantic endpoint.
  await pause(100);
  let sample = await page.evaluate(() => window.__bench.read());
  if (
    sample.visibility !== 'visible' ||
    !(await page.evaluate(() => document.visibilityState === 'visible'))
  ) {
    throw new Error(
      'The benchmark page became hidden. Keep the browser visible during headed runs.'
    );
  }
  if (spec.event === 'wheel') {
    // Frame intervals must span the gesture, however many long frames it contained.
    let elapsed = sample.frameIntervals.reduce((total, interval) => total + interval, 0);
    if (sample.inputEvents < 10 || elapsed < 0.9 * (spec.distance / spec.speed) * 1000) {
      throw new Error('Scrolling did not receive a wheel stream or span the whole gesture.');
    }
  }
  let context = {page, size, action, sample};
  await fixture.verify?.(context);
  await action.verify?.(context);
  return sample;
}

async function launch(options) {
  return chromium.launch({
    channel: 'chromium',
    headless: !options.headed,
    // The runner saves partial results and closes the browser on interruption.
    handleSIGINT: false,
    handleSIGTERM: false
  });
}

async function openPage(browser, server, scenario, arm, options, expected, trace = false) {
  let context = await browser.newContext({
    viewport: {width: 1280, height: 900},
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'America/Chicago',
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  });
  let page = await context.newPage();
  page.setDefaultTimeout(15000);
  let errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  let session = await context.newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', {rate: options.cpu});
  let size = sizes[scenario.fixture] * options.scale;
  let params = new URLSearchParams({
    fixture: scenario.fixture,
    size: String(size),
    ...(trace && {trace: '1'}),
    delay: String(arm === 'candidate' ? options.delay : 0),
    delayMode: options.delayMode
  });
  await page.goto(`${server.url}/${arm}/index.html?${params}`);
  await page.waitForFunction(() => !!window.__bench);
  let info = await page.evaluate(() => window.__bench.info);
  if (!info.production || info.react !== expected.versions.react || info.size !== size) {
    throw new Error('Runtime production/version/fixture verification failed.');
  }
  return {page, context, session, size, errors};
}

async function saveTrace(session, file, operation) {
  await session.send('Tracing.start', {
    // toplevel adds task boundaries, so scheduling overhead shows as other work.
    categories:
      'toplevel,devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline.frame',
    transferMode: 'ReturnAsStream'
  });
  await operation();
  let completed = new Promise(resolve => session.once('Tracing.tracingComplete', resolve));
  await session.send('Tracing.end');
  let {stream} = await completed;
  let output = await fs.open(file, 'w');
  try {
    let eof = false;
    while (!eof) {
      let chunk = await session.send('IO.read', {handle: stream});
      await output.write(chunk.base64Encoded ? Buffer.from(chunk.data, 'base64') : chunk.data);
      eof = chunk.eof;
    }
  } finally {
    await output.close();
    await session.send('IO.close', {handle: stream});
  }
}

// Base and candidate pages stay open side by side, and their trials alternate in
// ABBA order so drift within a launch affects both arms alike. `onTrial` reports the
// page being measured, for failure screenshots.
async function measureTrials(pages, scenario, arms, block, options, samples, onTrial) {
  for (let trial = -options.warmup; trial < options.samples; trial++) {
    let order = (trial + options.warmup) % 2 ? [...arms].reverse() : arms;
    for (let [position, arm] of order.entries()) {
      let current = pages[arm];
      onTrial(current);
      // Keep the measured page frontmost so headed windows are never occluded.
      await current.page.bringToFront();
      await prepare(current.page, scenario, current.size);
      let sample = await perform(current, scenario);
      if (current.errors.length) {
        throw new Error(current.errors.join('\n'));
      }
      if (trial >= 0) {
        samples.push({
          scenario: scenario.id,
          arm,
          block,
          trial,
          position,
          ...sample,
          metrics: metrics(sample)
        });
      }
    }
  }
}

async function diagnose(browser, server, result, dir, isInterrupted) {
  for (let scenario of result.scenarios) {
    for (let arm of Object.keys(result.builds)) {
      if (isInterrupted()) {
        return;
      }
      let file = `${scenario.id}-${arm}.trace.json`;
      let current;
      try {
        current = await openPage(
          browser,
          server,
          scenario,
          arm,
          result.options,
          result.builds[arm],
          true
        );
        // Match the measured trials' warm state before the traced trial.
        for (let warmup = 0; warmup < result.options.warmup; warmup++) {
          await prepare(current.page, scenario, current.size);
          await perform(current, scenario);
        }
        await prepare(current.page, scenario, current.size);
        await saveTrace(current.session, path.join(dir, file), () => perform(current, scenario));
        if (current.errors.length) {
          throw new Error(current.errors.join('\n'));
        }
        let summary = summarizeTrace(JSON.parse(await fs.readFile(path.join(dir, file), 'utf8')));
        result.diagnostics.push({scenario: scenario.id, arm, file, summary});
      } catch (error) {
        result.diagnostics.push({scenario: scenario.id, arm, error: error.message});
      } finally {
        await current?.context.close();
      }
    }
  }
}

export async function run(options) {
  let selected = scenarios.filter(
    scenario =>
      !options.scenario ||
      options.scenario
        .split(',')
        .some(filter => scenario.id === filter || scenario.fixture === filter)
  );
  if (
    !selected.length ||
    options.scenario
      ?.split(',')
      .some(filter => !scenarios.some(s => s.id === filter || s.fixture === filter))
  ) {
    throw new Error('Unknown scenario filter. Use `yarn perf list`.');
  }
  let builds = {base: await loadBuild(options.base)};
  if (options.candidate) {
    builds.candidate = await loadBuild(options.candidate);
    if (
      builds.base.lockHash !== builds.candidate.lockHash ||
      JSON.stringify(builds.base.versions) !== JSON.stringify(builds.candidate.versions)
    ) {
      throw new Error(
        'Builds use different dependency locks or tool versions. Compare like-for-like builds.'
      );
    }
  }
  let id =
    new Date().toISOString().replaceAll(/[:.]/g, '-') +
    '-' +
    Math.random().toString(16).slice(2, 8);
  let dir = path.join(local, 'results', id);
  await fs.mkdir(dir, {recursive: true});
  let server = await serve(builds);
  let result = {
    schema: 2,
    started: new Date().toISOString(),
    status: 'running',
    options,
    builds,
    scenarios: selected,
    environment: {
      node: process.version,
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpu: os.cpus()[0]?.model,
      logicalCpus: os.cpus().length,
      memory: os.totalmem(),
      browser: '',
      viewport: {width: 1280, height: 900},
      mode: options.headed ? 'headed' : 'full Chromium headless'
    },
    samples: [],
    order: [],
    diagnostics: []
  };
  let persist = async () => {
    let markdown;
    try {
      markdown = report(result);
    } catch (error) {
      delete result.comparisons;
      result.status = 'failed';
      result.error = `Report generation failed: ${error.stack ?? error}`;
      markdown = report(result);
    }
    await fs.writeFile(path.join(dir, 'results.json'), JSON.stringify(result, null, 2) + '\n');
    await fs.writeFile(path.join(dir, 'report.md'), markdown);
    return markdown;
  };
  let browser;
  let current;
  let pages = {};
  let interrupted = false;
  let interrupt = () => {
    interrupted = true;
    browser?.close().catch(() => {});
  };
  let checkInterrupted = () => {
    if (interrupted) {
      throw new Error('Run interrupted; partial samples are retained.');
    }
  };
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', interrupt);
  try {
    let rng = random(options.seed);
    let begin = Date.now();
    for (let block = 0; block < options.blocks; block++) {
      checkInterrupted();
      browser = await launch(options);
      checkInterrupted();
      result.environment.browser = browser.version();
      // A seeded shuffle spreads every scenario across early and late positions in a
      // launch; which arm leads each scenario's ABBA trials alternates between launches.
      for (let [position, scenario] of shuffled(selected, rng).entries()) {
        let arms = Object.keys(builds);
        if ((block + selected.indexOf(scenario) + (options.seed % 2)) % 2) {
          arms.reverse();
        }
        result.order.push({
          block,
          scenario: scenario.id,
          arms,
          position,
          // Milliseconds since the first launch, for spotting drift over a run.
          started: Date.now() - begin
        });
        console.log(`Block ${block + 1}/${options.blocks} · ${scenario.id} · ${arms.join('/')}`);
        for (let arm of arms) {
          pages[arm] = await openPage(browser, server, scenario, arm, options, builds[arm]);
        }
        await measureTrials(pages, scenario, arms, block, options, result.samples, page => {
          current = page;
        });
        for (let page of Object.values(pages)) {
          await page.context.close();
        }
        pages = {};
        current = undefined;
      }
      await browser.close();
      browser = undefined;
      // A bounded, seeded gap is outside all measurement windows.
      await pause(100 + Math.floor(rng() * 100));
      await persist();
    }
    checkInterrupted();
    result.status = 'complete';
    if (options.trace) {
      // Traces are separate diagnostic reruns, so their failure or interruption is
      // reported without invalidating the completed measurements.
      try {
        browser = await launch(options);
        await diagnose(browser, server, result, dir, () => interrupted);
      } catch (error) {
        result.diagnosticsError = error.message;
      }
      if (interrupted) {
        result.diagnosticsError = 'Tracing was interrupted.';
      }
    }
  } catch (error) {
    result.status = 'failed';
    result.error = error.stack ?? String(error);
    if (current?.errors.length) {
      result.error += `\nBrowser errors:\n${current.errors.join('\n')}`;
    }
    if (current) {
      await current.page.screenshot({path: path.join(dir, 'failure.png')}).catch(() => {});
    }
  } finally {
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', interrupt);
    await browser?.close();
    await server.close();
    result.finished = new Date().toISOString();
    let markdown = await persist();
    console.log(`\n${markdown}\nSaved ${dir}`);
  }
  if (result.status !== 'complete') {
    throw new Error(`Benchmark failed; partial results saved in ${dir}\n${result.error}`);
  }
  return {result, dir};
}

// Repeated A/A comparisons check the intervals empirically on this machine: with no
// real difference, an interval should exclude zero at most at its nominal error rate.
export async function validate(options) {
  if (options.blocks < 6) {
    throw new Error('validate needs at least 6 blocks, the fewest that can form a 95% interval.');
  }
  let runs = [];
  for (let i = 0; i < options.runs; i++) {
    console.log(`\nA/A validation run ${i + 1}/${options.runs}`);
    // A different seed per run varies the arm order and the gaps between launches.
    let {result, dir} = await run({...options, candidate: options.base, seed: options.seed + i});
    runs.push({dir, comparisons: result.comparisons});
  }
  let intervals = runs.flatMap(run =>
    Object.entries(run.comparisons).map(([scenario, comparison]) => ({scenario, ...comparison}))
  );
  let excluded = intervals.filter(({interval}) => interval[0] > 0 || interval[1] < 0);
  let expected =
    intervals.reduce((total, {confidence}) => total + (1 - confidence), 0) / intervals.length;
  let tail = binomialTail(excluded.length, intervals.length, expected);
  let percent = value => `${(value * 100).toFixed(1)}%`;
  let lines = [
    '# A/A interval validation',
    '',
    `${options.runs} A/A runs of ${options.base} · ${options.blocks} blocks × ${options.samples} trials · ${options.cpu}× CPU · ${options.scale}× workload`,
    '',
    `Intervals excluding zero: ${excluded.length} of ${intervals.length} (${percent(excluded.length / intervals.length)}); expected at most ${percent(expected)}.`,
    '',
    `Probability of at least this many by chance: ${tail.toFixed(3)}. ${tail < 0.05 ? '**The intervals look too narrow on this machine; treat verdicts with caution and investigate order or position effects.**' : 'Consistent with the nominal error rate.'}`,
    '',
    'Scenarios in the same run share browser launches, so they are not fully independent and the probability is approximate.',
    '',
    '| Scenario | Excluded zero | Within threshold | Inconclusive | Improvement | Regression |',
    '|---|---:|---:|---:|---:|---:|'
  ];
  for (let scenario of [...new Set(intervals.map(({scenario}) => scenario))]) {
    let rows = intervals.filter(row => row.scenario === scenario);
    let count = verdict => rows.filter(row => row.verdict === verdict).length;
    lines.push(
      `| ${scenario} | ${excluded.filter(row => row.scenario === scenario).length}/${rows.length} | ${count('within practical threshold')} | ${count('inconclusive')} | ${count('improvement detected')} | ${count('regression detected')} |`
    );
  }
  lines.push('', 'Runs:', '', ...runs.map(run => `- ${run.dir}`), '');
  let dir = path.join(
    local,
    'results',
    `validation-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`
  );
  await fs.mkdir(dir, {recursive: true});
  let markdown = lines.join('\n');
  await fs.writeFile(path.join(dir, 'summary.md'), markdown);
  console.log(`\n${markdown}\nSaved ${dir}`);
  return {intervals, excluded: excluded.length, expected, tail, dir};
}
