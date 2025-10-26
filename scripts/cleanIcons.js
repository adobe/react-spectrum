/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import path from 'path';
import recursive from 'recursive-readdir';
import {rimraf} from 'rimraf';

let topPaths = ['ui', 'workflow', 'color', 'express', 'illustrations'].map(name => path.resolve(path.join(__dirname, '..', 'packages', '@spectrum-icons', name)));
topPaths.forEach((rootPath) => {
  recursive(rootPath, (err, files) => {
    let filteredFiles = files.filter(filePath => /\/src\//.test(filePath));
    filteredFiles.forEach(filePath => {
      if (filePath.endsWith('.ts')) {
        return;
      }
      let toRemove = path.basename(filePath, '.tsx');
      rimraf(path.join(rootPath, `${toRemove}.js`), [], () => {});
      rimraf(path.join(rootPath, `${toRemove}.js.map`), [], () => {});
      rimraf(path.join(rootPath, `${toRemove}.module.mjs`), [], () => {});
      rimraf(path.join(rootPath, `${toRemove}.module.mjs.map`), [], () => {});
      rimraf(path.join(rootPath, `${toRemove}.d.ts`), [], () => {});
      rimraf(path.join(rootPath, `${toRemove}.d.ts.map`), [], () => {});
      if (!rootPath.endsWith('illustrations')) {
        rimraf(filePath, [], () => {});
      }
    });
    if (!rootPath.endsWith('illustrations')) {
      rimraf(path.join(rootPath, 'src'), [], () => {});
    }
    rimraf(path.join(rootPath, 'index.d.ts'), [], () => {});
    rimraf(path.join(rootPath, 'index.d.ts.map'), [], () => {});
  });
});
