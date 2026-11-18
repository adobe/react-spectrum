/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {conclusion, confirm, summarizeConfirmation} from '../confirm.mjs';
import fs from 'node:fs/promises';
import {harnessHash, hash, loadBuild, local} from '../build.mjs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';

const regression = 'regression detected';
const within = 'within practical threshold';

test('confirmation rejects replaced snapshots and changed fingerprints in either arm', async t => {
  let results = await fs.mkdtemp(path.join(os.tmpdir(), 'perf-confirm-'));
  let directories = [results];
  t.after(() => Promise.all(directories.map(dir => fs.rm(dir, {recursive: true, force: true}))));
  await fs.mkdir(path.join(local, 'builds'), {recursive: true});
  let builds = {};
  let currentHarness = await harnessHash();
  let bundleHash = content =>
    hash(Buffer.concat([Buffer.from('index.html'), Buffer.from(content)]));
  for (let arm of ['base', 'candidate']) {
    let dir = await fs.mkdtemp(path.join(local, 'builds', `test-confirm-${arm}-`));
    directories.push(dir);
    builds[arm] = {
      schema: 1,
      name: path.basename(dir),
      production: true,
      harnessHash: currentHarness,
      artifactHash: bundleHash('original bundle'),
      lockHash: 'original lock',
      versions: {react: '19.3.0', playwright: '1.57.0'}
    };
    await fs.writeFile(path.join(dir, 'index.html'), 'original bundle');
    await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(builds[arm]));
    assert.deepEqual(await loadBuild(builds[arm].name), builds[arm]);
  }
  let original = {
    status: 'complete',
    options: {base: builds.base.name, candidate: builds.candidate.name, seed: 2026},
    builds,
    scenarios: [{id: 'listbox.mount', fixture: 'listbox'}],
    comparisons: {'listbox.mount': {verdict: regression}}
  };
  for (let arm of ['base', 'candidate']) {
    for (let fingerprint of ['artifactHash', 'harnessHash', 'lockHash', 'versions']) {
      await t.test(`${arm}: ${fingerprint}`, async () => {
        let saved = structuredClone(original);
        let current = {...builds[arm]};
        let dir = path.join(local, 'builds', current.name);
        if (fingerprint === 'artifactHash') {
          // Replace the bundle and its manifest under the original snapshot name.
          await fs.writeFile(path.join(dir, 'index.html'), 'replacement bundle');
          current.artifactHash = bundleHash('replacement bundle');
          await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(current));
        } else {
          saved.builds[arm][fingerprint] =
            fingerprint === 'versions' ? {...current.versions, react: '19.2.0'} : 'previous hash';
        }
        try {
          // The replacement is valid on its own, but cannot confirm the saved comparison.
          assert.deepEqual(await loadBuild(current.name), current);
          await fs.writeFile(path.join(results, 'results.json'), JSON.stringify(saved));
          await assert.rejects(
            confirm({results, runs: 1}),
            new RegExp(`Snapshot ${current.name}.*original comparison`)
          );
        } finally {
          await fs.writeFile(path.join(dir, 'index.html'), 'original bundle');
          await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(builds[arm]));
        }
      });
    }
  }
});

test('a result is confirmed only when every repeat agrees', () => {
  assert.equal(conclusion(regression, [regression, regression]), 'confirmed');
  assert.equal(conclusion(regression, [regression, 'inconclusive']), 'unresolved');
  assert.equal(conclusion(regression, [regression, within]), 'not confirmed');
  assert.equal(conclusion(regression, ['improvement detected']), 'not confirmed');
  assert.equal(conclusion(within, [within]), 'confirmed');
  assert.equal(conclusion('inconclusive', [regression]), 'unresolved');
});

test('the summary sets each repeat beside the original result', () => {
  let comparison = (delta, verdict) => ({delta, interval: [delta - 1, delta + 1], verdict});
  let original = {
    options: {seed: 2026, blocks: 8, samples: 5, cpu: 1, scale: 1},
    builds: {base: {name: 'main'}, candidate: {name: 'pr'}},
    comparisons: {'listbox.mount': comparison(12, regression)}
  };
  let markdown = summarizeConfirmation(
    original,
    '/results/original',
    [
      {dir: '/results/one', seed: 2027, comparisons: {'listbox.mount': comparison(10, regression)}},
      {dir: '/results/two', seed: 2028, comparisons: {'listbox.mount': comparison(9.5, regression)}}
    ],
    ['listbox.mount']
  );
  assert.match(markdown, /2 confirmation runs, fixed before starting, with seeds 2027, 2028/);
  assert.match(
    markdown,
    /\| listbox\.mount \| \+12\.00 ms \[\+11\.00 ms, \+13\.00 ms\] regression detected \| \+10\.00 ms .* \| \*\*confirmed\*\* \|/
  );
});
