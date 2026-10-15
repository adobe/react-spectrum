/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {buildPath, loadBuild, local} from './build.mjs';
import {chromium} from 'playwright';
import {driver, pause} from './drivers.mjs';
import fs from 'node:fs/promises';
import http from 'node:http';
import {metrics, random, report} from './report.mjs';
import os from 'node:os';
import path from 'node:path';
import {scenarios, sizes} from './scenarios.mjs';

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
    await prepare(current.page, scenario, current.size);
    let sample = await perform(current, scenario);
    if (current.errors.length) {
      throw new Error(current.errors.join('\n'));
    }
    if (trial >= 0) {
      samples.push({scenario: scenario.id, arm, block, trial, ...sample, metrics: metrics(sample)});
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
          result.builds[arm]
        );
        await prepare(current.page, scenario, current.size);
        await saveTrace(current.session, path.join(dir, file), () => perform(current, scenario));
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
