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

const plugin = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Checks and fixes usage of React.Key'
    },
    fixable: 'code',
    schema: [] // no options
  },
  create: function (context) {
    return {
      // Could be improved to look up the local name of Key and preserve it
      ImportSpecifier(node) {
        if (node.imported.name === 'Key' && node.parent.source.value === 'react') {
          context.report({
            node,
            message: 'Do not use React.Key. Instead, use ReactAria.Key.',
            fix: (fixer) => {
              let defaultSpecifier = node.parent.specifiers.find(node => node.type === 'ImportDefaultSpecifier');
              let fixes = [];
              if (node.parent.specifiers.length === 1) {
                // covers case 'import {Key} from 'react';'
                fixes.push(fixer.remove(node.parent));
              } else if (node.parent.specifiers.filter(node => node.type === 'ImportSpecifier').length === 1) {
                // covers case 'import React, {Key} from 'react';'
                fixes.push(fixer.removeRange([defaultSpecifier.range[1], node.range[1] + 1]));
              } else if (node.parent.specifiers.filter(node => node.type === 'ImportSpecifier').length > 1) {
                // covers case 'import {Foo, Key} from 'react';'
                if (node.parent.specifiers[node.parent.specifiers.length - 1] === node) {
                  fixes.push(fixer.removeRange([node.range[0] - 2, node.range[1]]));
                } else {
                  // and case 'import {Key, ReactElement, ReactNode} from 'react';'
                  fixes.push(fixer.removeRange([node.range[0], node.range[1] + 2]));
                }
              }
              let sharedImport = node.parent.parent.body.find(node => node.type === 'ImportDeclaration' && node.source.value === '@react-types/shared');
              if (sharedImport) {
                // handles existing import from '@react-types/shared'
                let firstSpecifier = sharedImport.specifiers.find(node => node.type === 'ImportSpecifier');
                fixes.push(fixer.insertTextAfter(firstSpecifier, ', Key'));
                return fixes;
              }
              // handles no existing import from '@react-types/shared'
              let lastImport = node.parent.parent.body.findLast(node => node.type === 'ImportDeclaration');
              fixes.push(fixer.insertTextAfter(lastImport, "\nimport {Key} from '@react-types/shared';"));
              return fixes;
            }
          });
        }
      },
      Identifier(node) {
        // Could be improved by looking up the local name of React
        if (node.name === 'Key' && (node.parent?.object?.name === 'React' || node.parent?.left?.name === 'React')) {
          context.report({
            node,
            message: 'Do not use React.Key. Instead, use ReactAria.Key.'
          });
        }
      }
    };
  }
};

export default plugin;
