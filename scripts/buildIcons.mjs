/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import concurrently from 'concurrently';
import glob from 'fast-glob';
import path, {dirname} from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PACKAGES = {
  workflow: path.join(__dirname, '..', 's2wf-icons', 'assets', 'svg')
};

(async function () {
  let commandPromises = [];
  // run in packages where at least one dist js file is newer that the corresponding source js file
  for (let [pkg, srcFolder] of Object.entries(PACKAGES)) {
    let distFolder = getIconPackageFolder();
    for (let srcFile of await glob([
      path.join(srcFolder, '*.{js,tsx,svg}').replace(/\\/g, '/')
    ])) {
      let filename = path.basename(srcFile);
      if (filename === 'index.js' || filename === 'util.js') {
        continue;
      }

      let distFile =
        path.join(distFolder, path.basename(srcFile, path.extname(srcFile))) +
        '.js';
      if (!(await exists(distFile)) || (await isNewerThan(srcFile, distFile))) {
        commandPromises.push({command: 'yarn build-icons', name: `Building icons for s2/${pkg}`});
        break;
      }
    }
  }
  return Promise.all(commandPromises);
})().then(commands => {
  if (commands.length > 0) {
    concurrently(commands);
  }
}).catch((err) => {
  console.error(err.stack);
  process.exit(1);
});

function getIconPackageFolder() {
  return path.resolve(
    path.join(__dirname, '..', 'src', 'wf-icons')
  );
}

async function isNewerThan(a, b) {
  let a_mtime = (await fs.promises.stat(a)).mtime;
  let b_mtime = (await fs.promises.stat(b)).mtime;
  return a_mtime > b_mtime;
}

async function exists(f) {
  try {
    await fs.promises.access(f);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    else throw e;
  }
}
