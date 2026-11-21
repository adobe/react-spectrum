/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';

describe('prose macro package', () => {
  let outputDir = mkdtempSync(join(tmpdir(), 'prose-macro-'));

  afterAll(() => {
    rmSync(outputDir, {recursive: true, force: true});
  });

  it.each([
    ['commonjs', 'prose.cjs'],
    ['esmodule', 'prose.mjs']
  ] as const)(
    'emits usable %s macro code',
    (outputFormat, distEntry) => {
      // Isolate Parcel's module cache from other suites' Jest environments.
      let result = execFileSync(
        process.execPath,
        [
          '-e',
          `
          const {default: Parcel, createWorkerFarm} = require('@parcel/core');
          const {join} = require('node:path');
          const {pathToFileURL} = require('node:url');
          (async () => {
            let workerFarm = createWorkerFarm();
            try {
              let parcel = new Parcel({
                entries: [process.argv[1]],
                defaultConfig: require.resolve('@parcel/config-default'),
                defaultTargetOptions: {shouldOptimize: false},
                mode: 'production',
                shouldDisableCache: true,
                workerFarm,
                targets: {
                  prose: {
                    context: 'node',
                    distDir: process.argv[2],
                    outputFormat: process.argv[3],
                    distEntry: process.argv[4],
                    isLibrary: true
                  }
                }
              });
              await parcel.run();
              let module = await import(pathToFileURL(join(process.argv[2], process.argv[4])));
              let prose = module.prose ?? module.default?.prose;
              let asset;
              let className = prose.call({addAsset(value) { asset = value; }});
              console.log(JSON.stringify({className, asset}));
            } finally {
              await workerFarm.end();
            }
          })().catch(error => {console.error(error); process.exitCode = 1;});
        `,
          join(__dirname, '../src/style/prose.ts'),
          outputDir,
          outputFormat,
          distEntry
        ],
        {encoding: 'utf8', timeout: 120000}
      );
      let {className, asset} = JSON.parse(result);
      expect(asset.type).toBe('css');
      expect(asset.content).toContain(`.${className}`);
      expect(asset.content).not.toContain('undefined');
      expect(asset.content).not.toContain('[object Object]');
    },
    120000
  );
});
