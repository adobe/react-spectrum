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
const replace = require('replace-in-file');
let yargs = require('yargs');


let argv = yargs
  .option('verbose', {alias: 'v', type: 'boolean'})
  .option('output', {alias: 'o', type: 'string'})
  .option('githash', {type: 'string'})
  .argv;

build().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

/**
 * Building this will run the docs builder using the apiCheck pipeline in .parcelrc.
 * We must use two pipelines, one for entry points, and one for processing dependencies. If we try to use the same pipeline for both, parcel
 * will get confused and fail.
 * This will generate json containing the visible (API/exposed) type definitions for each package
 * This is run against the current branch by copying the current branch into a temporary directory and building there
 */
async function build() {
  let archiveDir;
  if (argv.githash) {
    archiveDir = tempy.directory();
    console.log('checking out archive of', argv.githash, 'into', archiveDir);
    await run('sh', ['-c', `git archive ${argv.githash} | tar -x -C ${archiveDir}`], {stdio: 'inherit'});
  }
  let projectDir = path.join(__dirname, '..');
  let srcDir = archiveDir ?? projectDir;
  let distDir = path.join(projectDir, 'dist', argv.output ?? 'branch-api');
  // if we already have a directory with a built dist, remove it so we can write cleanly into it at the end
  fs.removeSync(distDir);
  // Create a temp directory to build the site in
  let dir = tempy.directory();
  console.log(`Building branch api into ${dir}...`);

  // Generate a package.json containing just what we need to build the website
  let pkg = {
    name: 'rsp-website',
    version: '0.0.0',
    private: true,
    workspaces: [
      'packages/react-stately',
      'packages/react-aria',
      'packages/react-aria-components',
      'packages/*/*'
    ],
    devDependencies: Object.fromEntries(
      Object.entries(packageJSON.devDependencies)
        .filter(([name]) =>
          name.startsWith('@parcel') ||
          name === 'parcel' ||
          name === 'patch-package' ||
          name.startsWith('@spectrum-css') ||
          name.startsWith('@testing-library') ||
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
  let packagesDir = path.join(srcDir, 'packages');
  let packages = glob.sync('*/**/package.json', {cwd: packagesDir});

  pkg.devDependencies['babel-plugin-transform-glob-import'] = '*';

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, false, 2));

  fs.writeFileSync(path.join(dir, 'babel.config.json'), `{
    "plugins": [
      "transform-glob-import"
    ]
  }`);

  // Copy necessary code and configuration over
  fs.copySync(path.join(srcDir, 'packages', '@adobe', 'spectrum-css-temp'), path.join(dir, 'packages', '@adobe', 'spectrum-css-temp'), {dereference: true});
  // need dev from latest on branch since it will generate the API for diffing, and in older commits it may not be able to do this or
  // does it in a different format
  fs.copySync(path.join(projectDir, 'yarn.lock'), path.join(dir, 'yarn.lock'), {dereference: true});
  fs.copySync(path.join(projectDir, 'postcss.config.js'), path.join(dir, 'postcss.config.js'), {dereference: true});
  fs.copySync(path.join(projectDir, 'lib'), path.join(dir, 'lib'), {dereference: true});
  fs.copySync(path.join(projectDir, 'CONTRIBUTING.md'), path.join(dir, 'CONTRIBUTING.md'), {dereference: true});
  fs.copySync(path.join(projectDir, 'packages', 'dev'), path.join(dir, 'packages', 'dev'), {dereference: true});
  fs.copySync(path.join(projectDir, '.parcelrc'), path.join(dir, '.parcelrc'), {dereference: true});
  fs.copySync(path.join(projectDir, 'tsconfig.json'), path.join(dir, 'tsconfig.json'), {dereference: true});

  // Only copy relevant patches
  let patches = fs.readdirSync(path.join(projectDir, 'patches'), {dereference: true});
  let eligiblePatches = patches.filter(name => name.startsWith('@babel') || name.startsWith('@parcel'));
  console.log('copy patches', eligiblePatches);
  for (let patch of eligiblePatches) {
    fs.copySync(path.join(projectDir, 'patches', patch), path.join(dir, 'patches', patch), {dereference: true});
  }

  let excludeList = ['@react-spectrum/story-utils'];
  // Copy packages over to temp dir
  console.log('copying over');
  for (let p of packages) {
    if (!p.includes('spectrum-css') && !p.includes('example-theme') && !p.includes('dev/')) {
      let json = JSON.parse(fs.readFileSync(path.join(srcDir, 'packages', p)), 'utf8');

      if (json.name in excludeList) {
        continue;
      }

      fs.copySync(path.join(srcDir, 'packages', path.dirname(p)), path.join(dir, 'packages', path.dirname(p)), {dereference: true});

      if (!p.includes('@react-types')) {
        delete json.types;
      }
      delete json.main;
      delete json.module;
      delete json.devDependencies;
      json.apiCheck = 'dist/api.json';
      json.targets = {
        apiCheck: {}
      };
      fs.writeFileSync(path.join(dir, 'packages', p), JSON.stringify(json, false, 2));
    }
  }

  // Install dependencies from npm
  fs.removeSync(path.join(dir, 'packages', 'dev', 'docs', 'node_modules'));
  await run('yarn', {cwd: dir, stdio: 'inherit'});
  // uncomment to locally debug parcel in node_modules
  fs.copySync(path.join(projectDir, 'node_modules', '@parcel'), path.join(dir, 'node_modules', '@parcel'), {dereference: true});
  // Build the website
  console.log('building api files');
  await run('yarn', ['parcel', 'build', 'packages/@react-{spectrum,aria,stately}/*/', 'packages/@internationalized/{message,string,date,number}', '--target', 'apiCheck'], {cwd: dir, stdio: 'inherit'});
  await replace({
    files: path.join(dir, 'packages', '**', 'api.json'),
    from: new RegExp(dir, 'g'),
    to: argv.output ? '/base' : '/branch'
  });

  // Copy the build back into dist, and delete the temp dir.
  fs.copySync(path.join(dir, 'packages'), distDir, {dereference: true});
  fs.removeSync(dir);
  if (archiveDir) {
    fs.removeSync(archiveDir);
  }
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
