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
const assert = require('assert');
const chalk = require('chalk');
let path = require('path');
let packagePaths = glob.sync(path.dirname(__dirname) + '/packages/@{react,spectrum}-*/*/package.json');
let errors = false;

// soft assert won't fail the whole thing, allowing us to accumulate all errors at once
// there's probably a nicer way to do this, but well... sometimes it's good enough. feel free to update me :)
// maybe turn me into an actual eslint plugin so we get their format for styling
function softAssert(val, message) {
  try {
    assert(val, message);
  } catch {
    console.error(chalk.red(message));
    errors = true;
  }
}
softAssert.deepEqual = function (val, val2, message) {
  try {
    assert.deepEqual(val, val2, message);
  } catch {
    console.error(chalk.red(message));
    errors = true;
  }
};
softAssert.equal = function (val, val2, message) {
  try {
    assert.strictEqual(val, val2, message);
  } catch {
    console.error(chalk.red(message));
    errors = true;
  }
};

// Checks if a dependency is actually being imported somewhere
function isDepUsed(dep, src) {
  let depRegex = new RegExp(`import .* from '${dep}'`);
  let files = glob.sync(src + '/src', {
    ignore: ['**/node_modules/**', '**/dist/**']
  });

  for (let file of files) {
    let contents = fs.readFileSync(file, 'utf8');
    if (depRegex.test(contents)) {
      return true;
    }
  }
  return false;
}

let pkgNames = {};
let packages = {};
for (let pkgPath of packagePaths) {
  let json = JSON.parse(fs.readFileSync(pkgPath));
  packages[pkgPath] = json;
  pkgNames[json.name] = true;
}

for (let pkg of packagePaths) {
  let json = packages[pkg];

  if (!pkg.includes('@react-types') && !pkg.includes('@spectrum-icons') && !pkg.includes('@react-aria/example-theme') && !pkg.includes('@react-spectrum/style-macro-s1') && json.rsp?.type !== 'cli') {
    let topIndexExists = fs.existsSync(path.join(pkg, '..', 'index.ts'));
    if (topIndexExists) {
      let contents = fs.readFileSync(path.join(pkg, '..', 'index.ts'));
      softAssert(/export \* from '.\/src';/.test(contents), `contents of ${path.join(pkg, '..', 'index.ts')} are not "export * from './src';"`);
    }
    softAssert(topIndexExists, `${pkg} is missing an index.ts`);
    softAssert(fs.existsSync(path.join(pkg, '..', 'src', 'index.ts')), `${pkg} is missing a src/index.ts`);
  }

  let readme = path.join(path.dirname(pkg), 'README.md');
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(readme, `# ${json.name}\n\nThis package is part of [react-spectrum](https://github.com/adobe/react-spectrum). See the repo for more details.`);
  }
}


for (let pkg of packagePaths) {
  let globSrc = pkg.replace('package.json', '**/*.{js,ts,tsx}');
  let json = JSON.parse(fs.readFileSync(pkg));
  let [scope, basename] = json.name.split('/');

  if (basename.includes('utils') || basename.includes('layout')) {
    continue;
  }

  let aria = `@react-aria/${basename}`;
  let stately = `@react-stately/${basename}`;
  let types = `@react-types/${basename}`;

  if (scope === '@react-spectrum' && isDepUsed(aria, globSrc)) {
    softAssert(!pkgNames[aria] || json.dependencies[aria], `${pkg} is missing a dependency on ${aria}`);
  }

  if ((scope === '@react-aria' || scope === '@react-spectrum') && isDepUsed(stately, globSrc)) {
    softAssert(!pkgNames[stately] || json.dependencies[stately], `${pkg} is missing a dependency on ${stately}`);
  }

  if ((scope === '@react-aria' || scope === '@react-spectrum' || scope === '@react-stately') && isDepUsed(types, globSrc)) {
    softAssert(!pkgNames[types] || json.dependencies[types], `${pkg} is missing a dependency on ${types}`);
  }
}

if (errors) {
  process.exit(1);
}
