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

const glob = require('fast-glob');
const fs = require('fs');
let path = require('path');
let packagePaths = glob.sync(path.dirname(__dirname) + '/packages/**/*/package.json');
let oldPackagePaths = glob.sync(path.dirname(__dirname) + '/../../react-spectrum/packages/**/*/package.json');
let errors = false;

let oldPackages = {};
let packages = {};
for (let oldpkgPath of oldPackagePaths) {
  let json = JSON.parse(fs.readFileSync(oldpkgPath));
  oldPackages[json.name] = json;
}
for (let pkgPath of packagePaths) {
  let json = JSON.parse(fs.readFileSync(pkgPath));
  packages[json.name] = json;
  let madeChanges = false;

  if (json.dependencies) {
    for (let [name, val] of Object.entries(json.dependencies)) {
      if (!isOurDep(name)) {
        continue;
      }
      if (oldPackages[json.name]?.dependencies?.[name]) {
        json.dependencies[name] = oldPackages[json.name].dependencies[name];
        madeChanges = true;
      }
    }
  }
  if (json.devDependencies) {
    for (let [name, val] of Object.entries(json.devDependencies)) {
      if (!isOurDep(name)) {
        continue;
      }
      if (oldPackages[json.name]?.devDependencies?.[name]) {
        json.devDependencies[name] = oldPackages[json.name].devDependencies[name];
        madeChanges = true;
      }
    }
  }
  if (json.peerDependencies) {
    for (let [name, val] of Object.entries(json.peerDependencies)) {
      if (!isOurDep(name)) {
        continue;
      }
      if (oldPackages[json.name]?.peerDependencies?.[name]) {
        json.peerDependencies[name] = oldPackages[json.name].peerDependencies[name];
        madeChanges = true;
      }
    }
  }
  if (madeChanges) {
    console.log('made changes to ' + json.name)
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2) + '\n');
  }
}


function isOurDep(dep) {
  return dep.includes('react-spectrum')
    || dep.startsWith('@spectrum')
    || dep.startsWith('@adobe')
    || dep.includes('react-aria')
    || dep.includes('react-stately')
    || dep.startsWith('@internationalized')
    || dep.startsWith('react-aria-components');
}
