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
      description: 'Disallow using element.contains in favor of nodeContains for shadow DOM compatibility',
      recommended: true
    },
    fixable: 'code',
    messages: {
      useNodeContains: 'Use nodeContains() instead of .contains() for shadow DOM compatibility.'
    }
  },
  create: (context) => {
    let hasNodeContainsImport = false;
    let nodeContainsLocalName = 'nodeContains';
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
          // Check if nodeContains is already imported
          const hasNodeContains = node.specifiers.some(
            spec => spec.type === 'ImportSpecifier' &&
                    spec.imported.type === 'Identifier' &&
                    spec.imported.name === 'nodeContains'
          );
          if (hasNodeContains) {
            hasNodeContainsImport = true;
            const nodeContainsSpec = node.specifiers.find(
              spec => spec.type === 'ImportSpecifier' &&
                      spec.imported.type === 'Identifier' &&
                      spec.imported.name === 'nodeContains'
            );
            nodeContainsLocalName = nodeContainsSpec.local.name;
          }
        }
      },

      // Detect .contains() method calls
      ['CallExpression[callee.type=\'MemberExpression\'][callee.property.name=\'contains\']'](node) {
        context.report({
          node,
          messageId: 'useNodeContains',
          fix: (fixer) => {
            const fixes = [];
            const sourceCode = context.sourceCode;

            // Get the object (e.g., 'element' from 'element.contains(other)')
            const objectText = sourceCode.getText(node.callee.object);

            // Get the arguments
            const argsText = node.arguments.map(arg => sourceCode.getText(arg)).join(', ');

            // Replace element.contains(other) with nodeContains(element, other)
            fixes.push(fixer.replaceText(node, `${nodeContainsLocalName}(${objectText}, ${argsText})`));

            // Add import if not present
            if (!hasNodeContainsImport) {
              if (existingReactAriaUtilsImport) {
                // Add nodeContains to existing @react-aria/utils import
                const specifiers = existingReactAriaUtilsImport.specifiers;
                if (specifiers.length > 0) {
                  fixes.push(fixer.insertTextAfter(
                    sourceCode.getFirstToken(existingReactAriaUtilsImport, token => token.value === '{'),
                    'nodeContains, '
                  ));
                }
              } else {
                // No existing import from @react-aria/utils, create a new one
                const programNode = context.sourceCode.ast;
                const imports = programNode.body.filter(node => node.type === 'ImportDeclaration');

                if (imports.length > 0) {
                  const lastImport = imports[imports.length - 1];
                  const importStatement = '\nimport {nodeContains} from \'@react-aria/utils\';';
                  fixes.push(fixer.insertTextAfter(lastImport, importStatement));
                } else {
                  // No imports, add at the beginning
                  const importStatement = 'import {nodeContains} from \'@react-aria/utils\';\n';
                  fixes.push(fixer.insertTextBefore(programNode.body[0], importStatement));
                }
              }

              // Mark as imported for subsequent fixes in the same file
              hasNodeContainsImport = true;
            }

            return fixes;
          }
        });
      }
    };
  }
};

export default plugin;
