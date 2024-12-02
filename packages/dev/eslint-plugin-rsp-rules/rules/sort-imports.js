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

const plugin = {
  meta: {
    fixable: 'code'
  },
  create: function (context) {
    const sourceCode = context.getSourceCode();

    /**
     * Gets the local name of the first imported module.
     * @param {ASTNode} node - the ImportDeclaration node.
     * @returns {?string} the local name of the first imported module.
     */
    function getFirstLocalMemberName(node) {
      if (node.type === 'ImportDeclaration' && node.specifiers[0]) {
        return node.specifiers[0].local.name.toLowerCase();
      }
      return null;
    }

    return {
      Program(node) {
        let lastImportDeclaration = null;
        node.body.forEach((statement, i) => {
          if (statement.type === 'ImportDeclaration') {
            const importSpecifiers = statement.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');
            const getSortableName = specifier => specifier.local.name.toLowerCase();
            const firstUnsortedIndex = importSpecifiers.map(getSortableName).findIndex((name, index, array) => array[index - 1] > name);

            if (firstUnsortedIndex !== -1) {
              context.report({
                node: importSpecifiers[firstUnsortedIndex],
                message: "Member '{{memberName}}' of the import declaration should be sorted alphabetically.",
                data: {memberName: importSpecifiers[firstUnsortedIndex].local.name},
                fix(fixer) {
                  return fixer.replaceTextRange(
                    [importSpecifiers[0].range[0], importSpecifiers[importSpecifiers.length - 1].range[1]],
                    importSpecifiers
                      // Clone the importSpecifiers array to avoid mutating it
                      .slice()

                      // Sort the array into the desired order
                      .sort((specifierA, specifierB) => {
                        const aName = getSortableName(specifierA);
                        const bName = getSortableName(specifierB);
                        return aName > bName ? 1 : -1;
                      })

                      // Build a string out of the sorted list of import specifiers and the text between the originals
                      .reduce((sourceText, specifier, index) => {
                        const textAfterSpecifier = index === importSpecifiers.length - 1
                          ? ''
                          : sourceCode.getText().slice(importSpecifiers[index].range[1], importSpecifiers[index + 1].range[0]);

                        return sourceText + sourceCode.getText(specifier) + textAfterSpecifier;
                      }, '')
                  );
                }
              });
            } else if (lastImportDeclaration) {
              let currentLocalMemberName = getFirstLocalMemberName(statement);
              let previousLocalMemberName = getFirstLocalMemberName(lastImportDeclaration);
              if (previousLocalMemberName &&
                currentLocalMemberName &&
                currentLocalMemberName < previousLocalMemberName
              ) {
                context.report({
                  node: statement,
                  message: 'Imports should be sorted alphabetically.',
                  fix(fixer) {
                    let allImports = [];
                    for (let statement of node.body) {
                      if (statement.type === 'ImportDeclaration') {
                        allImports.push(statement);
                      } else {
                        // Do not replace if there are other statements between imports.
                        break;
                      }
                    }

                    let sortedImports = allImports.slice().sort((a, b) => {
                      let aName = getFirstLocalMemberName(a);
                      let bName = getFirstLocalMemberName(b);
                      if (aName === bName) {
                        return 0;
                      }
                      return aName < bName ? -1 : 1;
                    });

                    return fixer.replaceTextRange(
                      [allImports[0].range[0], allImports[allImports.length - 1].range[1]],
                      sortedImports.reduce((sourceText, statement, index) => {
                        const textAfterStatement = index === allImports.length - 1
                          ? ''
                          : sourceCode.getText().slice(allImports[index].range[1], allImports[index + 1].range[0]);
                        return sourceText + sourceCode.getText(statement) + textAfterStatement;
                      }, '')
                    );
                  }
                });
              }
            }

            lastImportDeclaration = statement;
          }
        });
      }
    };
  }
};

export default plugin;
