## Test utilities

`@react-aria/test-utils` provides ARIA pattern testers that simulate mouse, keyboard, and touch interactions for components built with React Aria Components.

### Installation

```bash
npm install @react-aria/test-utils --save-dev
```

### Core pattern

Initialize a `User` once per test file. Call `createTester` to get a tester for a specific ARIA pattern, then call tester methods to simulate interactions.

```ts
import {User} from '@react-aria/test-utils';

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
- You can still simulate interactions manually in your test alongside the utilities provided by the tester. This can come in handy if you find that the tester doesn't cover a specific user flow or if one of its utilities isn't quite working as expected. After simulating your interaction, you can still
use the tester to query for the component's state or trigger a different interaction utility.
- Mouse drag interactions, simulated scrolling, and other mock reliant interactions are not available in these test utils since they depend heavily on how the user mocks things like clientHeight/Width/etc in their tests. These interactions need to be simulated manually by the user.
- Some testers may support the notion of "long press" for certain interactions (e.g. long pressing a button to trigger its menu). To simulate this, you will need mock PointerEvent globally (see the installPointerEvent util) and provide a way to advance timers to the User via `advanceTimer`.
- These test utils are compatible with not only JSDOM unit tests but browser tests as well (e.g. vitest-browser-react)

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

| Pattern name | Component | Key methods |
|---|---|---|
| `'CheckboxGroup'` | CheckboxGroup | `checkboxGroup()`, `checkboxes()`, `selectedCheckboxes()`, `toggleCheckbox({checkbox})` |
| `'ComboBox'` | ComboBox | `combobox()`, `listbox()`, `options()`, `open()`, `toggleOptionSelection({option})` |
| `'Dialog'` | Modal, Popover | `trigger()`, `dialog()`, `open()`, `close()` — pass `overlayType: 'modal'` or `'popover'` to `createTester` |
| `'GridList'` | GridList | `gridlist()`, `rows()`, `selectedRows()`, `toggleRowSelection({row})`, `triggerRowAction({row})` |
| `'ListBox'` | ListBox | `listbox()`, `options()`, `selectedOptions()`, `toggleOptionSelection({option})`, `triggerOptionAction({option})` |
| `'Menu'` | Menu | `trigger()`, `menu()`, `options()`, `open()`, `toggleOptionSelection({option})`, `openSubmenu({submenuTrigger})`, `close()` |
| `'RadioGroup'` | RadioGroup | `radiogroup()`, `radios()`, `selectedRadio()`, `triggerRadio({radio})` |
| `'Select'` | Select | `trigger()`, `listbox()`, `options()`, `toggleOptionSelection({option})` |
| `'Table'` | Table | `table()`, `rows()`, `columns()`, `selectedRows()`, `toggleRowSelection({row})`, `toggleSort({column})`, `triggerRowAction({row})` |
| `'Tabs'` | Tabs | `tablist()`, `tabs()`, `tabpanels()`, `selectedTab()`, `triggerTab({tab})` |
| `'Tree'` | Tree | `tree()`, `rows()`, `selectedRows()`, `toggleRowSelection({row})`, `toggleRowExpansion({row})`, `triggerRowAction({row})` |

### Per-component reference

- [CheckboxGroup]({{testingBase}}CheckboxGroup/testing.md)
- [ComboBox]({{testingBase}}ComboBox/testing.md)
- [GridList]({{testingBase}}GridList/testing.md)
- [ListBox]({{testingBase}}ListBox/testing.md)
- [Menu]({{testingBase}}Menu/testing.md)
- [Modal]({{testingBase}}Modal/testing.md)
- [Popover]({{testingBase}}Popover/testing.md)
- [RadioGroup]({{testingBase}}RadioGroup/testing.md)
- [Select]({{testingBase}}Select/testing.md)
- [Table]({{testingBase}}Table/testing.md)
- [Tabs]({{testingBase}}Tabs/testing.md)
- [Tree]({{testingBase}}Tree/testing.md)
