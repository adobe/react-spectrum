/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {inspectTlaTS} from './tla-ts.mjs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFileSync, writeFileSync} from 'node:fs';

// Run the synchronous search in its own process: the parent enforces timeouts/signals.
let [root, directory, version, sha256, model, config, output] = process.argv.slice(2);
try {
  inspectTlaTS(root, directory, {version, sha256, acquisition: 'Re-extract the pinned package.'});
  let {check, formatValue} = await import(pathToFileURL(join(directory, 'dist/index.js')).href);
  let result = await check({
    source: readFileSync(model, 'utf8'),
    config: readFileSync(config, 'utf8'),
    workers: 1,
    seed: 1n,
    onPrint: text => console.log(text)
  });
  // Preserve every state using TLA+ value syntax; internal values and bigint fields
  // are not a portable JSON format. Package adapters interpret only their own labels.
  let violation = result.violation && {
    name: result.violation.name,
    loopStart: result.violation.loopStart ?? null,
    trace: result.violation.trace.map(step => ({
      action: step.action ?? null,
      label: step.label ?? null,
      state: Object.fromEntries(
        Object.entries(step.state).map(([key, value]) => [key, formatValue(value)])
      )
    }))
  };
  let report = {
    schemaVersion: 1,
    backend: 'tla-ts',
    version,
    status: result.status,
    statistics: {
      generatedStates: result.generatedStates,
      distinctStates: result.distinctStates,
      depth: result.depth
    },
    violation: violation || null,
    failure: result.failure ? {message: result.failure.message} : null
  };
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`${result.status}: ${result.distinctStates} distinct states, depth ${result.depth}`);
  process.exitCode =
    result.status === 'success' ? 0 : result.status === 'invariant-violation' ? 1 : 2;
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 2;
}
