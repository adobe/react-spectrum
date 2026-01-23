# Testing 

GridList

## General setup

GridList supports long press interactions on its items in certain configurations. See the following sections on how to handle these behaviors in your tests.

* [Timers](../testing.md#timers)
* [Long press](../testing.md#simulating-long-press)

## Test utils

`@react-aria/test-utils` offers common gridlist interaction testing utilities. Install it with your preferred package manager.

```bash
npm install @react-aria/test-utils --dev
```

<InlineAlert variant="notice">
  <Heading>Requirements</Heading>
  <Content>Please note that this library uses [@testing-library/react@16](https://www.npmjs.com/package/@testing-library/react) and [@testing-library/user-event@14](https://www.npmjs.com/package/@testing-library/user-event). This means that you need to be on React 18+ in order for these utilities to work.</Content>
</InlineAlert>

Initialize a `User` object at the top of your test file, and use it to create a `GridList` pattern tester in your test cases. The tester has methods that you can call within your test to query for specific subcomponents or simulate common interactions.

```ts
// GridList.test.ts
import {render, within} from '@testing-library/react';
import {User} from '@react-aria/test-utils';

let testUtilUser = new User({
  interactionType: 'mouse'
});
// ...

it('GridList can select a row via keyboard', async function () {
  // Render your test component/app and initialize the gridlist tester
  let {getByTestId} = render(
    <GridList data-testid="test-gridlist" selectionMode="single">
      ...
    </GridList>
  );
  let gridListTester = testUtilUser.createTester('GridList', {root: getByTestId('test-gridlist'), interactionType: 'keyboard'});

  let row = gridListTester.rows[0];
  expect(within(row).getByRole('checkbox')).not.toBeChecked();
  expect(gridListTester.selectedRows).toHaveLength(0);

  await gridListTester.toggleRowSelection({row: 0});
  expect(within(row).getByRole('checkbox')).toBeChecked();
  expect(gridListTester.selectedRows).toHaveLength(1);

  await gridListTester.toggleRowSelection({row: 0});
  expect(within(row).getByRole('checkbox')).not.toBeChecked();
  expect(gridListTester.selectedRows).toHaveLength(0);
});
```

## A

PI

### User

### Grid

ListTester

## Testing 

FAQ

<PatternTestingFAQ patternName="gridlist"/>
