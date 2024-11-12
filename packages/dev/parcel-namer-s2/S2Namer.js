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
    if (mainAsset?.filePath.includes('@react-spectrum/s2')) {
      if (bundle.needsStableName && bundle.target.distEntry) {
        return bundle.target.distEntry;
      }
      let ext = '.' + bundle.type;
      if (bundle.type === 'js') {
        ext = bundle.env.outputFormat === 'esmodule' ? '.mjs' : '.cjs';
      }
      let originalExt = path.extname(mainAsset.filePath);
      let name = path.basename(mainAsset.filePath, originalExt).replace(/\*/g, 'intlStrings');
      let m = mainAsset.filePath.match(/spectrum-illustrations\/(linear|gradient\/generic\d)/);
      if (m) {
        if (originalExt === '.svg') {
          return m[1] + '/internal/' + name + ext;
        }
        return m[1] + '/' + name + ext;
      }
      return name
        .replace(/^S2_Icon_(.*?)(Size\d+)?_\d+(?:x\d+)?_N$/, '$1')
        .replace(/^S2_(fill|lin)_(.+)_(generic\d)_(\d+)$/, (m, type, name, style) => {
          name = name[0].toUpperCase() + name.slice(1).replace(/_/g, '');
          return 'gradient/' + style + '/' + name;
        })
        + ext;
    }
  }
});
