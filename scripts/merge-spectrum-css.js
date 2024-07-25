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

import {exec, execSync} from 'child_process';
import fg from 'fast-glob';
import fs from 'fs';

let existingComponents = fg.sync('packages/@react-spectrum/*', {onlyFiles: false}).map(componentPath => componentPath.split('/')[componentPath.split('/').length - 1]);
let components = fg.sync('packages/\@adobe/spectrum-css-temp/components/*', {onlyFiles: false}).map(componentPath => componentPath.split('/')[componentPath.split('/').length - 1]);
let ignoreComponents = ['README.md']; // complicated

function promiseFromChildProcess(child) {
  return new Promise(function (resolve, reject) {
    child.addListener('error', reject);
    child.addListener('exit', resolve);
  });
}

function getFilesizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

let promises = [];
console.log('components', components);
console.log('ignoreComponents', ignoreComponents);
console.log('existingComponents', existingComponents);
if (!fs.existsSync(`${__dirname}/temp`)) {
  fs.mkdirSync(`${__dirname}/temp`);
  components.forEach((componentName) => {
    console.log('componentName', componentName);
    if (ignoreComponents.includes(componentName)) {
      return;
    }
    let rootDir = `${__dirname}/temp/${componentName}`;
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir);
    } else {
      return;
    }
    // TODO: yes, these are hard coded for now, whoever comes along next can figure out how to get these off the cli
    // it's also likely moving forward that base will be at components/${componentName}/ instead of at src
    promises.push(promiseFromChildProcess(exec(`cd ${__dirname}/../../spectrum-css; git show 1ab4e023b3db0e40556979555ebd69cdccceccac:src/${componentName}/index.css > ${rootDir}/index-basefile`)));
    promises.push(promiseFromChildProcess(exec(`cd ${__dirname}/../../spectrum-css; git show 1ab4e023b3db0e40556979555ebd69cdccceccac:src/${componentName}/skin.css > ${rootDir}/skin-basefile`)));
    promises.push(promiseFromChildProcess(exec(`cd ${__dirname}/../../spectrum-css; git show HEAD:components/${componentName}/index.css > ${rootDir}/index-remotefile`)));
    promises.push(promiseFromChildProcess(exec(`cd ${__dirname}/../../spectrum-css; git show HEAD:components/${componentName}/skin.css > ${rootDir}/skin-remotefile`)));
    promises.push(promiseFromChildProcess(exec(`cp ${__dirname}/../packages/@adobe/spectrum-css-temp/components/${componentName}/index.css ${rootDir}/index-localfile`)));
    promises.push(promiseFromChildProcess(exec(`cp ${__dirname}/../packages/@adobe/spectrum-css-temp/components/${componentName}/skin.css ${rootDir}/skin-localfile`)));

    if (!fs.existsSync(`${rootDir}/index.css`)) {
      fs.closeSync(fs.openSync(`${rootDir}/index.css`, 'w'));
    }
    if (!fs.existsSync(`${rootDir}/skin.css`)) {
      fs.closeSync(fs.openSync(`${rootDir}/skin.css`, 'w'));
    }
  });
} else {
  console.log('skipping creation of diff directory');
}

function runCommand(cmd, count = 0) {
  try {
    execSync(cmd);
  } catch (error) {
    if (count > 3) {
      console.log(error, cmd, 'try', count);
      return;
    }
    runCommand(cmd, count + 1);
  }
  console.log('success', cmd, 'try', count);
}

Promise.all(promises).then(() => {
  components.forEach(componentName => {
    if (ignoreComponents.includes(componentName)) {
      return;
    }
    let rootDir = `${__dirname}/temp/${componentName}`;
    // if the result file already exists,
    if (getFilesizeInBytes(`${rootDir}/index.css`) === 0) {
      if (fs.existsSync(`${rootDir}/index-basefile`)
        && fs.existsSync(`${rootDir}/index-remotefile`)
        && fs.existsSync(`${rootDir}/index-localfile`)) {

        runCommand(`cd ${rootDir}; p4merge-cli index-basefile index-remotefile index-localfile index.css`);
      }
      if (getFilesizeInBytes(`${rootDir}/index.css`) > 0) {
        runCommand(`cp ${rootDir}/index.css ${__dirname}/../packages/@adobe/spectrum-css-temp/components/${componentName}/index.css`);
      }
    }


    if (getFilesizeInBytes(`${rootDir}/skin.css`) === 0) {
      if (fs.existsSync(`${rootDir}/skin-basefile`)
        && fs.existsSync(`${rootDir}/skin-remotefile`)
        && fs.existsSync(`${rootDir}/skin-localfile`)) {

        runCommand(`cd ${rootDir}; p4merge-cli skin-basefile skin-remotefile skin-localfile skin.css`);
      }
      if (getFilesizeInBytes(`${rootDir}/skin.css`) > 0) {
        runCommand(`cp ${rootDir}/skin.css ${__dirname}/../packages/@adobe/spectrum-css-temp/components/${componentName}/skin.css`);
      }
    }
  });
});
