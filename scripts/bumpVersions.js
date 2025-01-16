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
const spawn = require('child_process').spawnSync;
const fs = require('fs');
const fetch = require('node-fetch');
const semver = require('semver');
const readline = require('readline');
const chalk = require('chalk');
const http = require('http');
const qs = require('querystring');

let levels = {
  alpha: 1,
  beta: 2,
  rc: 3,
  released: 4
};

// Packages never to release
let excludedPackages = new Set([
  '@adobe/spectrum-css-temp',
  '@react-spectrum/test-utils-internal',
  '@spectrum-icons/build-tools',
  '@react-spectrum/docs'
]);

let monopackages = new Set([
  '@adobe/react-spectrum',
  'react-aria',
  'react-stately'
]);

// Should be able to replace a lot of this file with yarns versioning plugin
// it should ensure version bumps for dependencies
// it can also make a preview if we use deferred updates, and we don't need to have semver
// it can also avoid private packages in the workspace
// shouldn't need to query npm for existing packages, since we commit the new version
// yarn should also be able to tell us packages which have changed since last release

class VersionManager {
  constructor() {
    let workspaceLookup = {};
    // Get dependency tree from yarn workspaces
    this.workspacePackages = exec('yarn workspaces list --json -v').toString().split('\n')
      .map(line => {
        try {
          let result = JSON.parse(line);
          workspaceLookup[result.location] = result.name;
          return result;
        } catch (e) {
          // ignore empty lines
        }
      })
      .filter(Boolean)
      .reduce((acc, item) => {
        acc[item.name] = item;
        acc[item.name].workspaceDependencies = item.workspaceDependencies.map(dep => workspaceLookup[dep]);
        return acc;
      }, {});
    this.existingPackages = new Set();
    this.changedPackages = new Set();
    this.versionBumps = {};
    this.releasedPackages = new Map();
  }

  async run() {
    await this.getExistingPackages();
    this.getChangedPackages();

    await this.getVersionBumps();
    for (let pkg in this.versionBumps) {
      let bump = this.versionBumps[pkg];
      if (bump === 'unreleased' || bump === 'unchanged') {
        continue;
      }

      this.addReleasedPackage(pkg, bump);
    }

    let all = process.argv.findIndex(arg => arg === '--all');
    if (all >= 0) {
      let bump = process.argv[all + 1] ?? 'patch';
      for (let name in this.workspacePackages) {
        if (this.versionBumps[name]) {
          continue;
        }

        let filePath = this.workspacePackages[name].location + '/package.json';
        let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!pkg.private) {
          let prerelease = semver.parse(pkg.version).prerelease;
          let b = prerelease.length === 0 ? bump : prerelease[0];
          this.changedPackages.add(name);
          this.addReleasedPackage(name, b);
        }
      }
    }

