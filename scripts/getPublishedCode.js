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

const tempy = require('tempy');
const fs = require('fs-extra');
const packageJSON = require('../package.json');
const path = require('path');
const glob = require('fast-glob');
const spawn = require('cross-spawn');

build().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

/**
 * Building this will run the docs builder using the apiCheck pipeline in .parcelrc
 * This will generate json containing the visible (API/exposed) type definitions for each package
 * This is run against a downloaded copy of the last published version of each package into a temporary directory and build there
 */
async function build() {
  // Create a temp directory to build the site in
  let dir = tempy.directory();
  console.log(`Building published api into ${dir}...`);

  // Generate a package.json containing just what we need to build the website
  let pkg = {
    name: 'rsp-website',
    version: '0.0.0',
    private: true,
    workspaces: [
      'packages/*/*'
    ],
    devDependencies: Object.fromEntries(
      Object.entries(packageJSON.devDependencies)
        .filter(([name]) =>
          name.startsWith('@parcel') ||
          name === 'parcel' ||
          name === 'patch-package' ||
          name.startsWith('@spectrum-css') ||
          name.startsWith('postcss') ||
          name.startsWith('@adobe')
        )
    ),
    dependencies: {},
    resolutions: packageJSON.resolutions,
    browserslist: packageJSON.browserslist,
    scripts: {
      build: 'yarn parcel build packages/@react-spectrum/actiongroup',
      postinstall: 'patch-package'
    }
  };

  // Add dependencies on each published package to the package.json, and
  // copy the docs from the current package into the temp dir.
  let packagesDir = path.join(__dirname, '..', 'packages');
  let packages = glob.sync('*/**/package.json', {cwd: packagesDir});
  for (let p of packages) {
    let json = JSON.parse(fs.readFileSync(path.join(packagesDir, p), 'utf8'));
    if (!json.private && json.name !== '@adobe/react-spectrum') {
      pkg.dependencies[json.name] = 'latest';
    }
  }

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, false, 2));

  // Install dependencies from npm
  await run('yarn', {cwd: dir, stdio: 'inherit'});

  // Copy package.json for each package into docs dir so we can find the correct version numbers
  console.log('moving over from node_modules');
  for (let p of packages) {
    if (fs.existsSync(path.join(dir, 'node_modules', p))) {
      fs.moveSync(path.join(dir, 'node_modules', path.dirname(p)), path.join(dir, 'packages', path.dirname(p)));
    }
  }

  fs.copySync(path.join(dir, 'packages'), path.join(__dirname, '..', 'dist', 'published-packages'));
  fs.removeSync(dir);
}

function run(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    let child = spawn(cmd, args, opts);
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error('Child process failed'));
        return;
      }

      resolve();
    });
  });
}
