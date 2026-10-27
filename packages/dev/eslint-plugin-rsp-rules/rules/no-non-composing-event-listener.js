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

// Events that do not compose across shadow DOM boundaries. A listener attached with
// addEventListener will not observe these events when they are fired inside a shadow root the
// listener's target does not contain, so addEvent(getPropagationTargets(...)) should be used instead
// to also attach listeners to the relevant shadow roots.
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

// Receivers that are not part of the shadow DOM tree, so getPropagationTargets does not apply to them
// (e.g. visualViewport, or a MediaQueryList returned from matchMedia). Matched by common local names.
const EXEMPT_RECEIVER_NAMES = new Set(['visualViewport', 'mq', 'm']);

const plugin = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow addEventListener with a non-composing event, since these events do not cross shadow DOM boundaries; use addEvent(getPropagationTargets(...)) instead',
      recommended: true
    },
    schema: [],
    messages: {
      nonComposing:
        "The '{{event}}' event does not compose across shadow DOM boundaries. Use addEvent(getPropagationTargets(...)) from @react-aria/utils instead of addEventListener so listeners are attached to the relevant shadow roots too."
    }
  },
  create: context => {
    return {
      CallExpression(node) {
        // Match `<receiver>.addEventListener(...)`.
        const callee = node.callee;
        if (
          callee.type !== 'MemberExpression' ||
          callee.computed ||
          callee.property.type !== 'Identifier' ||
          callee.property.name !== 'addEventListener'
        ) {
          return;
        }

        // First argument is the event type. Only statically-known string literals can be checked.
        const eventArg = node.arguments[0];
        if (
          !eventArg ||
          eventArg.type !== 'Literal' ||
          typeof eventArg.value !== 'string' ||
          !NON_COMPOSING_EVENTS.has(eventArg.value)
        ) {
          return;
        }

        // Exempt receivers that are not part of the shadow DOM tree (visualViewport, MediaQueryList).
        let receiver = callee.object;
        if (receiver.type === 'ChainExpression') {
          receiver = receiver.expression;
        }
        if (receiver.type === 'Identifier' && EXEMPT_RECEIVER_NAMES.has(receiver.name)) {
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
