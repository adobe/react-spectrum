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
  '@react-spectrum/test-utils',
  '@spectrum-icons/build-tools',
  '@react-spectrum/docs'
]);

class VersionManager {
  constructor() {
    // Get dependency tree from yarn workspaces
    this.workspacePackages = JSON.parse(exec('yarn workspaces info --json').toString().split('\n').slice(1, -2).join('\n'));
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

    let versions = this.getVersions();
    await this.promptVersions(versions);
    this.bumpVersions(versions);
    this.commit(versions);
  }

  async getExistingPackages() {
    // Find what packages already exist on npm
    let promises = [];
    for (let name in this.workspacePackages) {
      promises.push(
        fetch(`https://registry.npmjs.com/${name}`, {method: 'HEAD'})
          .then(res => {
            if (res.ok) {
              this.existingPackages.add(name);
            }
          })
      );
    }

    await Promise.all(promises);
  }

  getChangedPackages() {
    let res = exec("git diff $(git describe --tags --abbrev=0)..HEAD --name-only packages ':!**/dev/**' ':!**/docs/**' ':!**/test/**' ':!**/stories/**' ':!**/chromatic/**'", {encoding: 'utf8'});

    for (let line of res.trim().split('\n')) {
      let parts = line.split('/');
      let name = parts.slice(1, 3).join('/');
      let pkg = JSON.parse(fs.readFileSync(`packages/${name}/package.json`, 'utf8'));
      this.changedPackages.add(name);
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
                let json = JSON.parse(fs.readFileSync(`packages/${pkg}/package.json`, 'utf8'));
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
    if (status !== 'released') {
      for (let p in this.workspacePackages) {
        if (this.releasedPackages.has(p)) {
          continue;
        }

        if (this.workspacePackages[p].workspaceDependencies.includes(pkg)) {
          if (this.existingPackages.has(p)) {
            this.addReleasedPackage(p, bump, true);
          }
        }
      }
    }

    // Ensure all dependencies of this package are published and up to date
    for (let dep of this.workspacePackages[pkg].workspaceDependencies) {
      if (!this.existingPackages.has(dep) || this.changedPackages.has(dep)) {
        this.addReleasedPackage(dep, bump);
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
          : semver.inc(pkg.version, 'prerelease', status)
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
