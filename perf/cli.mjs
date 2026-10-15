/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {build} from './build.mjs';
import {parseArgs} from 'node:util';
import {run} from './runner.mjs';
import {scenarios} from './scenarios.mjs';

const help = `React Aria local production benchmarks

  yarn perf build --name baseline
  yarn perf build --name candidate
  yarn perf compare --base baseline --candidate candidate
  yarn perf run --build candidate
  yarn perf calibrate --build candidate
  yarn perf list

Options:
  --scenario listbox.focus,table   Run named actions or entire fixtures
  --blocks 8                      Independent browser launches (paired in compare)
  --samples 5                     Measured trials per arm/scenario/block
  --warmup 2                      Discarded trials per arm/scenario/block
  --scale 1                       Integer workload multiplier (1–10)
  --cpu 1                         CPU slowdown factor (1–20); not a device model
  --seed 2026                     Reproducible base/candidate order and gap seed
  --absolute-threshold 8          Exploratory completion threshold in milliseconds
  --relative-threshold 0.05       Exploratory fractional threshold
  --frame-threshold 2             Exploratory rAF interval threshold in milliseconds
  --headed                        Show Chromium (keep it foreground)
  --trace                         Save separate diagnostic Chrome trace reruns

Builds and results are saved only under ignored perf/.local/. Build names cannot
be overwritten. The runner never checks out branches, commits, pushes, or runs CI.
See perf/README.md for measurement boundaries and comparison limitations.`;

try {
  let {values, positionals} = parseArgs({
    allowPositionals: true,
    options: {
      help: {type: 'boolean'},
      name: {type: 'string'},
      base: {type: 'string'},
      candidate: {type: 'string'},
      build: {type: 'string'},
      scenario: {type: 'string'},
      blocks: {type: 'string', default: '8'},
      samples: {type: 'string', default: '5'},
      warmup: {type: 'string', default: '2'},
      scale: {type: 'string', default: '1'},
      cpu: {type: 'string', default: '1'},
      seed: {type: 'string', default: '2026'},
      'absolute-threshold': {type: 'string', default: '8'},
      'relative-threshold': {type: 'string', default: '0.05'},
      'frame-threshold': {type: 'string', default: '2'},
      headed: {type: 'boolean', default: false},
      trace: {type: 'boolean', default: false}
    }
  });
  let command = positionals[0];
  if (positionals.length > 1) {
    throw new Error('Expected one command. Use --help for examples.');
  }
  let number = (name, min, max, integer = true) => {
    let value = Number(values[name]);
    if (
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value))
    ) {
      throw new Error(
        `--${name} must be ${integer ? 'an integer' : 'a number'} between ${min} and ${max}.`
      );
    }
    return value;
  };
  if (!command || values.help) {
    console.log(help);
  } else if (command === 'list') {
    for (let scenario of scenarios) {
      console.log(`${scenario.id.padEnd(20)} ${scenario.label}`);
    }
  } else if (command === 'build') {
    if (!values.name) {
      throw new Error('build requires --name.');
    }
    await build(values.name);
  } else if (['run', 'compare', 'calibrate'].includes(command)) {
    let options = {
      base: command === 'compare' ? values.base : values.build,
      candidate: command === 'compare' ? values.candidate : undefined,
      scenario: values.scenario,
      blocks: number('blocks', 1, 100),
      samples: number('samples', 1, 100),
      warmup: number('warmup', 0, 50),
      scale: number('scale', 1, 10),
      cpu: number('cpu', 1, 20, false),
      seed: number('seed', 0, 2147483647),
      absoluteThreshold: number('absolute-threshold', 0, 1000, false),
      relativeThreshold: number('relative-threshold', 0, 1, false),
      frameThreshold: number('frame-threshold', 0, 1000, false),
      headed: values.headed,
      trace: values.trace,
      delay: 0,
      delayMode: 'sync'
    };
    if (!options.base || (command === 'compare' && !options.candidate)) {
      throw new Error(
        command === 'compare'
          ? 'compare requires --base and --candidate.'
          : `${command} requires --build.`
      );
    }
    if (command === 'calibrate') {
      console.log(
        'Calibration: A/A, then 40 ms synchronous, deferred, and forced-layout mount delays.'
      );
      for (let mode of ['aa', 'sync', 'deferred', 'layout']) {
        console.log(`\nCalibration ${mode}`);
        await run({
          ...options,
          candidate: options.base,
          scenario: 'listbox.mount',
          delay: mode === 'aa' ? 0 : 40,
          delayMode: mode === 'aa' ? 'sync' : mode
        });
      }
    } else {
      await run(options);
    }
  } else {
    throw new Error(`Unknown command ${command}. Use --help.`);
  }
} catch (error) {
  console.error(error.diagnostics ?? error.stack ?? error);
  process.exitCode = 1;
}
