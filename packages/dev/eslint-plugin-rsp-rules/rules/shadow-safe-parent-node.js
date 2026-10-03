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

const plugin = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow using node.parentNode in favor of getParentNode() for shadow DOM compatibility',
      recommended: true
    },
    fixable: 'code',
    messages: {
      useGetParentNode:
        'Use getParentNode() instead of node.parentNode for shadow DOM compatibility.'
    }
  },
  create: context => {
    let hasGetParentNodeImport = false;
    let getParentNodeLocalName = 'getParentNode';
    let existingReactAriaUtilsImport = null;

    return {
      // Track imports from @react-aria/utils
      ImportDeclaration(node) {
        if (
          node.source &&
          node.source.type === 'Literal' &&
          node.source.value === '@react-aria/utils'
        ) {
          existingReactAriaUtilsImport = node;
          // Check if getParentNode is already imported
          const hasGetParentNode = node.specifiers.some(
            spec =>
              spec.type === 'ImportSpecifier' &&
              spec.imported.type === 'Identifier' &&
              spec.imported.name === 'getParentNode'
          );
          if (hasGetParentNode) {
            hasGetParentNodeImport = true;
            const getParentNodeSpec = node.specifiers.find(
              spec =>
                spec.type === 'ImportSpecifier' &&
                spec.imported.type === 'Identifier' &&
                spec.imported.name === 'getParentNode'
            );
            getParentNodeLocalName = getParentNodeSpec.local.name;
          }
        }
      },

      // Detect node.parentNode usage
      ["MemberExpression[computed=false][property.name='parentNode']"](node) {
        context.report({
          node,
          messageId: 'useGetParentNode',
          fix: fixer => {
            const fixes = [];
            const sourceCode = context.sourceCode;

            // Replace node.parentNode with getParentNode(node)
            fixes.push(
              fixer.replaceText(
                node,
                `${getParentNodeLocalName}(${sourceCode.getText(node.object)})`
              )
            );

            // Add import if not present
            if (!hasGetParentNodeImport) {
              if (existingReactAriaUtilsImport) {
                // Add getParentNode to existing @react-aria/utils import
                const specifiers = existingReactAriaUtilsImport.specifiers;
                if (specifiers.length > 0) {
                  fixes.push(
                    fixer.insertTextAfter(
                      sourceCode.getFirstToken(
                        existingReactAriaUtilsImport,
                        token => token.value === '{'
                      ),
                      'getParentNode, '
                    )
                  );
                }
              } else {
                // No existing import from @react-aria/utils, create a new one
                const programNode = context.sourceCode.ast;
                const imports = programNode.body.filter(node => node.type === 'ImportDeclaration');

                if (imports.length > 0) {
                  const lastImport = imports[imports.length - 1];
                  const importStatement = "\nimport {getParentNode} from '@react-aria/utils';";
                  fixes.push(fixer.insertTextAfter(lastImport, importStatement));
                } else {
                  // No imports, add at the beginning
                  const importStatement = "import {getParentNode} from '@react-aria/utils';\n";
                  fixes.push(fixer.insertTextBefore(programNode.body[0], importStatement));
                }
              }

              // Mark as imported for subsequent fixes in the same file
              hasGetParentNodeImport = true;
            }

            return fixes;
          }
        });
      }
    };
  }
};

export default plugin;
