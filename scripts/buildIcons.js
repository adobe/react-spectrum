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

import glob from 'fast-glob';
import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';

const MAKE_PACKAGES = ['ui', 'workflow', 'color'].map((n) =>
  getIconPackageFolder(n)
);
const BUILD_PACKAGES = [
  ...MAKE_PACKAGES,
  getIconPackageFolder('illustrations'),
];

(async function () {
  // run `yarn make-icons` in packages which were never built or where the package.json is newer than the first source
  for (let pkg of MAKE_PACKAGES) {
    let firstSource = (await exists(path.join(pkg, 'src')))
      ? (await glob([path.join(pkg, 'src/*.tsx').replace(/\\/g, '/')]))[0]
      : null;

    if (
      firstSource == null ||
      (await isNewerThan(path.join(pkg, 'package.json'), firstSource))
    ) {
      console.log('make-icons:', pkg);
      await run('yarn', ['make-icons'], {
        cwd: pkg,
        stdio: 'inherit',
      });
    }
  }

  // run `yarn make-icons` in packages where at least one tsx file is newer thatn the corresponding js file
  for (let pkg of BUILD_PACKAGES) {
    for (let srcFile of await glob([
      path.join(pkg, 'src/*.tsx').replace(/\\/g, '/'),
    ])) {
      let distFile =
        path.join(pkg, path.basename(srcFile, path.extname(srcFile))) + '.js';
      if (!(await exists(distFile)) || (await isNewerThan(srcFile, distFile))) {
        console.log('build-icons:', pkg);
        await run('yarn', ['build-icons'], {
          cwd: pkg,
          stdio: 'inherit',
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
