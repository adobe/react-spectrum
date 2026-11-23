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

const DOM_FUNCTIONS = 'react-aria/private/utils/shadowdom/DOMFunctions';

const plugin = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow using document.activeElement in favor of getActiveElement() for shadow DOM compatibility',
      recommended: true
    },
    fixable: 'code',
    messages: {
      useGetActiveElement:
        'Use getActiveElement() instead of document.activeElement for shadow DOM compatibility.'
    }
  },
  create: context => {
    let hasGetActiveElementImport = false;
    let getActiveElementLocalName = 'getActiveElement';
    let existingDOMFunctionsImport = null;

    return {
      // Track imports from DOMFunctions, and from the legacy @react-aria/utils package
      ImportDeclaration(node) {
        if (
          node.source &&
          node.source.type === 'Literal' &&
          (node.source.value === DOM_FUNCTIONS || node.source.value === '@react-aria/utils')
        ) {
          if (node.source.value === DOM_FUNCTIONS) {
            existingDOMFunctionsImport = node;
          }
          // Check if getActiveElement is already imported
          const hasGetActiveElement = node.specifiers.some(
            spec =>
              spec.type === 'ImportSpecifier' &&
              spec.imported.type === 'Identifier' &&
              spec.imported.name === 'getActiveElement'
          );
          if (hasGetActiveElement) {
            hasGetActiveElementImport = true;
            const getActiveElementSpec = node.specifiers.find(
              spec =>
                spec.type === 'ImportSpecifier' &&
                spec.imported.type === 'Identifier' &&
                spec.imported.name === 'getActiveElement'
            );
            getActiveElementLocalName = getActiveElementSpec.local.name;
          }
        }
      },

      // Detect document.activeElement usage
      ["MemberExpression[object.name='document'][property.name='activeElement']"](node) {
        context.report({
          node,
          messageId: 'useGetActiveElement',
          fix: fixer => {
            const fixes = [];
            const sourceCode = context.sourceCode;

            // Replace document.activeElement with getActiveElement()
            fixes.push(fixer.replaceText(node, `${getActiveElementLocalName}()`));

            // Add import if not present
            if (!hasGetActiveElementImport) {
              if (existingDOMFunctionsImport) {
                // Add getActiveElement to existing DOMFunctions import
                const specifiers = existingDOMFunctionsImport.specifiers;
                if (specifiers.length > 0) {
                  fixes.push(
                    fixer.insertTextAfter(
                      sourceCode.getFirstToken(
                        existingDOMFunctionsImport,
                        token => token.value === '{'
                      ),
                      'getActiveElement, '
                    )
                  );
                }
              } else {
                // No existing import from DOMFunctions, create a new one
                const programNode = context.sourceCode.ast;
                const imports = programNode.body.filter(node => node.type === 'ImportDeclaration');

                if (imports.length > 0) {
                  const lastImport = imports[imports.length - 1];
                  const importStatement = `\nimport {getActiveElement} from '${DOM_FUNCTIONS}';`;
                  fixes.push(fixer.insertTextAfter(lastImport, importStatement));
                } else {
                  // No imports, add at the beginning
                  const importStatement = `import {getActiveElement} from '${DOM_FUNCTIONS}';\n`;
                  fixes.push(fixer.insertTextBefore(programNode.body[0], importStatement));
                }
              }

              // Mark as imported for subsequent fixes in the same file
              hasGetActiveElementImport = true;
            }

            return fixes;
          }
        });
      }
    };
  }
};

export default plugin;
