const rule = {
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

module.exports = rule;
