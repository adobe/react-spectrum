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
    fixable: 'code'
  },
  create: (context) => ({
    /**
     * expect(() => tree.getByRole('separator')).toThrow();
     */
    // eslint-disable-next-line quotes
    [`CallExpression[callee.property.name='getByRole'][parent.parent.callee.name='expect'][parent.parent.parent.property.name=/toThrow/]`](
      node
    ) {
      context.report({
        node: node.parent,
        message: 'Use queryByRole and toBeNull instead getByRole which takes a long time to generate an error message.',
        fix: (fixer) => [
          fixer.removeRange([node.parent.range[0], node.range[0]]),
          fixer.replaceText(
            node.callee.property,
            'queryByRole'
          ),
          fixer.replaceText(node.parent.parent.parent.property, 'toBeNull')
        ]
      });
    },

    /**
     * expect(() => getByRole('separator')).toThrow();
     */
    // eslint-disable-next-line quotes
    [`CallExpression[callee.name='getByRole'][parent.parent.callee.name='expect'][parent.parent.parent.property.name=/toThrow/]`](
      node
    ) {
      context.report({
        node: node.parent,
        message: 'Use queryByRole and toBeNull instead getByRole which takes a long time to generate an error message.'
        // can't fix this one as easily because the getByRole function is defined elsewhere
      });
    },

    /**
     * expect(() => {tree.getByRole('separator')}).toThrow();
     */
    // eslint-disable-next-line quotes
    [`CallExpression[callee.property.name='getByRole'][parent.parent.parent.parent.callee.name='expect'][parent.parent.parent.parent.parent.property.name=/toThrow/]`](
      node
    ) {
      context.report({
        node: node.parent,
        message: 'Use queryByRole and toBeNull instead getByRole which takes a long time to generate an error message.',
        fix: (fixer) => [
          fixer.removeRange([node.range[1], node.parent.parent.parent.range[1]]),
          fixer.removeRange([node.parent.parent.parent.range[0], node.range[0]]),
          fixer.replaceText(
            node.callee.property,
            'queryByRole'
          ),
          fixer.replaceText(node.parent.parent.parent.parent.parent.property, 'toBeNull')
        ]
      });
    },

    /**
     * expect(() => {getByRole('separator')}).toThrow();
     */
    // eslint-disable-next-line quotes
    [`CallExpression[callee.name='getByRole'][parent.parent.parent.parent.callee.name='expect'][parent.parent.parent.parent.parent.property.name=/toThrow/]`](
      node
    ) {
      context.report({
        node: node.parent,
        message: 'Use queryByRole and toBeNull instead getByRole which takes a long time to generate an error message.'
        // can't fix this one as easily because the getByRole function is defined elsewhere
      });
    }
  })
};

export default plugin;
