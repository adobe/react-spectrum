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
const path = require('path');

module.exports = new Resolver({
  async resolve({dependency, options, specifier}) {
    if (dependency.specifier.startsWith('docs:') || dependency.specifier.startsWith('apiCheck:') || dependency.pipeline === 'docs' || dependency.pipeline === 'docs-json' || dependency.pipeline === 'apiCheck') {
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

      if (resolved && resolved.filePath) {
        // HACK: ensure source code is used to build types, not compiled code.
        // Parcel removes the source field from package.json when the code comes from node_modules.
        // these are full filepaths, so don't check if they start with the pattern, they won't
        if ((
          /@(react-spectrum|react-aria|react-stately|internationalized|spectrum-icons|adobe\/react-spectrum)/g.test(resolved.filePath)
          || /react-aria-components/g.test(resolved.filePath)
        ) && resolved.filePath.endsWith('.d.ts')) {
          resolved.filePath = path.resolve(path.dirname(resolved.filePath), '..', 'src', 'index.ts');
        }

        resolved.filePath = await options.inputFS.realpath(resolved.filePath);
        resolved.sideEffects = true;
        return resolved;
      }
    }

    if (/^@(react-spectrum|react-aria)\/(.*?)\/docs\/(.*)$/.test(specifier)) {
      let baseDir = process.env.DOCS_ENV === 'production' ? 'docs' : 'packages';
      return {filePath: path.join(options.projectRoot, baseDir, specifier)};
    }
  }
});
