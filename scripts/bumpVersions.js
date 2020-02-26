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

const exec = require('child_process').execSync;
const fs = require('fs');

// Version to bump to
// TODO: get this from the command line, and possibly support semver bumping rules
let version = '3.0.0-rc.1';

// Packages to release
let publicPackages = [
  '@react-spectrum/provider',
  '@react-spectrum/icon',
  '@react-spectrum/button',
  '@react-spectrum/textfield',
  '@react-spectrum/radio',
  '@react-spectrum/switch',
  '@react-spectrum/checkbox',
  '@react-spectrum/label',
  '@react-spectrum/progress',
  '@react-spectrum/divider',
  '@react-spectrum/statuslight',
  '@react-spectrum/well',
  '@react-spectrum/form',
  '@react-spectrum/searchfield',
  '@react-spectrum/meter',
  '@react-spectrum/theme-default'
];

// Packages never to release
let blackList = new Set([
  '@adobe/spectrum-css-temp',
  '@react-spectrum/test-utils',
  '@spectrum-icons/build-tools',

  // Keep as alpha for now even though it's a dep of provider
  '@react-aria/dialog'
]);

// Get dependency tree from yarn workspaces, and build full list of packages to release
// based on dependencies of the public packages.
let info = JSON.parse(JSON.parse(exec('yarn workspaces info --json')).data);
let releasedPackages = new Map();

for (let pkg of publicPackages) {
  addPackage(pkg);
}

function addPackage(pkg) {
  if (blackList.has(pkg) || releasedPackages.has(pkg)) {
    return;
  }

  releasedPackages.set(pkg, info[pkg].location);

  for (let dep of info[pkg].workspaceDependencies) {
    addPackage(dep);
  }
}

console.log('Released packages:', releasedPackages.keys());

// Bump versions
for (let [name, location] of releasedPackages) {
  let filePath = location + '/package.json';
  let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  pkg.version = version;

  if (pkg.private) {
    console.warn(`${name} changed from private to public`);
    delete pkg.private;
  }

  for (let dep in pkg.dependencies) {
    if (releasedPackages.has(dep)) {
      pkg.dependencies[dep] = '^' + version;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(pkg, false, 2) + '\n');
}
