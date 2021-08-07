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

// Yarn 2 is very strict about peer dependencies. Peers declared in a package must also be
// declared in all parent packages, recursively. This script adds the missing peer deps
// to all packages following these requirements.

const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

const workspacePackages = JSON.parse(exec('yarn workspaces info --json').toString().split('\n').slice(1, -2).join('\n'));
const incomingDeps = new Map();

for (let pkg in workspacePackages) {
  for (let dep of workspacePackages[pkg].workspaceDependencies) {
    if (!incomingDeps.has(dep)) {
      incomingDeps.set(dep, new Set());
    }

    incomingDeps.get(dep).add(pkg);
  }
}

for (let pkg in workspacePackages) {
  let json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', workspacePackages[pkg].location, 'package.json'), 'utf8'));
  if (!json.private && json.peerDependencies) {
    for (let peer in json.peerDependencies) {
      addPeers(pkg, peer, json.peerDependencies[peer]);
    }
  }
}

function addPeers(pkg, peer, range, seen = new Set()) {
  if (seen.has(pkg)) {
    return;
  }

  seen.add(pkg);

  let pkgPath = path.join(__dirname, '..', workspacePackages[pkg].location, 'package.json');
  let json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (!json.peerDependencies) {
    json.peerDependencies = {};
  }

  if (!json.peerDependencies[peer] && !json.dependencies[peer]) {
    console.log('Adding peer ' + peer + ' to package ' + pkg);
    json.peerDependencies[peer] = range;
    fs.writeFileSync(pkgPath, JSON.stringify(json, false, 2) + '\n');
  }

  let parents = incomingDeps.get(pkg);
  if (parents) {
    for (let parent of parents) {
      addPeers(parent, peer, range);
    }
  }
}
