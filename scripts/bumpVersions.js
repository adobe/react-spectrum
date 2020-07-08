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
const chalk = require('chalk');

let levels = {
  alpha: 1,
  beta: 2,
  rc: 3,
  released: 4
};

// Packages to release
let publicPackages = {
  '@adobe/react-spectrum': 'rc',
  '@react-spectrum/actiongroup': 'released',
  '@react-spectrum/breadcrumbs' : 'released',
  '@react-spectrum/button': 'released',
  '@react-spectrum/buttongroup': 'released',
  '@react-spectrum/checkbox': 'released',
  '@react-spectrum/dialog': 'released',
  '@react-spectrum/divider': 'released',
  '@react-spectrum/form': 'released',
  '@react-spectrum/icon': 'released',
  '@react-spectrum/illustratedmessage': 'released',
  '@react-spectrum/image': 'released',
  '@react-spectrum/label': 'released',
  '@react-spectrum/layout': 'released',
  '@react-spectrum/link': 'released',
  '@react-spectrum/listbox': 'released',
  '@react-spectrum/menu': 'released',
  '@react-spectrum/meter': 'released',
  '@react-spectrum/overlays': 'released',
  '@react-spectrum/picker': 'released',
  '@react-spectrum/progress': 'released',
  '@react-spectrum/provider': 'released',
  '@react-spectrum/radio': 'released',
  '@react-spectrum/searchfield': 'released',
  '@react-spectrum/statuslight': 'released',
  '@react-spectrum/switch': 'released',
  '@react-spectrum/table': 'alpha',
  '@react-spectrum/text': 'released',
  '@react-spectrum/textfield': 'released',
  '@react-spectrum/theme-dark': 'released',
  '@react-spectrum/theme-default': 'released',
  '@react-spectrum/utils': 'released',
  '@react-spectrum/view': 'released',
  '@react-spectrum/well': 'released',
  '@spectrum-icons/color': 'released',
  '@spectrum-icons/workflow': 'released',
  '@spectrum-icons/illustrations': 'released',
  '@react-stately/data': 'released'
};

// Packages never to release
let excludedPackages = new Set([
  '@adobe/spectrum-css-temp',
  '@react-spectrum/test-utils',
  '@spectrum-icons/build-tools'
]);

// Get dependency tree from yarn workspaces, and build full list of packages to release
// based on dependencies of the public packages.
let info = JSON.parse(exec('yarn workspaces info --json').toString().split('\n').slice(1, -2).join('\n'));
let releasedPackages = new Map();

// If releasing an individual package, bump that package and all packages that depend on it.
// Otherwise, add all public packages and their dependencies.
let arg = process.argv[process.argv.length - 1];
if (arg.startsWith('@')) {
  if (!info[arg]) {
    throw new Error('Invalid package ' + arg);
  }

  let addPackage = (pkg, status) => {
    if (excludedPackages.has(pkg)) {
      return;
    }

    let filePath = info[pkg].location + '/package.json';
    let pkgJSON = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (pkgJSON.private) {
      return;
    }

    if (releasedPackages.has(pkg)) {
      let cur = releasedPackages.get(pkg);
      if (levels[status] > levels[cur.level]) {
        cur.status = status;
      }

      return;
    }

    releasedPackages.set(pkg, {
      location: info[pkg].location,
      status
    });

    for (let p in info) {
      if (releasedPackages.has(p)) {
        continue;
      }

      if (info[p].workspaceDependencies.includes(pkg)) {
        addPackage(p, status);
      }
    }
  };

  addPackage(arg, publicPackages[arg]);

  for (let pkg in info) {
    if (!releasedPackages.has(pkg)) {
      excludedPackages.add(pkg);
    }
  }
} else {
  let addPackage = (pkg, status) => {
    if (excludedPackages.has(pkg)) {
      return;
    }

    if (releasedPackages.has(pkg)) {
      let cur = releasedPackages.get(pkg);
      if (levels[status] > levels[cur.level]) {
        cur.status = status;
      }

      return;
    }

    releasedPackages.set(pkg, {
      location: info[pkg].location,
      status
    });

    for (let dep of info[pkg].workspaceDependencies) {
      addPackage(dep, status);
    }
  };

  for (let pkg in publicPackages) {
    addPackage(pkg, publicPackages[pkg]);
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
  for (let [name, {location}] of releasedPackages) {
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
  for (let [name, {location, status}] of releasedPackages) {
    let filePath = location + '/package.json';
    let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // If the package already exists on npm, then increment the version
    // number to the correct status. If it's a new package, then ensure
    // the package.json version is correct according to the status.
    if (existingPackages.has(name)) {
      let newVersion = status === 'released'
        ? semver.inc(pkg.version, 'patch')
        : semver.inc(pkg.version, 'prerelease', status)
      versions.set(name, [pkg.version, newVersion, pkg.private]);
    } else {
      let parsed = semver.parse(pkg.version);
      let newVersion = pkg.version;
      if (parsed.prerelease.length > 0) {
        if (status === 'released') {
          newVersion = semver.inc(pkg.version, 'patch');
        } else if (parsed.prerelease[0] !== status) {
          newVersion = semver.inc(pkg.version, 'prerelease', status);
        } else {
          parsed.prerelease[1] = 0;
          newVersion = parsed.format();
        }
      } else {
        if (status === 'released') {
          newVersion = '3.0.0';
        } else {
          newVersion = semver.inc(pkg.version, 'prerelease', status);
        }
      }

      versions.set(name, [pkg.version, newVersion, pkg.private]);
    }
  }

  return versions;
}

async function promptVersions(versions) {
  console.log('');
  for (let [name, [oldVersion, newVersion, private]] of versions) {
    if (newVersion !== oldVersion) {
      console.log(`${name}: ${chalk.blue(oldVersion)}${private ? chalk.red(' (private)') : ''} => ${chalk.green(newVersion)}`);
    }
  }

  let loggedSpace = false;
  for (let name in info) {
    if (!releasedPackages.has(name) && !excludedPackages.has(name)) {
      let filePath = info[name].location + '/package.json';
      let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!pkg.private) {
        if (!loggedSpace) {
          console.log('');
          loggedSpace = true;
        }

        console.warn(chalk.red(`${name} will change from public to private`));
      }
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
  for (let [name, {location}] of releasedPackages) {
    let filePath = location + '/package.json';
    let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    pkg.version = versions.get(name)[1];

    if (pkg.private) {
      delete pkg.private;
    }

    for (let dep in pkg.dependencies) {
      if (versions.has(dep)) {
        let {status} = releasedPackages.get(dep);
        pkg.dependencies[dep] = (status === 'released' ? '^' : '') + versions.get(dep)[1];
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(pkg, false, 2) + '\n');
  }

  for (let name in info) {
    if (!releasedPackages.has(name) && !excludedPackages.has(name)) {
      let filePath = info[name].location + '/package.json';
      let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!pkg.private) {
        pkg = insertKey(pkg, 'license', 'private', true);
      }

      for (let dep in pkg.dependencies) {
        if (versions.has(dep)) {
          let {status} = releasedPackages.get(dep);
          pkg.dependencies[dep] = (status === 'released' ? '^' : '') + versions.get(dep)[1];
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(pkg, false, 2) + '\n');
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
