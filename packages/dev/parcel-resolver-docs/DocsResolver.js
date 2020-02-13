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
const {Resolver} = require('@parcel/plugin');
const NodeResolver = require('@parcel/node-resolver-core').default;

module.exports = new Resolver({
  resolve({dependency, options, filePath}) {
    if (dependency.pipeline === 'docs' || dependency.pipeline === 'docs-json') {
      const resolver = new NodeResolver({
        extensions: ['ts', 'tsx', 'd.ts', 'js'],
        mainFields: ['source', 'types', 'main'],
        options
      });
  
      return resolver.resolve({
        filename: filePath,
        isURL: dependency.isURL,
        parent: dependency.sourcePath,
        env: dependency.env
      });
    }
  }
});
