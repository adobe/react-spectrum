/*
 * Copyright 2023 Adobe. All rights reserved.
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
  async resolve({dependency, options, specifier}) {
    // Move intl files into their own parallel bundles.
    if (/intl\/[a-zA-Z-]+\.json$/.test(specifier)) {
      const resolver = new NodeResolver({
        fs: options.inputFS,
        projectRoot: options.projectRoot,
        extensions: ['ts', 'tsx', 'd.ts', 'js'],
        mainFields: ['source', 'types', 'main']
      });

      let resolved = await resolver.resolve({
        filename: specifier,
        specifierType: dependency.specifierType,
        parent: dependency.resolveFrom,
        env: dependency.env,
        sourcePath: dependency.sourcePath
      });
      resolved.priority = 'parallel';
      return resolved;
    }
  }
});