    let versions = this.getVersions();
    await this.promptVersions(versions);
    this.bumpVersions(versions);
    this.commit(versions);
  }

  async getExistingPackages() {
    // Find what packages already exist on npm
    let packages = Object.keys(this.workspacePackages);
    for (let i = 0; i < packages.length; i += 20) {
      let promises = [];
      for (let name of packages.slice(i, i + 20)) {
        let filePath = this.workspacePackages[name].location + '/package.json';
        let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (pkg.private) {
          continue;
        }

        console.log('Checking ' + name + ' on npm');

        promises.push(
          fetch(`https://registry.npmjs.com/${name}`)
            .then(res => {
              if (res.ok) {
                return res.json();
              }
            })
            .then(json => {
              if (!json) {
                return;
              }

              let tags = json['dist-tags'];
              for (let tag in tags) {
                if (!tags[tag].includes('nightly')) {
                  this.existingPackages.add(name);
                  break;
                }
              }
            })
        );
      }

      await Promise.all(promises);
    }
  }

  getChangedPackages() {
    let packagesIndex = process.argv.findIndex(arg => arg === '--add' || arg === '--only');
    if (packagesIndex >= 0) {
      for (let pkg of process.argv.slice(packagesIndex + 1)) {
        this.changedPackages.add(pkg);
      }
      if (process.argv[packagesIndex] === '--only') {
        return;
      }
    }


    // Diff each package individually. Some packages might have been skipped during last release,
    // so we cannot simply look at the last tag on the whole repo.
    for (let name in this.workspacePackages) {
      let filePath = this.workspacePackages[name].location + '/package.json';
      let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!pkg.private) {
        // Diff this package since the last published version, according to the package.json.
        // We create a git tag for each package version.
        let tag = `${pkg.name}@${pkg.version}`;
        let res = spawn('git', ['diff', '--exit-code', tag + '..HEAD',  this.workspacePackages[name].location, ':!**/docs/**', ':!**/test/**', ':!**/stories/**', ':!**/chromatic/**']);
        if (res.status !== 0) {
          this.changedPackages.add(name);
        }
      }
    }

    // Always bump monopackages
    for (let pkg of monopackages) {
      this.changedPackages.add(pkg);
    }
  }

  async getVersionBumps() {
    return new Promise((resolve) => {
      let server = http.createServer(async (req, res) => {
        if (req.method === 'POST') {
          await this.serveVersionBumps(req, res);
          server.close();
          req.connection.destroy();
          resolve();
        } else {
          this.serveChangedPackages(res);
        }
      });

      server.listen(9000, () => {
        exec('open http://localhost:9000');
      });
    });
  }

  serveChangedPackages(res) {
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!doctype html>
      <html style="color-scheme: dark light">
        <body>
          <form method="post">
            <h1>Changed packages</h1>
            <table>
              ${[...this.changedPackages].filter(pkg => !excludedPackages.has(pkg) && !this.existingPackages.has(pkg)).map(pkg => `
              <tr>
                <td><code>${pkg}</code></td>
                <td>
                  <select name="${pkg}">
                    <option>unreleased</option>
                    <option>alpha</option>
                    <option>beta</option>
                    <option>rc</option>
                    <option>released</option>
                  </select>
                </td>
              </tr>
            `).join('\n')}
              ${[...this.changedPackages].filter(pkg => !excludedPackages.has(pkg) && this.existingPackages.has(pkg)).map(pkg => {
                let json = JSON.parse(fs.readFileSync(this.workspacePackages[pkg].location + '/package.json', 'utf8'));
                let version = semver.parse(json.version);
                return `
                  <tr>
                    <td><code>${pkg}</code></td>
                    <td>
                      <select name="${pkg}">
                        <option>unchanged</option>
                        <option ${version.prerelease[0] === 'alpha' ? 'selected' : ''}>alpha</option>
                        <option ${version.prerelease[0] === 'beta' ? 'selected' : ''}>beta</option>
                        <option ${version.prerelease[0] === 'rc' ? 'selected' : ''}>rc</option>
                        <option>patch</option>
                        <option ${version.prerelease.length === 0 ? 'selected' : ''}>minor</option>
                        <option>major</option>
                      </select>
                    </td>
                  </tr>
                `;
              }).join('\n')}
            </table>
            <input type="submit" />
          </form>
        </body>
      </html>
    `);
  }

  serveVersionBumps(req, res) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (data) => {
        body += data;
      });

      req.on('end', () => {
        this.versionBumps = qs.parse(body);
        res.setHeader('Content-Type', 'text/html');
        res.end('<html style="color-scheme: dark light"><body>Done!</body></html>', () => {
          resolve();
        });
      });
    });
  }

  addReleasedPackage(pkg, bump, isDep = false) {
    bump = this.versionBumps[pkg] || bump;
    if (excludedPackages.has(pkg) || bump === 'unpublished' || bump === 'unchanged') {
      return;
    }

    let status = bump === 'alpha' || bump === 'beta' || bump === 'rc' ? bump : 'released';

    if (this.releasedPackages.has(pkg)) {
      let cur = this.releasedPackages.get(pkg);
      if (!isDep || levels[status] > levels[cur.status]) {
        cur.status = status;
        cur.bump = bump;
      } else {
        status = cur.status;
        bump = cur.bump;
      }
    } else {
      this.releasedPackages.set(pkg, {
        location: this.workspacePackages[pkg].location,
        status,
        bump
      });
    }

    // Bump anything that depends on this package if it's a prerelease
    // because dependencies will be pinned rather than caret ranges.
    // Bump anything that has this as a dep by a patch, all the way up the tree
    for (let p in this.workspacePackages) {
      if (this.releasedPackages.has(p)) {
        continue;
      }

      if (this.workspacePackages[p].workspaceDependencies.includes(pkg)) {
        let filePath = this.workspacePackages[p].location + '/package.json';
        let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let prerelease = semver.parse(pkg.version).prerelease;
        let b = prerelease.length === 0 ? 'patch' : prerelease[0];
        if (this.existingPackages.has(p) && status !== 'released') {
          // Bump a patch version of the dependent package if it's not also a prerelease.
          // Otherwise, bump to the next prerelease in the existing status.
          this.addReleasedPackage(p, b, true);
        } else if (this.existingPackages.has(p) && status === 'released') {
          this.addReleasedPackage(p, b);
        }
      }
    }

    // Ensure all dependencies of this package are published and up to date
    for (let dep of this.workspacePackages[pkg].workspaceDependencies) {
      if (!this.existingPackages.has(dep) || this.changedPackages.has(dep)) {
        // Bump a patch version of the dependent package if it's not also a prerelease.
        // Otherwise, bump to the next prerelease in the existing status.
        let filePath = this.workspacePackages[dep].location + '/package.json';
        let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let prerelease = semver.parse(pkg.version).prerelease;
        let b = prerelease.length === 0 ? 'patch' : prerelease[0];
        this.addReleasedPackage(dep, b);
      }
    }
  }

  getVersions() {
    let versions = new Map();
    for (let [name, {location, status, bump}] of this.releasedPackages) {
      let filePath = this.workspacePackages[name].location + '/package.json';
      let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (!bump || bump === 'unreleased' || bump === 'unchanged') {
        versions.set(name, [pkg.version, pkg.version, pkg.private]);
        continue;
      }

      // If the package already exists on npm, then increment the version
      // number to the correct status. If it's a new package, then ensure
      // the package.json version is correct according to the status.
      if (this.existingPackages.has(name)) {
        let newVersion = status === 'released'
          ? semver.inc(pkg.version, bump)
          : semver.inc(pkg.version, 'prerelease', status);
        versions.set(name, [pkg.version, newVersion, pkg.private]);
      } else {
        let newVersion = '3.0.0';
        if (status !== 'released') {
          newVersion += `-${status}.0`;
        }

        versions.set(name, [pkg.version, newVersion, pkg.private]);
      }
    }



    return versions;
  }

  async promptVersions(versions) {
    console.log('');
    for (let [name, [oldVersion, newVersion, isPrivate]] of versions) {
      if (newVersion !== oldVersion || isPrivate) {
        console.log(`${name}: ${chalk.blue(oldVersion)}${isPrivate ? chalk.red(' (private)') : ''} => ${chalk.green(newVersion)}`);
      }
    }

    let loggedSpace = false;
    for (let name in this.workspacePackages) {
      if (!this.releasedPackages.has(name) && !excludedPackages.has(name) && !this.existingPackages.has(name)) {
        let filePath = this.workspacePackages[name].location + '/package.json';
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
      rl.question('Do you want to continue? (y/n) ', function (c) {
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

  bumpVersions(versions) {
    for (let [name, {location}] of this.releasedPackages) {
      let filePath = location + '/package.json';
      let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      pkg.version = versions.get(name)[1];

      if (pkg.private) {
        delete pkg.private;
      }

      for (let dep in pkg.dependencies) {
        if (versions.has(dep)) {
          let {status} = this.releasedPackages.get(dep);
          pkg.dependencies[dep] = (status === 'released' ? '^' : '') + versions.get(dep)[1];
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(pkg, false, 2) + '\n');
    }

    for (let name in this.workspacePackages) {
      if (!this.releasedPackages.has(name)) {
        let filePath = this.workspacePackages[name].location + '/package.json';
        let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Mark package as private if it wasn't already published.
        if (!pkg.private && !excludedPackages.has(name) && !this.existingPackages.has(name)) {
          pkg = insertKey(pkg, 'license', 'private', true);
        }

        // Ensure pinned dependencies of unpublished packages in the monorepo are updated.
        for (let dep in pkg.dependencies) {
          if (versions.has(dep)) {
            let {status} = this.releasedPackages.get(dep);
            if (status !== 'released') {
              pkg.dependencies[dep] = versions.get(dep)[1];
            }
          }
        }

        fs.writeFileSync(filePath, JSON.stringify(pkg, false, 2) + '\n');
      }
    }
  }

  commit(versions) {
    exec('git commit -a -m "Publish"', {stdio: 'inherit'});
    for (let [name, [, newVersion]] of versions) {
      exec(`git tag ${name}@${newVersion}`, {stdio: 'inherit'});
    }
  }
}

new VersionManager().run();

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
