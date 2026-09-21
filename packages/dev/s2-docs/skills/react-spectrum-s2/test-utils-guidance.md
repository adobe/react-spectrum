## Test utilities

`@react-spectrum/test-utils` provides ARIA pattern testers that simulate mouse, keyboard, and touch interactions for components built with React Spectrum S2.

### Installation

```bash
npm install @react-spectrum/test-utils --save-dev
```

### Core pattern

External consumers import from `@react-spectrum/test-utils`.

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
  expect(tableTester.getSelectedRows()).toHaveLength(0);

  await tableTester.toggleSelectAll();
  expect(tableTester.getSelectedRows()).toHaveLength(10);
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
- Methods that accept a target (`option`, `row`, `column`, `checkbox`, `radio`, `tab`) take a `number` (index), `string` (text content), or `HTMLElement`. Use the tester's own query methods (e.g. `getRows()`, `getOptions()`) to obtain an `HTMLElement` when you need one.
- Link navigation assertions must be simulated manually. The testers do not assert navigation side effects.

### When not to use the testers

Skip the testers and write manual interactions for the following cases:

- When testing a Menu or Dialog rendered without a trigger, or when testing interactive elements embedded inside rows or cells (e.g. an ActionMenu inside a TreeView row). The testers assume a trigger exists and do not reach into row/cell content.
- tests that verify exact focus order, arrow key cycling, or specific modifier key behavior. Use `fireEvent.keyDown` or `userEvent.keyboard` directly so the test is actually testing the desired keyboard flow.
- when `isOpen` or `defaultOpen` is set, `open()` will no-op but the tester's `root` must still resolve to the trigger element. Use `getByLabelText` or `getByTestId` rather than `getByRole('button')` to avoid ambiguity when multiple buttons are in the DOM.
- testing `isDismissible`, `isKeyboardDismissDisabled`, or outside-click behavior. Use `userEvent.click(document.body)` or `user.keyboard('[Escape]')` directly and assert the expected state afterwards.
- when a Dialog closes via an action button (not the explicit close/dismiss button) you should instead click that button manually, then use `dialogTester.getDialog()` to assert whether the dialog is still present.

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
| `'CheckboxGroup'` | CheckboxGroup | `getCheckboxGroup()`, `getCheckboxes()`, `getSelectedCheckboxes()`, `toggleCheckbox({checkbox})` |
| `'ComboBox'` | ComboBox | `getCombobox()`, `getListbox()`, `getOptions()`, `open()`, `toggleOptionSelection({option})` |
| `'Dialog'` | Dialog | `getTrigger()`, `getDialog()`, `open()`, `close()` — pass `overlayType: 'modal'` or `'popover'` to `createTester` |
| `'GridList'` | ListView | `getGridlist()`, `getRows()`, `getSelectedRows()`, `toggleRowSelection({row})`, `triggerRowAction({row})` |
| `'Menu'` | Menu | `getTrigger()`, `getMenu()`, `getOptions()`, `open()`, `toggleOptionSelection({option})`, `openSubmenu({submenuTrigger})`, `close()` |
| `'RadioGroup'` | RadioGroup | `getRadioGroup()`, `getRadios()`, `getSelectedRadio()`, `triggerRadio({radio})` |
| `'Select'` | Picker | `getTrigger()`, `getListbox()`, `getOptions()`, `toggleOptionSelection({option})` |
| `'Table'` | TableView | `getTable()`, `getRows()`, `getFooterRows()`, `getColumns()`, `getSelectedRows()`, `toggleRowSelection({row})`, `toggleSort({column})`, `triggerRowAction({row})` |
| `'Tabs'` | Tabs | `getTablist()`, `getTabs()`, `getTabpanels()`, `getSelectedTab()`, `triggerTab({tab})` |
| `'Tree'` | TreeView | `getTree()`, `getRows()`, `getSelectedRows()`, `toggleRowSelection({row})`, `toggleRowExpansion({row})`, `triggerRowAction({row})` |

#### Dialog `overlayType` reference

Pass `overlayType` to `createTester` so the tester knows how the overlay is mounted:

| S2 component | `overlayType` |
|---|---|
| `Dialog` | `'modal'` |
| `AlertDialog` | `'modal'` |
| `CustomDialog` | `'modal'` |
| Popover-based dialogs | `'popover'` |

```ts
let dialogTester = testUtilUser.createTester('Dialog', {root: tree.getByRole('button'), overlayType: 'modal'});
await dialogTester.open();
expect(dialogTester.getDialog()).toBeVisible();
```

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
