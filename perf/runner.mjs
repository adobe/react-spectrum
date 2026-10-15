/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {buildPath, loadBuild, local} from './build.mjs';
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import {metrics, random, report} from './report.mjs';
import os from 'node:os';
import path from 'node:path';
import {scenarios, sizes} from './scenarios.mjs';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

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

function condition(selector, rest = {}) {
  return {selector, ...rest};
}

async function prepare(page, scenario) {
  await page.evaluate(() => window.__bench.reset());
  if (!scenario.id.endsWith('.mount')) {
    await page.locator('#mount').click();
    await page.waitForFunction(
      () => document.querySelector('#fixture')?.getAttribute('data-mounted') === 'true'
    );
  }
  if (scenario.id === 'listbox.focus') {
    await page.locator('[data-record="item-0"]').focus();
  } else if (scenario.id === 'combobox.filter') {
    await page.locator('#combo-open').click();
    await page.getByRole('option').last().waitFor();
    await page.locator('#combo-input').focus();
  } else if (scenario.id === 'form.type') {
    await page.locator('#project-name').focus();
  } else if (scenario.id === 'table.scroll') {
    await page.locator('[data-record="item-0"]').waitFor();
    await page.locator('[data-bench="records-table"]').hover();
  }
  if (scenario.fixture === 'resize' && !scenario.id.endsWith('.mount')) {
    await page.waitForFunction(() => {
      let columns = [...document.querySelectorAll('.resizable-table th')];
      return columns.length === 6 && columns.every(column => column.style.width === '160px');
    });
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

function actionSpec(scenario, size) {
  let options = {event: 'pointerdown', target: '#mount', conditions: []};
  switch (scenario.id) {
    case 'listbox.mount':
      options.conditions = [condition('.list [role="option"]', {count: size})];
      break;
    case 'table.mount':
      options.conditions = [
        condition('[data-record="item-2"] [role="rowheader"]', {text: 'Record 2'})
      ];
      break;
    case 'form.mount':
      options.conditions = [condition('.form-grid > *', {count: size})];
      break;
    case 'listbox.focus':
      options = {
        event: 'keydown',
        key: 'ArrowDown',
        target: '.list',
        conditions: [condition('[data-record="item-1"]', {focused: true})]
      };
      break;
    case 'resize.mount':
      options.conditions = [
        condition('.resizable-table [data-record]', {count: size}),
        condition('.resizable-table th', {count: 6, style: {property: 'width', value: '160px'}})
      ];
      break;
    case 'resize.container':
      options.target = '#resize-container';
      options.conditions = [
        condition('.resizable-table [data-record]', {count: size}),
        condition('.resizable-table th', {count: 6, style: {property: 'width', value: '110px'}})
      ];
      break;
    case 'listbox.select':
      options.target = '[data-record="item-2"]';
      options.conditions = [condition(options.target, {attribute: 'aria-selected', value: 'true'})];
      break;
    case 'listbox.parent':
      options.target = '#parent-update';
      options.conditions = [condition('#revision', {text: '1'})];
      break;
    case 'combobox.open':
      options.target = '#combo-open';
      options.conditions = [condition('[role="option"]', {count: size})];
      break;
    case 'combobox.filter':
      options = {
        event: 'keydown',
        key: '9',
        target: '#combo-input',
        conditions: [
          condition('#query', {text: '99'}),
          condition('[role="option"]', {
            count: Array.from({length: size}, (_, i) => i).filter(i => String(i).includes('99'))
              .length
          })
        ]
      };
      break;
    case 'table.update':
      options.target = '#edit-record';
      options.conditions = [
        condition('[data-record="item-2"] [role="rowheader"]', {text: 'Updated record'})
      ];
      break;
    case 'table.scroll':
      options = {
        event: 'wheel',
        target: '[data-bench="records-table"]',
        frames: true,
        conditions: [
          condition('[data-bench="records-table"]', {scrollTop: 1900}),
          condition('[data-record="item-50"]')
        ]
      };
      break;
    case 'form.type':
      options = {
        event: 'keydown',
        key: 'a',
        target: '#project-name',
        conditions: [condition('#project-value', {text: 'a'})]
      };
      break;
    case 'form.dialog':
      options.target = '#dialog-open';
      options.conditions = [
        condition('#review-note', {focused: true}),
        condition('[role="dialog"]')
      ];
      break;
    default:
      throw new Error(`Unknown scenario: ${scenario.id}`);
  }
  return options;
}

async function action(page, scenario, size) {
  let spec = actionSpec(scenario, size);
  await page.evaluate(spec => window.__bench.arm(spec), spec);
  if (scenario.id === 'table.scroll') {
    // Fixed wheel distances and cadence; scroll completion itself is not the score.
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 160);
      await pause(32);
    }
  } else if (scenario.id === 'combobox.filter') {
    await page.keyboard.press('9');
    await pause(75);
    await page.keyboard.press('9');
  } else if (spec.event === 'keydown') {
    await page.keyboard.press(spec.key);
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
  if (scenario.fixture === 'table') {
    let rows = await page.locator('[data-record]').count();
    if (!rows || rows >= size) {
      throw new Error('Expected a populated, virtualized viewport, not all records in the DOM.');
    }
  }
  if (scenario.id === 'table.scroll') {
    let visible = await page.evaluate(() => {
      let viewport = document.querySelector('[data-bench="records-table"]').getBoundingClientRect();
      let row = document.querySelector('[data-record="item-50"]').getBoundingClientRect();
      return row.bottom > viewport.top && row.top < viewport.bottom;
    });
    if (!visible || sample.frameIntervals.length < 10) {
      throw new Error('Scroll did not expose the expected row or collect enough frame intervals.');
    }
  }
  if (scenario.fixture === 'resize') {
    let expectedWidth = scenario.id.endsWith('.mount') ? 160 : 110;
    let widths = await page.locator('.resizable-table th').evaluateAll(columns =>
      columns.map(column => ({
        style: parseFloat(column.style.width),
        actual: column.getBoundingClientRect().width
      }))
    );
    if (
      widths.length !== 6 ||
      widths.some(
        width => width.style !== expectedWidth || Math.abs(width.actual - expectedWidth) > 1
      )
    ) {
      throw new Error('The table columns did not finish resizing to the expected width.');
    }
    await page.getByRole('rowheader', {name: `Record ${size - 1}`, exact: true}).waitFor();
  }
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

async function openPage(browser, server, scenario, arm, options, expected) {
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
    categories: 'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline.frame',
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

async function measureTrials(current, scenario, arm, block, options, samples) {
  for (let trial = -options.warmup; trial < options.samples; trial++) {
    await prepare(current.page, scenario);
    let sample = await action(current.page, scenario, current.size);
    if (current.errors.length) {
      throw new Error(current.errors.join('\n'));
    }
    if (trial >= 0) {
      samples.push({scenario: scenario.id, arm, block, trial, ...sample, metrics: metrics(sample)});
    }
  }
}

async function diagnose(browser, server, result, dir) {
  for (let scenario of result.scenarios) {
    for (let arm of Object.keys(result.builds)) {
      let file = `${scenario.id}-${arm}.trace.json`;
      let current;
      try {
        current = await openPage(
          browser,
          server,
          scenario,
          arm,
          result.options,
          result.builds[arm]
        );
        await prepare(current.page, scenario);
        await saveTrace(current.session, path.join(dir, file), () =>
          action(current.page, scenario, current.size)
        );
        if (current.errors.length) {
          throw new Error(current.errors.join('\n'));
        }
        result.diagnostics.push({scenario: scenario.id, arm, file});
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
    schema: 1,
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
    let markdown = report(result);
    await fs.writeFile(path.join(dir, 'results.json'), JSON.stringify(result, null, 2) + '\n');
    await fs.writeFile(path.join(dir, 'report.md'), markdown);
    return markdown;
  };
  let browser;
  let current;
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
    for (let block = 0; block < options.blocks; block++) {
      checkInterrupted();
      browser = await launch(options);
      checkInterrupted();
      result.environment.browser = browser.version();
      // Rotate scenario order and balance AB/BA order across browser launches.
      let ordered = [
        ...selected.slice(block % selected.length),
        ...selected.slice(0, block % selected.length)
      ];
      for (let scenario of ordered) {
        let arms = Object.keys(builds);
        if ((block + selected.indexOf(scenario) + (options.seed % 2)) % 2) {
          arms.reverse();
        }
        result.order.push({block, scenario: scenario.id, arms});
        for (let arm of arms) {
          console.log(`Block ${block + 1}/${options.blocks} · ${scenario.id} · ${arm}`);
          current = await openPage(browser, server, scenario, arm, options, builds[arm]);
          await measureTrials(current, scenario, arm, block, options, result.samples);
          await current.context.close();
          current = undefined;
        }
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
      browser = await launch(options);
      await diagnose(browser, server, result, dir);
    }
    checkInterrupted();
  } catch (error) {
    result.status = 'failed';
    result.error = error.stack ?? String(error);
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
