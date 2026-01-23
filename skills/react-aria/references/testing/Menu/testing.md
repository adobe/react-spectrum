# Testing 

Menu

## General setup

Menu supports long press interactions in certain configurations. See the following sections on how to handle these behaviors in your tests.

* [Timers](../testing.md#timers)
* [Long press](../testing.md#simulating-long-press)

## Test utils

`@react-aria/test-utils` offers common menu interaction testing utilities. Install it with your preferred package manager.

```bash
npm install @react-aria/test-utils --dev
```

<InlineAlert variant="notice">
  <Heading>Requirements</Heading>
  <Content>Please note that this library uses [@testing-library/react@16](https://www.npmjs.com/package/@testing-library/react) and [@testing-library/user-event@14](https://www.npmjs.com/package/@testing-library/user-event). This means that you need to be on React 18+ in order for these utilities to work.</Content>
</InlineAlert>

Initialize a `User` object at the top of your test file, and use it to create a `Menu` pattern tester in your test cases. The tester has methods that you can call within your test to query for specific subcomponents or simulate common interactions.

```ts
// Menu.test.ts
import {render} from '@testing-library/react';
import {User} from '@react-aria/test-utils';

let testUtilUser = new User({
  interactionType: 'mouse'
});
// ...

it('Menu can open its submenu via keyboard', async function () {
  // Render your test component/app and initialize the menu tester
  let {getByTestId} = render(
    <MenuTrigger>
      <Button data-testid="test-menutrigger">Menu trigger</Button>
      ...
    </MenuTrigger>
  );
  let menuTester = testUtilUser.createTester('Menu', {root: getByTestId('test-menutrigger'), interactionType: 'keyboard'});

  await menuTester.open();
  expect(menuTester.menu).toBeInTheDocument();
  let submenuTriggers = menuTester.submenuTriggers;
  expect(submenuTriggers).toHaveLength(1);

  let submenuTester = await menuTester.openSubmenu({submenuTrigger: 'Share…'});
  expect(submenuTester.menu).toBeInTheDocument();

  await submenuTester.selectOption({option: submenuTester.options()[0]});
  expect(submenuTester.menu).not.toBeInTheDocument();
  expect(menuTester.menu).not.toBeInTheDocument();
});
```

## A

PI

### User

### Menu

Tester

## Testing 

FAQ

<PatternTestingFAQ patternName="menu"/>
