/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {Namer} = require('@parcel/plugin');
const path = require('path');

module.exports = new Namer({
  name({bundle}) {
    let mainAsset = bundle.getMainEntry();

    if (bundle.needsStableName && bundle.target.distEntry) {
      return bundle.target.distEntry;
    }
    let ext = '.' + bundle.type;
    if (
      bundle.type === 'js' &&
      bundle.target.name !== 'legacy-module' &&
      bundle.target.name !== 'module'
    ) {
      ext = bundle.env.outputFormat === 'esmodule' ? '.mjs' : '.cjs';
    }
    let originalExt = path.extname(mainAsset.filePath);
    let basename = path.basename(mainAsset.filePath, originalExt).replace(/\*/g, 'intlStrings');
    let name = basename;
    let m = mainAsset.filePath.match(/spectrum-illustrations\/(linear|gradient\/generic\d)/);
    if (m) {
      if (originalExt === '.svg') {
        return m[1] + '/internal/' + name + ext;
      }
      return m[1] + '/' + name + ext;
    } else if (mainAsset.filePath.includes('/exports/')) {
      let index = mainAsset.filePath.indexOf('/exports/');
      name = path.dirname(mainAsset.filePath.slice(index + 1)) + '/' + name;
    } else if (
      bundle.target.distDir.endsWith('/dist') &&
      !bundle.target.distDir.includes('/style/')
    ) {
      let index = mainAsset.filePath.indexOf('/src/');
      if (index >= 0) {
        name = 'private/' + path.dirname(mainAsset.filePath.slice(index + 5)) + '/' + name;
      } else {
        index = mainAsset.filePath.indexOf('/intl/');
        if (index >= 0) {
          name = 'private/' + path.dirname(mainAsset.filePath.slice(index)) + '/' + name;
        } else {
          name = 'private/' + name;
        }
      }
    }

    if (mainAsset.filePath.includes('@adobe/spectrum-css-temp')) {
      name = 'private/' + mainAsset.filePath.split(path.sep).at(-2) + '_' + basename;
    }
    if (path.extname(mainAsset.filePath) === '.css' && mainAsset.type === 'js') {
      // CSS module
      name += '_css';
    }

    return (
      name
        .replace(/^S2_Icon_(.*?)(Size\d+)?_\d+(?:x\d+)?_N$/, '$1')
        .replace(/^S2_(fill|lin)_(.+)_(generic\d)_(\d+)$/, (m, type, name, style) => {
          name = name[0].toUpperCase() + name.slice(1).replace(/_/g, '');
          return 'gradient/' + style + '/' + name;
        })
        .replace(/\.module$/, '_module') + ext
    );
    // }
  }
});
