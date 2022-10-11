/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {Resolver} = require('@parcel/plugin');
const reactVersion = require('react-dom/package.json').version;

module.exports = new Resolver({
  async resolve({specifier}) {
    if (specifier === 'react-dom/client') {
      let specifier = reactVersion.startsWith('18') ? 'react-dom/client.js' : 'react-dom/index.js';
      return {
        filePath: __dirname + '/react.js',
        code: `
        export * from '${specifier}';
        export * as default from '${specifier}'
        `
      };
    } else if (specifier === 'axe-core') {
      // Work around interop issue with ESM and CJS.
      return {
        filePath: __dirname + '/axe-core.js',
        code: `
        export * from 'axe-core/axe.js';
        export * as default from 'axe-core/axe.js'
        `
      };
    }
  }
});
