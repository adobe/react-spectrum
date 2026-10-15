/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import parcel from '@parcel/core';
import path from 'node:path';

const require = createRequire(import.meta.url);
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const local = path.join(root, 'perf/.local');
export const hash = text => createHash('sha256').update(text).digest('hex');

export function buildPath(name) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
    throw new Error('Build names must contain only letters, numbers, hyphens, or underscores.');
  }
  return path.join(local, 'builds', name);
}

async function filesIn(dir) {
  let entries = await fs.readdir(dir, {withFileTypes: true});
  let files = await Promise.all(
    entries
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async entry => {
        let file = path.join(dir, entry.name);
        return entry.isDirectory() ? filesIn(file) : [file];
      })
  );
  return files.flat();
}

export async function harnessHash() {
  let files = [
    ...(await filesIn(path.join(root, 'perf/app'))),
    ...[
      '.parcelrc',
      'package.json',
      'scenarios.mjs',
      'drivers.mjs',
      'confirm.mjs',
      'runner.mjs',
      'report.mjs',
      'build.mjs',
      'cli.mjs'
    ].map(name => path.join(root, 'perf', name))
  ];
  return hash(
    Buffer.concat(
      await Promise.all(
        files.map(async file =>
          Buffer.concat([Buffer.from(path.relative(root, file)), await fs.readFile(file)])
        )
      )
    )
  );
}

async function artifactHash(dir) {
  let files = (await filesIn(dir)).filter(file => path.basename(file) !== 'manifest.json');
  return hash(
    Buffer.concat(
      await Promise.all(
        files.map(async file =>
          Buffer.concat([Buffer.from(path.relative(dir, file)), await fs.readFile(file)])
        )
      )
    )
  );
}

export async function build(name) {
  let dir = buildPath(name);
  await fs.mkdir(path.dirname(dir), {recursive: true});
  // Named snapshots are immutable, so a baseline cannot be overwritten by accident.
  await fs.mkdir(dir);
  try {
    console.log(`Building production snapshot ${name}…`);
    let bundler = new parcel.Parcel({
      entries: path.join(root, 'perf/app/index.html'),
      config: path.join(root, 'perf/.parcelrc'),
      mode: 'production',
      env: {NODE_ENV: 'production'},
      shouldAutoInstall: false,
      cacheDir: path.join(local, 'cache'),
      targets: {
        benchmark: {
          context: 'browser',
          distDir: dir,
          publicUrl: './',
          outputFormat: 'esmodule',
          includeNodeModules: true,
          optimize: true,
          scopeHoist: true,
          sourceMap: false,
          engines: {browsers: ['Chrome >= 120']}
        }
      }
    });
    let {bundleGraph} = await bundler.run();
    let assets = new Set();
    for (let bundle of bundleGraph.getBundles()) {
      bundle.traverseAssets(asset =>
        assets.add(path.relative(root, asset.filePath).replaceAll('\\', '/'))
      );
    }
    let reactAssets = [...assets].filter(file => /node_modules\/react(-dom)?\//.test(file));
    if (
      !reactAssets.some(file => file.endsWith('react-dom-client.production.js')) ||
      reactAssets.some(file => file.endsWith('.development.js'))
    ) {
      throw new Error(
        'The bundle must contain production React DOM and no development React modules.'
      );
    }
    for (let pkg of ['react-aria-components', 'react-aria', 'react-stately']) {
      if (![...assets].some(file => file.startsWith(`packages/${pkg}/src/`))) {
        throw new Error(`Expected ${pkg} to resolve to source in this checkout.`);
      }
    }
    let git = (...args) =>
      execFileSync('git', args, {cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024}).trim();
    let manifest = {
      schema: 1,
      name,
      created: new Date().toISOString(),
      source: {
        sha: git('rev-parse', 'HEAD'),
        branch: git('branch', '--show-current'),
        dirty: !!git('status', '--porcelain'),
        diffHash: hash(git('diff', 'HEAD', '--binary'))
      },
      harnessHash: await harnessHash(),
      lockHash: hash(await fs.readFile(path.join(root, 'yarn.lock'))),
      versions: Object.fromEntries(
        ['react', 'react-dom', 'playwright', '@parcel/core'].map(pkg => [
          pkg,
          require(`${pkg}/package.json`).version
        ])
      ),
      production: true,
      reactAssets,
      artifactHash: await artifactHash(dir)
    };
    await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(
      `Saved ${path.relative(root, dir)} (${manifest.source.sha.slice(0, 10)}${manifest.source.dirty ? ', working tree changes' : ''})`
    );
    return manifest;
  } catch (error) {
    await fs.rm(dir, {recursive: true, force: true});
    throw error;
  }
}

export async function loadBuild(name) {
  let dir = buildPath(name);
  let manifest = JSON.parse(await fs.readFile(path.join(dir, 'manifest.json'), 'utf8'));
  if (
    manifest.schema !== 1 ||
    !manifest.production ||
    manifest.harnessHash !== (await harnessHash())
  ) {
    throw new Error(
      `Snapshot ${name} uses a different harness or is not a verified production build. Rebuild both snapshots with the current harness.`
    );
  }
  if (manifest.artifactHash !== (await artifactHash(dir))) {
    throw new Error(`Snapshot ${name} has been modified since it was built.`);
  }
  return manifest;
}
