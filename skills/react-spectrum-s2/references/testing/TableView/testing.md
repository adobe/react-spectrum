# Testing 

TableView

## General setup

TableView supports long press interactions on its rows in certain configurations. See the following sections on how to handle these behaviors in your tests.

* [Timers](../testing.md#timers)
* [Long press](../testing.md#simulating-long-press)

## Test utils

`@react-spectrum/test-utils` offers common table interaction testing utilities. Install it with your preferred package manager.

```bash
npm install @react-spectrum/test-utils --dev
```

<InlineAlert variant="notice">
  <Heading>Requirements</Heading>
  <Content>Please note that this library uses [@testing-library/react@16](https://www.npmjs.com/package/@testing-library/react) and [@testing-library/user-event@14](https://www.npmjs.com/package/@testing-library/user-event). This means that you need to be on React 18+ in order for these utilities to work.</Content>
</InlineAlert>

Initialize a `User` object at the top of your test file, and use it to create a `TableView` pattern tester in your test cases. The tester has methods that you can call within your test to query for specific subcomponents or simulate common interactions.

```ts
// Table.test.ts
import {render, within} from '@testing-library/react';
import {User} from '@react-spectrum/test-utils';

let testUtilUser = new User({
  interactionType: 'mouse',
  advanceTimer: jest.advanceTimersByTime
});
// ...

it('TableView can toggle row selection', async function () {
  // Render your test component/app and initialize the table tester
  let {getByTestId} = render(
    <TableView data-testid="test-table" selectionMode="multiple">
    ...
    </TableView>
  );
  let tableTester = testUtilUser.createTester('Table', {root: getByTestId('test-table')});
  expect(tableTester.selectedRows).toHaveLength(0);

  await tableTester.toggleSelectAll();
  expect(tableTester.selectedRows).toHaveLength(10);

  await tableTester.toggleRowSelection({row: 2});
  expect(tableTester.selectedRows).toHaveLength(9);
  let checkbox = within(tableTester.rows[2]).getByRole('checkbox');
  expect(checkbox).not.toBeChecked();

  await tableTester.toggleSelectAll();
  expect(tableTester.selectedRows).toHaveLength(10);
  expect(checkbox).toBeChecked();

  await tableTester.toggleSelectAll();
  expect(tableTester.selectedRows).toHaveLength(0);
});
```

## A

PI

### User

### Table

Tester

## Testing 

FAQ

<PatternTestingFAQ patternName="table"/>
