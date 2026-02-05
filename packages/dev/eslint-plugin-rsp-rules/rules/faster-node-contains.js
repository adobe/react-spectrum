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
      description: 'Optimize nodeContains calls by using faster alternatives like :focus-within and isConnected',
      recommended: true
    },
    fixable: 'code',
    messages: {
      useFocusWithin: 'Use isFocusWithin(element) instead of nodeContains for activeElement checks.',
      useIsConnected: 'Use node.isConnected instead of nodeContains for document contains checks.'
    }
  },
  create: (context) => {
    let existingReactAriaUtilsImport = null;
    let hasIsFocusWithinImport = false;

    return {
      // Track imports from @react-aria/utils
      ImportDeclaration(node) {
        if (
          node.source &&
          node.source.type === 'Literal' &&
          node.source.value === '@react-aria/utils'
        ) {
          existingReactAriaUtilsImport = node;
          hasIsFocusWithinImport = node.specifiers.some(
            spec =>
              spec.type === 'ImportSpecifier' &&
              spec.imported.type === 'Identifier' &&
              spec.imported.name === 'isFocusWithin'
          );
        }
      },

      // Detect nodeContains() function calls
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'nodeContains') {
          const sourceCode = context.sourceCode;

          // nodeContains should have exactly 2 arguments
          if (node.arguments.length === 2) {
            const firstArg = node.arguments[0];
            const secondArg = node.arguments[1];

            if (isDocumentActiveElement(secondArg)) {
              // Case 1: Check if second argument is document.activeElement
              const elementText = sourceCode.getText(firstArg);

              context.report({
                node,
                messageId: 'useFocusWithin',
                fix: (fixer) => {
                  const fixes = [fixer.replaceText(node, `isFocusWithin(${elementText})`)];

                  // Add import if not present
                  if (!hasIsFocusWithinImport) {
                    if (existingReactAriaUtilsImport) {
                      const specifiers = existingReactAriaUtilsImport.specifiers;
                      if (specifiers.length > 0) {
                        const openBrace = sourceCode.getFirstToken(
                          existingReactAriaUtilsImport,
                          token => token.value === '{'
                        );
                        if (openBrace) {
                          fixes.push(
                            fixer.insertTextAfter(openBrace, 'isFocusWithin, ')
                          );
                        }
                      }
                    } else {
                      const programNode = context.sourceCode.ast;
                      const imports = programNode.body.filter(
                        n => n.type === 'ImportDeclaration'
                      );
                      const importStatement =
                        "\nimport {isFocusWithin} from '@react-aria/utils';";

                      if (imports.length > 0) {
                        const lastImport = imports[imports.length - 1];
                        fixes.push(fixer.insertTextAfter(lastImport, importStatement));
                      } else {
                        fixes.push(
                          fixer.insertTextBefore(
                            programNode.body[0],
                            "import {isFocusWithin} from '@react-aria/utils';\n"
                          )
                        );
                      }
                    }
                  }

                  return fixes;
                }
              });
            } else if (isDocument(firstArg)) {
              // Case 2: Check if first argument is document
              const nodeText = sourceCode.getText(secondArg);

              context.report({
                node,
                messageId: 'useIsConnected',
                fix: (fixer) => {
                  return fixer.replaceText(node, `${nodeText}.isConnected`);
                }
              });
            }
          }
        }
      }
    };
  }
};

function isDocumentActiveElement(node) {
  return (
    node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    node.object.name === 'document' &&
    node.property.type === 'Identifier' &&
    node.property.name === 'activeElement'
  );
}

function isDocument(node) {
  return node.type === 'Identifier' && node.name === 'document';
}

export default plugin;
