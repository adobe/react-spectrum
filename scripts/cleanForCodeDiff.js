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

let removeList = [
  'LICENSE',
  '.gitignore',
  '.npmignore',
  'README.md',
  'node_modules',
  'scripts',
  'docs',
  'chromatic',
  'stories',
  'test',
  'tests',
  'index.ts',
  'package.json',
  'intl'
];

build().catch(err => {
  console.error(err.stack);
  process.exit(1);
});


async function build() {
  let packagesDir = path.join(__dirname, '..', 'packages');
  let packages = glob.sync('*/**/package.json', {cwd: packagesDir});

  for (let remove of removeList) {
    console.log(`deleting ${remove}`);
    for (let p of packages) {
      fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', path.dirname(p), remove));
      fs.removeSync(path.join(__dirname, '..', 'dist', 'published-packages', path.dirname(p), remove));
    }
  }

  console.log('deleting dev packages');
  fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', 'dev'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'published-packages', 'dev'));

  for (let p of packages) {
    if (fs.existsSync(path.join(__dirname, '..', 'dist', 'build-packages', p))) {
      let json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'dist', 'build-packages', p)), 'utf8');
      if (json.private) {
        console.log(`deleting private package ${path.dirname(p)}`);
        fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', path.dirname(p)));
        fs.removeSync(path.join(__dirname, '..', 'dist', 'published-packages', path.dirname(p)));
      }
    }
  }

  console.log('deleting icon src, it does not go to distribution');
  fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', '@spectrum-icons', 'color', 'src'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', '@spectrum-icons', 'illustrations', 'src'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', '@spectrum-icons', 'ui', 'src'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', '@spectrum-icons', 'workflow', 'src'));

  console.log('deleting prepublish work, comment out later');
  // we can remove these if we run the prepublish step as well
  fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', '@adobe', 'react-spectrum'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'published-packages', '@adobe', 'react-spectrum'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', 'react-aria'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'published-packages', 'react-aria'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'build-packages', 'react-stately'));
  fs.removeSync(path.join(__dirname, '..', 'dist', 'published-packages', 'react-stately'));

  console.log('delete all .map files');
  // re-add once parcel is upgraded, but css maps don't exist is the currently published code
  deleteRecusivelySync(path.join(__dirname, '..', 'dist'), /\.map$/);
}

function deleteRecusivelySync(filepath, pattern) {
  let files = fs.readdirSync(filepath);
  for (let file of files) {
    if (pattern.test(file)) {
      fs.removeSync(path.join(filepath, file));
      continue;
    }
    if (fs.lstatSync(path.join(filepath, file)).isDirectory()) {
      deleteRecusivelySync(path.join(filepath, file), pattern);
    }
  }
}
