# @react-aria/test-utils

This package is part of [react-spectrum](https://github.com/adobe/react-spectrum). See the repo for more details.

See the [React Aria testing docs](https://react-aria.adobe.com/testing#react-aria-test-utils) for usage.

`@react-aria/test-utils` is a set of testing utilities that aims to make writing unit tests easier for consumers of React Aria or for users who have built their own components following the respective ARIA pattern specification.

> **Requirements:** This library uses [@testing-library/dom@10](https://www.npmjs.com/package/@testing-library/dom) and [@testing-library/user-event@14](https://www.npmjs.com/package/@testing-library/user-event). You need to be on React 18+ for these utilities to work.

## Installation

```
npm install @react-aria/test-utils --dev
```

## Setup

Initialize a `User` object at the top of your test file, and use it to create an ARIA pattern tester in your test cases. The tester has methods that you can call within your test to query for specific subcomponents or simulate common interactions.

```ts
// YourTest.test.ts
import {screen} from '@testing-library/react';
import {User} from '@react-aria/test-utils';

// Provide whatever method of advancing timers you use in your test, this example assumes Jest with fake timers.
// 'interactionType' specifies what mode of interaction should be simulated by the tester
// 'advanceTimer' is used by the tester to advance the timers in the tests for specific interactions (e.g. long press)
let testUtilUser = new User({interactionType: 'mouse', advanceTimer: jest.advanceTimersByTime});
// ...

it('my test case', async function () {
  // Render your test component/app
  render();
  // Initialize the table tester via providing the 'Table' pattern name and the root element of said table
  let table = testUtilUser.createTester('Table', {root: screen.getByTestId('test_table')});

  // ...
});
```

## User API

```ts
class User {
  constructor(opts?: {
    interactionType?: 'mouse' | 'keyboard' | 'touch',
    advanceTimer?: (time?: number) => void | Promise<unknown>
  });

  createTester(patternName, opts): PatternTester;
}
```

- `interactionType` — default modality used by testers created from this `User`. Individual testers can override this via `setInteractionType` or per-method options.
- `advanceTimer` — used by testers to advance timers for interactions like long press. Pass `jest.advanceTimersByTime` (or your test framework's equivalent) when using fake timers.
- `createTester(patternName, opts)` — returns a tester for the given ARIA pattern. `opts.root` is the root element of the component under test.

## Patterns

Below is a list of the ARIA patterns supported by `createTester`. See the accompanying component testing docs pages on the [React Aria docs site](https://react-aria.adobe.com/testing#react-aria-test-utils) for sample usage of each tester in a test suite.

- [CheckboxGroup](https://react-aria.adobe.com/CheckboxGroup/testing)
- [ComboBox](https://react-aria.adobe.com/ComboBox/testing)
- [GridList](https://react-aria.adobe.com/GridList/testing)
- [ListBox](https://react-aria.adobe.com/ListBox/testing)
- [Menu](https://react-aria.adobe.com/Menu/testing)
- [RadioGroup](https://react-aria.adobe.com/RadioGroup/testing)
- [Select](https://react-aria.adobe.com/Select/testing)
- [Table](https://react-aria.adobe.com/Table/testing)
- [Tabs](https://react-aria.adobe.com/Tabs/testing)
- [Tree](https://react-aria.adobe.com/Tree/testing)
