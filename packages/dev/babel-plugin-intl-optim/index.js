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

const {declare} = require('@babel/helper-plugin-utils');
const path = require('path');
const {types} = require('@babel/core');

function getContents(filePath, ref) {
  const resolvedPath = path.join(filePath, '..', ref);
  return require(resolvedPath);
}

module.exports = declare((api) => {
  api.assertVersion(7);

  return {
    visitor: {
      ExportNamedDeclaration(path, {file}) {
        const fullPath = file && file.opts.filename;
        if (!fullPath.includes('intl')) {
          return;
        }

        const importExt = path && path.node && path.node.source && path.node.source.value;
        if (!importExt || !/\.json$/.test(importExt || '')) {
          return;
        }

        const specifiers = path.node.specifiers;
        if (!specifiers.length) {
          return;
        }

        if (!types.isExportSpecifier(specifiers[0])) {
          return;
        }

        const json = getContents(fullPath, importExt);

        path.replaceWith(
          types.exportNamedDeclaration(
            types.variableDeclaration('const', [
              types.variableDeclarator(
                types.identifier(specifiers[0].exported.name),
                types.valueToNode(json)
              )
            ]), [], null
          )
        );
      }
    }
  };
});
