/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Events that do not compose across shadow DOM boundaries. A listener attached only to a global
// target (e.g. window/document) will not observe these events when they are fired inside a shadow
// root, so getPropagationTargets must be used to also attach listeners to the relevant shadow roots.
const NON_COMPOSING_EVENTS = new Set([
  'scroll',
  'scrollend',
  'change',
  'submit',
  'reset',
  'select',
  'selectstart',
  'slotchange'
]);

const plugin = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow calling addEvent with a non-composing event unless the target is getPropagationTargets(...), since these events do not cross shadow DOM boundaries',
      recommended: true
    },
    schema: [],
    messages: {
      nonComposing:
        "The '{{event}}' event does not compose across shadow DOM boundaries. Pass getPropagationTargets(...) as the target to addEvent so listeners are attached to the relevant shadow roots too."
    }
  },
  create: context => {
    return {
      CallExpression(node) {
        // Match a call to a function named `addEvent`.
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'addEvent') {
          return;
        }

        // Second argument is the event type. Only statically-known string literals can be checked.
        const eventArg = node.arguments[1];
        if (
          !eventArg ||
          eventArg.type !== 'Literal' ||
          typeof eventArg.value !== 'string' ||
          !NON_COMPOSING_EVENTS.has(eventArg.value)
        ) {
          return;
        }

        // First argument is the target. It's fine if it is a getPropagationTargets(...) call.
        let targetArg = node.arguments[0];
        if (targetArg && targetArg.type === 'ChainExpression') {
          targetArg = targetArg.expression;
        }
        if (
          targetArg &&
          targetArg.type === 'CallExpression' &&
          targetArg.callee.type === 'Identifier' &&
          targetArg.callee.name === 'getPropagationTargets'
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'nonComposing',
          data: {event: eventArg.value}
        });
      }
    };
  }
};

export default plugin;
