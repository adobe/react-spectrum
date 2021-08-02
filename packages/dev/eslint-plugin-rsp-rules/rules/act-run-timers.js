
/* We don't check any of the pattern
 * await act(async () => {
 *   ...
 *   jest.runAllTimers();
 * }
 * because this is actually a pattern we need to use in React 18 and besides
 * if you don't do `act` correctly, the test just won't pass at all
 */
/**
 * Disabling this rule set for now, it was useful, but now there are possibly times when it needs
 * be broken, i haven't looked into it enough and won't have time this time around
 */

const rule = {
  create: (context) => ({
    /**
     * act(() => {
     *   ...
     *   jest.runAllTimers();
     * });
     */
    // eslint-disable-next-line quotes
    [`CallExpression[callee.property.name='runAllTimers'][parent.parent.type="BlockStatement"][parent.parent.body.length>1]`](
      node
    ) {
      context.report({
        node: node.parent,
        message: 'Jest runAllTimers usually results in state updates, make sure everything is flushed before running. This is generally easiest to do by keeping runAllTimers in its own `act`.',
        fix: (fixer) => [
          fixer.insertTextAfter(node.parent.parent.parent.parent.parent, '\nact(() => {jest.runAllTimers();});'),
          fixer.removeRange([node.parent.range[0], node.parent.range[1] + 1]) // remove trailing newline as well
        ]
      });
    },

    /**
     * act(() => {
     *   ...
     *   jest.advanceTimersByTime(50 + 3*60);
     * });
     */
    // eslint-disable-next-line quotes
    [`CallExpression[callee.property.name='advanceTimersByTime'][parent.parent.type="BlockStatement"][parent.parent.body.length>1]`](
      node
    ) {
      context.report({
        node: node.parent,
        message: 'Jest advanceTimersByTime usually results in state updates, make sure everything is flushed before running. This is generally easiest to do by keeping advanceTimersByTime in its own `act`.',
        fix: (fixer) => [
          fixer.insertTextAfter(
            node.parent.parent.parent.parent.parent,
            `\nact(() => {jest.advanceTimersByTime(${node.arguments.map(node => context.getSourceCode().getText(node)).join(', ')});});`
          ),
          fixer.removeRange([node.parent.range[0], node.parent.range[1] + 1]) // remove trailing newline as well
        ]
      });
    },

    /**
     * act(() => {
     *   ...
     *   jest.runOnlyPendingTimers();
     * });
     */
    // eslint-disable-next-line quotes
    [`CallExpression[callee.property.name='runOnlyPendingTimers'][parent.parent.type="BlockStatement"][parent.parent.body.length>1]`](
      node
    ) {
      context.report({
        node: node.parent,
        message: 'Jest runOnlyPendingTimers usually results in state updates, make sure everything is flushed before running. This is generally easiest to do by keeping runOnlyPendingTimers in its own `act`.',
        fix: (fixer) => [
          fixer.insertTextAfter(node.parent.parent.parent.parent.parent, '\nact(() => {jest.runOnlyPendingTimers();});'),
          fixer.removeRange([node.parent.range[0], node.parent.range[1] + 1]) // remove trailing newline as well
        ]
      });
    }
  })
};

module.exports = rule;
