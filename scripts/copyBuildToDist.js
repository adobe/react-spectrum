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

const fs = require('fs-extra');
const path = require('path');
const glob = require('fast-glob');

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
  // Add dependencies on each published package to the package.json, and
  // copy the docs from the current package into the temp dir.
  let packagesDir = path.join(__dirname, '..', 'packages');
  let packages = glob.sync('*/**/package.json', {cwd: packagesDir});

  // Copy package.json for each package into docs dir so we can find the correct version numbers
  console.log('moving over from node_modules');
  for (let p of packages) {
    if (fs.existsSync(path.join(__dirname, '..', 'packages', p))) {
      fs.copySync(path.join(__dirname, '..', 'packages',  path.dirname(p)), path.join(__dirname, '..', 'dist', 'build-packages', path.dirname(p)));
    }
  }
}
