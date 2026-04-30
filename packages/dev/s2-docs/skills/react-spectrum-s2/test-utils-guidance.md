## Test utilities

`@react-spectrum/test-utils` provides ARIA pattern testers that simulate mouse, keyboard, and touch interactions for components built with React Spectrum S2.

### Installation

```bash
npm install @react-spectrum/test-utils --save-dev
```

### Core pattern

Initialize a `User` once per test file. Call `createTester` to get a tester for a specific ARIA pattern, then call tester methods to simulate interactions.

```ts
import {User} from '@react-spectrum/test-utils';

// Provide whatever method of advancing timers you use in your test, this example assumes Jest with fake timers.
// 'interactionType' specifies what mode of interaction should be simulated by the tester
// 'advanceTimer' is used by the tester to advance the timers in the tests for specific interactions (e.g. long press)
let testUtilUser = new User({interactionType: 'mouse', advanceTimer: jest.advanceTimersByTime});

it('my test case', async function () {
  // Render your test component/app
  let {getByTestId} = render();
  // Initialize the table tester via providing the 'Table' pattern name and the root element of said table
  let tableTester = testUtilUser.createTester('Table', {root: getByTestId('test_table')});
  expect(tableTester.selectedRows()).toHaveLength(0);

  await tableTester.toggleSelectAll();
  expect(tableTester.selectedRows()).toHaveLength(10);
  ...
});
```

Set `interactionType` to `'mouse'`, `'keyboard'`, or `'touch'`. Override per tester via `createTester(..., {interactionType})` or per method call.

When using fake timers, pass `advanceTimer: jest.advanceTimersByTime` and flush timers after each test:

```ts
afterEach(() => {
  act(() => jest.runAllTimers());
});
```

### Tips and Tricks
- The testers typically offers these things: a way to simulate common user interactions for the given component via a specified user modality (e.g. using mouse vs keyboard to toggle a menu), a way to get the various common elements that make up the component (e.g. the rows in a table), and a way to query the state of the component (e.g. get the selected rows in a table). Prefer using the testers for these use cases so that the user doesn't need to know what specific roles/elements/etc to target in their tests.
- You can still simulate interactions manually in your test alongside the utilities provided by the tester. This can come in handy if you find that the tester doesn't cover a specific user flow or if one of its utilities isn't quite working as expected. After simulating your interaction, you can still use the tester to query for the component's state or trigger a different interaction utility.
- Mouse drag interactions and other mock reliant interactions are not available in these test utils since they depended heavily on how the user mocked various things in their test. These must still be simulated manually by the user.
- Some testers may support the notion of "long press" for certain interactions (e.g. long pressing a button to trigger its menu). To simulate this, you will need to mock PointerEvent globally (see the `installPointerEvent` util) and provide a way to advance timers to the User via `advanceTimer`.
- These test utils are compatible with not only JSDOM unit tests but browser tests as well (e.g. vitest-browser-react).

### Draggable handle components

Components with draggable handles (Slider, ColorArea, ColorSlider, ColorWheel) need `getBoundingClientRect` mocked so move calculations work:

```ts
import {installMouseEvent} from '@react-spectrum/test-utils';
installMouseEvent();

beforeAll(() => {
  jest.spyOn(window.HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({top: 0, left: 0, width: 100, height: 10, bottom: 10, right: 100})
  );
});
```

### Available testers

The pattern name passed to `createTester` is the ARIA pattern name — not the S2 component name.

| Pattern name | S2 component | Key methods |
|---|---|---|
| `'CheckboxGroup'` | CheckboxGroup | `checkboxGroup()`, `checkboxes()`, `selectedCheckboxes()`, `toggleCheckbox({checkbox})` |
| `'ComboBox'` | ComboBox | `combobox()`, `listbox()`, `options()`, `open()`, `toggleOptionSelection({option})` |
| `'Dialog'` | Dialog | `trigger()`, `dialog()`, `open()`, `close()` |
| `'GridList'` | ListView | `gridlist()`, `rows()`, `selectedRows()`, `toggleRowSelection({row})`, `triggerRowAction({row})` |
| `'Menu'` | Menu | `trigger()`, `menu()`, `options()`, `open()`, `toggleOptionSelection({option})`, `openSubmenu({submenuTrigger})`, `close()` |
| `'RadioGroup'` | RadioGroup | `radiogroup()`, `radios()`, `selectedRadio()`, `triggerRadio({radio})` |
| `'Select'` | Picker | `trigger()`, `listbox()`, `options()`, `toggleOptionSelection({option})` |
| `'Table'` | TableView | `table()`, `rows()`, `columns()`, `selectedRows()`, `toggleRowSelection({row})`, `toggleSort({column})`, `triggerRowAction({row})` |
| `'Tabs'` | Tabs | `tablist()`, `tabs()`, `tabpanels()`, `selectedTab()`, `triggerTab({tab})` |
| `'Tree'` | TreeView | `tree()`, `rows()`, `selectedRows()`, `toggleRowSelection({row})`, `toggleRowExpansion({row})`, `triggerRowAction({row})` |


### Per-component reference

- [CheckboxGroup]({{testingBase}}CheckboxGroup/testing.md)
- [ComboBox]({{testingBase}}ComboBox/testing.md)
- [Dialog]({{testingBase}}Dialog/testing.md)
- [ListView]({{testingBase}}ListView/testing.md)
- [Menu]({{testingBase}}Menu/testing.md)
- [Picker]({{testingBase}}Picker/testing.md)
- [RadioGroup]({{testingBase}}RadioGroup/testing.md)
- [TableView]({{testingBase}}TableView/testing.md)
- [Tabs]({{testingBase}}Tabs/testing.md)
- [TreeView]({{testingBase}}TreeView/testing.md)
