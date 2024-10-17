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

import path from 'path';

function inTestcaseWithoutAct(context, node, actLocalName) {
  let foundAct = false;
  for (let n of context.sourceCode.getAncestors(node).reverse()) {
    if (
      n.type === 'ArrowFunctionExpression' ||
      n.type === 'FunctionExpression'
    ) {
      let {parent} = n;
      if (
        parent.type === 'CallExpression' &&
        parent.callee.type === 'Identifier' &&
        parent.callee.name === actLocalName
      ) {
        foundAct = true;
      }
      if (
        parent.type === 'CallExpression' &&
        parent.callee.type === 'Identifier' &&
        parent.callee.name === 'it'
      ) {
        return !foundAct;
      }
      if (
        parent.type === 'CallExpression' &&
        parent.callee.type === 'TaggedTemplateExpression' &&
        parent.callee.tag.type === 'MemberExpression' &&
        parent.callee.tag.object.type === 'Identifier' &&
        parent.callee.tag.object.name === 'it' &&
        parent.callee.tag.property.type === 'Identifier' &&
        parent.callee.tag.property.name === 'each'
      ) {
        return !foundAct;
      }
    }
  }
  return false;
}

function report(node, context, actLocalName) {
  context.report({
    node,
    message: 'Should be wrapped in an act() call',
    fix(fixer) {
      let parent = context.sourceCode.getAncestors(node);
      parent = parent[parent.length - 1];
      let source = context
        .sourceCode
        .getText().slice(parent.range[0], parent.range[1]);
      return fixer.replaceTextRange(parent.range, `${actLocalName}(() => {${source}});`);
    }
  });
}

const JEST_TIMER_FUNCTIONS = [
  'runAllImmediates',
  'runAllTicks',
  'runAllTimers',
  'runOnlyPendingTimers',
  'runTimersToTime',
  'advanceTimersByTime',
  'advanceTimersToNextTimer'
];

let plugin = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Recommend using act wrappers when firing events',
      recommended: false
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    ]
  },
  create(context) {
    if (context.getFilename().includes(path.sep + 'test' + path.sep)) {
      let actLocalName = 'act';
      return {
        ImportSpecifier(node) {
          let {parent} = node;
          if (
            parent.importKind === 'value' &&
            parent.source &&
            parent.source.type === 'Literal' &&
            parent.source.value === '@testing-library/react' &&
            node.imported.type === 'Identifier' &&
            node.imported.name === 'act'
          ) {
            actLocalName = node.local.name;
          }
        },
        CallExpression(node) {
          if (
            node.callee.type === 'MemberExpression' &&
            actLocalName &&
            inTestcaseWithoutAct(context, node, actLocalName)
          ) {
            if (
              node.arguments.length === 0 &&
              node.callee.property.type === 'Identifier' &&
              (node.callee.property.name === 'focus' ||
                node.callee.property.name === 'blur')
            ) {
              report(node, context, actLocalName);
            } else if (
              node.callee.object.type === 'Identifier' &&
              node.callee.object.name === 'jest' &&
              node.callee.property.type === 'Identifier' &&
              JEST_TIMER_FUNCTIONS.includes(node.callee.property.name)
            ) {
              report(node, context, actLocalName);
            }
          }
        }
      };
    } else {
      return {};
    }
  }
};

export default plugin;
