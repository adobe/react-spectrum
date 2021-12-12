/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const rule = {
  create: (context) => ({
    CallExpression: function (node) {
      if (node?.callee?.object?.name === 'userEvent' && node?.callee?.property?.name === 'tab') {
        let foundAct = false;
        let visited = new Set();
        let parent = node?.parent;
        while (!foundAct && parent && !visited.has(parent)) {
          visited.add(parent);
          if (parent?.type === 'CallExpression' && (parent?.callee?.name === 'act' || parent?.callee?.name === 'actDOM')) {
            foundAct = true;
            break;
          }
          parent = parent?.parent;
        }
        if (!foundAct) {
          context.report({
            node: node.parent,
            message: 'userEvent.tab must be wrapped in an act or actDOM.',
            fix: (fixer) => [
              fixer.insertTextBefore(node.parent, 'act(() => {\n'),
              fixer.insertTextAfter(node.parent, '\n});')
            ]
          });
        }
      }
      if (node?.callee?.property?.name === 'focus' || node?.callee?.property?.name === 'blur') {
        let foundAct = false;
        let visited = new Set();
        let parent = node?.parent;
        while (!foundAct && parent && !visited.has(parent)) {
          visited.add(parent);
          if (parent?.type === 'CallExpression' && (parent?.callee?.name === 'act' || parent?.callee?.name === 'actDOM')) {
            foundAct = true;
            break;
          }
          parent = parent?.parent;
        }
        if (!foundAct) {
          context.report({
            node: node.parent,
            message: 'Focus and blur must be wrapped in an act or actDOM',
            fix: (fixer) => [
              fixer.insertTextBefore(node.parent, 'act(() => {\n'),
              fixer.insertTextAfter(node.parent, '\n});')
            ]
          });
        }
      }
      if (node?.callee?.property?.name === 'runAllTimers' || node?.callee?.property?.name === 'advanceTimersByTime' || node?.callee?.property?.name === 'runOnlyPendingTimers') {
        let foundAct = false;
        let visited = new Set();
        let parent = node?.parent;
        while (!foundAct && parent && !visited.has(parent)) {
          visited.add(parent);
          if (parent?.type === 'CallExpression' && (parent?.callee?.name === 'act' || parent?.callee?.name === 'actDOM')) {
            foundAct = true;
            break;
          }
          parent = parent?.parent;
        }
        if (!foundAct) {
          context.report({
            node: node.parent,
            message: 'All timer advancing must be wrapped in an act or actDOM',
            fix: (fixer) => [
              fixer.insertTextBefore(node.parent, 'act(() => {\n'),
              fixer.insertTextAfter(node.parent, '\n});')
            ]
          });
        }
      }
    }
  })
};

module.exports = rule;
