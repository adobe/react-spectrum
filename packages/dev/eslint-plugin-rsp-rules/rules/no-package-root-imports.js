/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import fs from 'fs';

const RESTRICTED_PACKAGES = new Set(['react-aria', 'react-stately', 'react-aria-components']);

const plugin = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing from package roots when a subpath import is required'
    },
    schema: []
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        let source = node.source.value;
        if (typeof source !== 'string' || !RESTRICTED_PACKAGES.has(source)) {
          return;
        }
        let matches = node.specifiers.filter(
          specifier =>
            specifier.type === 'ImportSpecifier' &&
            fs.existsSync(`packages/${source}/exports/${specifier.imported.name}.ts`)
        );
        let suggestion =
          matches.length > 0
            ? matches.map(match => `'${source}/${match.imported.name}'`).join(', ')
            : `'${source}/<subpath>'`;

        context.report({
          node,
          message: `Import from a subpath instead of '${source}'. For example: ${suggestion}.`
        });
      }
    };
  }
};

export default plugin;
