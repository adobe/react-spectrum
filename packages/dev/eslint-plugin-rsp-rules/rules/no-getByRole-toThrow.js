const rule = {
  create: (context) => ({
    // eslint-disable-next-line
    [`CallExpression[callee.property.name='getByRole'][parent.parent.callee.name='expect'][parent.parent.parent.property.name=/toThrow/]`](
      node
    ) {
      context.report({
        node: node.parent,
        message: 'Use queryByRole and toBeNull instead getByRole which takes a long time to generate an error message.',
        fix: (fixer) => [
          fixer.removeRange([node.parent.start, node.start]),
          fixer.replaceText(
            node.callee.property,
            'queryByRole'
          ),
          fixer.replaceText(node.parent.parent.parent.property, 'toBeNull')
        ]
      });
    }
  })
};

module.exports = rule;
