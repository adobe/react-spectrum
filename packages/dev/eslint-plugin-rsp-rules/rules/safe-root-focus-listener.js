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

const FOCUS_EVENT_NAMES = new Set(['blur', 'focus', 'focusin', 'focusout']);
const DISALLOWED_TARGETS = new Set(['window', 'document']);

const plugin = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow attaching focus-related listeners (blur, focus, focusin, focusout) to the window or document object. This will not work in shadow DOM as focus and blur do not bubble past the shadow boundary.',
      recommended: true
    },
    schema: [],
    messages: {
      noRootFocusListener: 'Do not attach focus listeners (blur, focus, focusin, focusout) to window or document. Use a root element instead for shadow DOM compatibility.'
    }
  },
  create: (context) => {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') {
          return;
        }
        const {object, property} = node.callee;
        if (object.type !== 'Identifier' || !DISALLOWED_TARGETS.has(object.name)) {
          return;
        }
        if (property.type !== 'Identifier') {
          return;
        }
        const method = property.name;
        if (method !== 'addEventListener' && method !== 'removeEventListener') {
          return;
        }
        if (node.arguments.length === 0) {
          return;
        }
        const eventNameArg = node.arguments[0];
        const eventName = eventNameArg.type === 'Literal' && typeof eventNameArg.value === 'string'
          ? eventNameArg.value
          : null;
        if (eventName == null || !FOCUS_EVENT_NAMES.has(eventName)) {
          return;
        }
        context.report({
          node,
          messageId: 'noRootFocusListener'
        });
      }
    };
  }
};

export default plugin;
