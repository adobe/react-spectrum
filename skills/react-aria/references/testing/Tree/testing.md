# Testing 

Tree

## General setup

Tree supports long press interactions on its rows in certain configurations. See the following sections on how to handle these behaviors in your tests.

* [Timers](../testing.md#timers)
* [Long press](../testing.md#simulating-long-press)

## Test utils

`@react-aria/test-utils` offers common tree interaction testing utilities. Install it with your preferred package manager.

```bash
npm install @react-aria/test-utils --dev
```

<InlineAlert variant="notice">
  <Heading>Requirements</Heading>
  <Content>Please note that this library uses [@testing-library/react@16](https://www.npmjs.com/package/@testing-library/react) and [@testing-library/user-event@14](https://www.npmjs.com/package/@testing-library/user-event). This means that you need to be on React 18+ in order for these utilities to work.</Content>
</InlineAlert>

Initialize a `User` object at the top of your test file, and use it to create a `Tree` pattern tester in your test cases. The tester has methods that you can call within your test to query for specific subcomponents or simulate common interactions.

```ts
// Tree.test.ts
import {render, within} from '@testing-library/react';
import {User} from '@react-aria/test-utils';

let testUtilUser = new User({
  interactionType: 'mouse'
});
// ...

it('Tree can select and expand an item via keyboard', async function () {
  // Render your test component/app and initialize the Tree tester
  let {getByTestId} = render(
    <Tree data-testid="test-tree" selectionMode="multiple">
      ...
    </Tree>
  );
  let treeTester = testUtilUser.createTester('Tree', {root: getByTestId('test-tree'), interactionType: 'keyboard'});

  await treeTester.toggleRowSelection({row: 0});
  expect(treeTester.selectedRows).toHaveLength(1);
  expect(within(treeTester.rows[0]).getByRole('checkbox')).toBeChecked();

  await treeTester.toggleRowSelection({row: 1});
  expect(treeTester.selectedRows).toHaveLength(2);
  expect(within(treeTester.rows[1]).getByRole('checkbox')).toBeChecked();

  await treeTester.toggleRowSelection({row: 0});
  expect(treeTester.selectedRows).toHaveLength(1);
  expect(within(treeTester.rows[0]).getByRole('checkbox')).not.toBeChecked();

  await treeTester.toggleRowExpansion({index: 0});
  expect(treeTester.rows[0]).toHaveAttribute('aria-expanded', 'true');
});
```

## A

PI

### User

### Tree

Tester

## Testing 

FAQ

<PatternTestingFAQ patternName="tree"/>
