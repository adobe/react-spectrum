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
      description: 'Disallow using event.target in favor of getEventTarget for shadow DOM compatibility',
      recommended: true
    },
    fixable: 'code',
    messages: {
      useGetEventTarget: 'Use getEventTarget() instead of .target for shadow DOM compatibility.',
      unnecessaryNativeEvent: 'getEventTarget() already handles nativeEvent unwrapping. Pass the event directly.'
    }
  },
  create: (context) => {
    let hasGetEventTargetImport = false;
    let getEventTargetLocalName = 'getEventTarget';
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
          // Check if getEventTarget is already imported
          const hasGetEventTarget = node.specifiers.some(
            spec => spec.type === 'ImportSpecifier' &&
                    spec.imported.type === 'Identifier' &&
                    spec.imported.name === 'getEventTarget'
          );
          if (hasGetEventTarget) {
            hasGetEventTargetImport = true;
            const getEventTargetSpec = node.specifiers.find(
              spec => spec.type === 'ImportSpecifier' &&
                      spec.imported.type === 'Identifier' &&
                      spec.imported.name === 'getEventTarget'
            );
            getEventTargetLocalName = getEventTargetSpec.local.name;
          }
        }
      },

      // Detect getEventTarget(event.nativeEvent) calls
      CallExpression(node) {
        // Check if this is a getEventTarget call
        if (node.callee.type !== 'Identifier' || node.callee.name !== getEventTargetLocalName) {
          return;
        }

        // Check if it has exactly one argument
        if (node.arguments.length !== 1) {
          return;
        }

        const arg = node.arguments[0];

        // Check if the argument is event.nativeEvent
        if (arg.type === 'MemberExpression' &&
            arg.property.type === 'Identifier' &&
            arg.property.name === 'nativeEvent' &&
            arg.object.type === 'Identifier') {
          
          // Only match common event parameter names
          const commonEventNames = /^(e|event|evt)$/i;
          if (!commonEventNames.test(arg.object.name)) {
            return;
          }

          context.report({
            node,
            messageId: 'unnecessaryNativeEvent',
            fix: (fixer) => {
              const sourceCode = context.sourceCode;
              // Get the event object without .nativeEvent (e.g., 'event' from 'event.nativeEvent')
              const eventText = sourceCode.getText(arg.object);
              // Replace the entire argument with just the event
              return fixer.replaceText(arg, eventText);
            }
          });
        }
      },

      // Detect .target property access
      ['MemberExpression[property.name=\'target\']'](node) {
        // Skip if it's already a getEventTarget call result
        if (node.object.type === 'CallExpression' &&
            node.object.callee.type === 'Identifier' &&
            node.object.callee.name === getEventTargetLocalName) {
          return;
        }

        // Only match common event parameter names
        const commonEventNames = /^(e|event|evt)$/i;
        let isEventTarget = false;

        if (node.object.type === 'Identifier') {
          // Check if the identifier matches common event names (e.target, event.target, evt.target)
          isEventTarget = commonEventNames.test(node.object.name);
        }

        // Skip if this doesn't look like an event target access
        if (!isEventTarget) {
          return;
        }

        // Skip if we're inside a press or drag/drop event handler
        // These handlers use custom event types that don't extend DOM Events
        let currentNode = node;
        while (currentNode) {
          if (currentNode.type === 'FunctionDeclaration' || 
              currentNode.type === 'FunctionExpression' ||
              currentNode.type === 'ArrowFunctionExpression') {
            // Check if the function has a name that indicates it's a press or drag/drop handler
            let functionName = null;
            
            if (currentNode.type === 'FunctionDeclaration' && currentNode.id) {
              functionName = currentNode.id.name;
            } else if (currentNode.parent) {
              // Check if this is a named function expression or arrow function assigned to a variable
              if (currentNode.parent.type === 'VariableDeclarator' && currentNode.parent.id) {
                functionName = currentNode.parent.id.name;
              } else if (currentNode.parent.type === 'Property' && currentNode.parent.key) {
                functionName = currentNode.parent.key.name || currentNode.parent.key.value;
              } else if (currentNode.parent.type === 'AssignmentExpression' && 
                         currentNode.parent.left.type === 'Identifier') {
                functionName = currentNode.parent.left.name;
              }
            }
            
            // Check if the function name indicates it's a press or drag/drop handler
            // Press handlers: onPress, onPressStart, onPressEnd, onPressUp, onPressChange, handlePress, etc.
            // Drag/drop handlers: onDrag, onDrop, onDropActivate, onDropEnter, onDropExit, onDragStart, onDragEnd, etc.
            if (functionName && /(press|drag|drop)/i.test(functionName)) {
              return;
            }
          }
          currentNode = currentNode.parent;
        }

        context.report({
          node,
          messageId: 'useGetEventTarget',
          fix: (fixer) => {
            const fixes = [];
            const sourceCode = context.sourceCode;

            // Get the event object (e.g., 'event' from 'event.target')
            const eventText = sourceCode.getText(node.object);

            // Replace event.target with getEventTarget(event)
            fixes.push(fixer.replaceText(node, `${getEventTargetLocalName}(${eventText})`));

            // Add import if not present
            if (!hasGetEventTargetImport) {
              if (existingReactAriaUtilsImport) {
                // Add getEventTarget to existing @react-aria/utils import
                const specifiers = existingReactAriaUtilsImport.specifiers;
                if (specifiers.length > 0) {
                  fixes.push(fixer.insertTextAfter(
                    sourceCode.getFirstToken(existingReactAriaUtilsImport, token => token.value === '{'),
                    'getEventTarget, '
                  ));
                }
              } else {
                // No existing import from @react-aria/utils, create a new one
                const programNode = context.sourceCode.ast;
                const imports = programNode.body.filter(node => node.type === 'ImportDeclaration');

                if (imports.length > 0) {
                  const lastImport = imports[imports.length - 1];
                  const importStatement = '\nimport {getEventTarget} from \'@react-aria/utils\';';
                  fixes.push(fixer.insertTextAfter(lastImport, importStatement));
                } else {
                  // No imports, add at the beginning
                  const importStatement = 'import {getEventTarget} from \'@react-aria/utils\';\n';
                  fixes.push(fixer.insertTextBefore(programNode.body[0], importStatement));
                }
              }

              // Mark as imported for subsequent fixes in the same file
              hasGetEventTargetImport = true;
            }

            return fixes;
          }
        });
      }
    };
  }
};

export default plugin;
