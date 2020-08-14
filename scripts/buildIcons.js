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

import spawn from 'cross-spawn';
import glob from 'fast-glob';
import {promises as fs} from 'fs';
import path from 'path';

const PACKAGES = {
  ui: path.dirname(require.resolve('@adobe/react-spectrum-ui/dist/')),
  workflow: path.dirname(
    require.resolve('@adobe/react-spectrum-workflow/dist/')
  ),
  color: path.dirname(
    require.resolve('@adobe/react-spectrum-workflow-color/dist/')
  ),
  illustrations: path.join(getIconPackageFolder('illustrations'), 'src')
};

(async function () {
  // run in packages where at least one dist js file is newer that the corresponding source js file
  for (let [pkg, srcFolder] of Object.entries(PACKAGES)) {
    let distFolder = getIconPackageFolder(pkg);
    for (let srcFile of await glob([
      path.join(srcFolder, '*.{js,tsx}').replace(/\\/g, '/')
    ])) {
      let filename = path.basename(srcFile);
      if (filename === 'index.js' || filename === 'util.js') {
        continue;
      }

      let distFile =
        path.join(distFolder, path.basename(srcFile, path.extname(srcFile))) +
        '.js';
      if (!(await exists(distFile)) || (await isNewerThan(srcFile, distFile))) {
        console.log(`Building icons for @spectrum-icons/${pkg}`);
        if (pkg !== 'illustrations') {
          await run('yarn', ['make-icons'], {
            cwd: distFolder,
            stdio: 'inherit'
          });
        }
        await run('yarn', ['build-icons'], {
          cwd: distFolder,
          stdio: 'inherit'
        });
        break;
      }
    }
  }
})().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});

function run(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    let child = spawn(cmd, args, opts);
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Child process failed'));
        return;
      }

      resolve();
    });
  });
}

function getIconPackageFolder(name) {
  return path.resolve(
    path.join(__dirname, '..', 'packages', '@spectrum-icons', name)
  );
}

async function isNewerThan(a, b) {
  let a_mtime = (await fs.stat(a)).mtime;
  let b_mtime = (await fs.stat(b)).mtime;
  return a_mtime > b_mtime;
}

async function exists(f) {
  try {
    await fs.access(f);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    else throw e;
  }
}
