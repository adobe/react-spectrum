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
        'Disallow using node.parentElement in favor of getParentElement() for shadow DOM compatibility',
      recommended: true
    },
    fixable: 'code',
    messages: {
      useGetParentElement:
        'Use getParentElement() instead of node.parentElement for shadow DOM compatibility.'
    }
  },
  create: context => {
    let hasGetParentElementImport = false;
    let getParentElementLocalName = 'getParentElement';
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
          // Check if getParentElement is already imported
          const hasGetParentElement = node.specifiers.some(
            spec =>
              spec.type === 'ImportSpecifier' &&
              spec.imported.type === 'Identifier' &&
              spec.imported.name === 'getParentElement'
          );
          if (hasGetParentElement) {
            hasGetParentElementImport = true;
            const getParentElementSpec = node.specifiers.find(
              spec =>
                spec.type === 'ImportSpecifier' &&
                spec.imported.type === 'Identifier' &&
                spec.imported.name === 'getParentElement'
            );
            getParentElementLocalName = getParentElementSpec.local.name;
          }
        }
      },

      // Detect node.parentElement usage
      ["MemberExpression[computed=false][property.name='parentElement']"](node) {
        context.report({
          node,
          messageId: 'useGetParentElement',
          fix: fixer => {
            const fixes = [];
            const sourceCode = context.sourceCode;

            // Replace node.parentElement with getParentElement(node)
            fixes.push(
              fixer.replaceText(
                node,
                `${getParentElementLocalName}(${sourceCode.getText(node.object)})`
              )
            );

            // Add import if not present
            if (!hasGetParentElementImport) {
              if (existingReactAriaUtilsImport) {
                // Add getParentElement to existing @react-aria/utils import
                const specifiers = existingReactAriaUtilsImport.specifiers;
                if (specifiers.length > 0) {
                  fixes.push(
                    fixer.insertTextAfter(
                      sourceCode.getFirstToken(
                        existingReactAriaUtilsImport,
                        token => token.value === '{'
                      ),
                      'getParentElement, '
                    )
                  );
                }
              } else {
                // No existing import from @react-aria/utils, create a new one
                const programNode = context.sourceCode.ast;
                const imports = programNode.body.filter(node => node.type === 'ImportDeclaration');

                if (imports.length > 0) {
                  const lastImport = imports[imports.length - 1];
                  const importStatement = "\nimport {getParentElement} from '@react-aria/utils';";
                  fixes.push(fixer.insertTextAfter(lastImport, importStatement));
                } else {
                  // No imports, add at the beginning
                  const importStatement = "import {getParentElement} from '@react-aria/utils';\n";
                  fixes.push(fixer.insertTextBefore(programNode.body[0], importStatement));
                }
              }

              // Mark as imported for subsequent fixes in the same file
              hasGetParentElementImport = true;
            }

            return fixes;
          }
        });
      }
    };
  }
};

export default plugin;
