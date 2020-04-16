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
const fetch = require('node-fetch');
const semver = require('semver');
const readline = require("readline");

// Packages to release
let publicPackages = {
  '@react-spectrum/actiongroup': 'alpha',
  '@react-spectrum/breadcrumbs' : 'alpha',
  '@react-spectrum/button': 'rc',
  '@react-spectrum/buttongroup': 'alpha',
  '@react-spectrum/checkbox': 'rc',
  '@react-spectrum/dialog': 'alpha',
  '@react-spectrum/divider': 'rc',
  '@react-spectrum/form': 'rc',
  '@react-spectrum/icon': 'rc',
  '@react-spectrum/illustratedmessage': 'alpha',
  '@react-spectrum/image': 'alpha',
  '@react-spectrum/label': 'rc',
  '@react-spectrum/layout': 'alpha',
  '@react-spectrum/link': 'alpha',
  '@react-spectrum/listbox': 'alpha',
  '@react-spectrum/menu': 'alpha',
  '@react-spectrum/meter': 'rc',
  '@react-spectrum/overlays': 'alpha',
  '@react-spectrum/picker': 'alpha',
  '@react-spectrum/progress': 'rc',
  '@react-spectrum/provider': 'rc',
  '@react-spectrum/radio': 'rc',
  '@react-spectrum/searchfield': 'rc',
  '@react-spectrum/statuslight': 'rc',
  '@react-spectrum/switch': 'rc',
  '@react-spectrum/textfield': 'rc',
  '@react-spectrum/theme-default': 'rc',
  '@react-spectrum/typography': 'alpha',
  '@react-spectrum/utils': 'rc',
  '@react-spectrum/view': 'alpha',
  '@react-spectrum/well': 'rc',
  '@spectrum-icons/color': 'rc',
  '@spectrum-icons/workflow': 'rc'
};

// Packages never to release
let blackList = new Set([
  '@adobe/spectrum-css-temp',
  '@react-spectrum/test-utils',
  '@spectrum-icons/build-tools'
]);

// Get dependency tree from yarn workspaces, and build full list of packages to release
// based on dependencies of the public packages.
let info = JSON.parse(exec('yarn workspaces info --json').toString().split('\n').slice(1, -2).join('\n'));
let releasedPackages = new Map();

for (let pkg in publicPackages) {
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

run();

async function run() {
  let existingPackages = await getExistingPackages();
  let versions = getVersions(existingPackages);
  await promptVersions(versions);
  bumpVersions(versions);
  commit(versions);
}

async function getExistingPackages() {
  // Find what packages already exist on npm
  let existing = new Set();
  let promises = [];
  for (let [name, location] of releasedPackages) {
    promises.push(
      fetch(`https://registry.npmjs.com/${name}`, {method: 'HEAD'})
        .then(res => {
          if (res.ok) {
            existing.add(name);
          }
        })
    );
  }

  await Promise.all(promises);
  return existing;
}

function getVersions(existingPackages) {
  let versions = new Map();
  let names = [...existingPackages].sort();
  for (let name of releasedPackages.keys()) {
    let filePath = releasedPackages.get(name) + '/package.json';
    let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (pkg.private) {
      continue;
    }

    if (existingPackages.has(name)) {
      versions.set(name, [pkg.version, semver.inc(pkg.version, 'prerelease')]);
    } else {
      versions.set(name, [pkg.version, pkg.version]);
    }
  }

  return versions;
}

async function promptVersions(versions) {
  console.log('');
  for (let [name, [oldVersion, newVersion]] of versions) {
    if (newVersion !== oldVersion) {
      console.log(`${name}: ${oldVersion} => ${newVersion}`);
    }
  }

  console.log('');

  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question('Do you want to continue? (y/n) ', function(c) {
      rl.close();
      if (c === 'n') {
        reject('Not continuing');
      } else if (c === 'y') {
        resolve();
      } else {
        reject('Invalid answer');
      }
    });
  });
}

function bumpVersions(versions) {
  for (let [name, location] of releasedPackages) {
    let filePath = location + '/package.json';
    let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    pkg.version = versions.get(name)[1];
  
    if (pkg.private) {
      console.warn(`${name} changed from private to public`);
      delete pkg.private;
    }
  
    for (let dep in pkg.dependencies) {
      if (versions.has(dep)) {
        pkg.dependencies[dep] = '^' + versions.get(dep)[1];
      }
    }
  
    fs.writeFileSync(filePath, JSON.stringify(pkg, false, 2) + '\n');
  }
  
  for (let name in info) {
    if (!releasedPackages.has(name) && !blackList.has(name)) {
      let filePath = info[name].location + '/package.json';
      let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!pkg.private) {
        console.warn(`${name} should not be public`);
        pkg = insertKey(pkg, 'license', 'private', true);
        fs.writeFileSync(filePath, JSON.stringify(pkg, false, 2) + '\n');
      }
    }
  }  
}

function commit(versions) {
  exec('git commit -a -m "Publish"', {stdio: 'inherit'});
  for (let [name, [, newVersion]] of versions) {
    exec(`git tag ${name}@${newVersion}`, {stdio: 'inherit'});
  }
}

function insertKey(obj, afterKey, key, value) {
  let res = {};
  for (let k in obj) {
    res[k] = obj[k];
    if (k === afterKey) {
      res[key] = value;
    }
  }

  return res;
}
