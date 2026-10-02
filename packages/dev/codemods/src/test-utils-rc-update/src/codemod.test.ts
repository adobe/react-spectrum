// @ts-ignore
import {defineInlineTest} from 'jscodeshift/dist/testUtils';
import transform from './codemod';

function test(name: string, input: string, output: string) {
  defineInlineTest(transform, {}, input, output, name);
}

test(
  'checkboxgroup: renames getters and findCheckbox param key',
  `
const tester = user.createTester('CheckboxGroup', {root: el});
tester.checkboxgroup;
tester.checkboxes;
tester.selectedCheckboxes;
tester.findCheckbox({checkboxIndexOrText: 3});
`,
  `
const tester = user.createTester('CheckboxGroup', {root: el});
tester.getCheckboxGroup();
tester.getCheckboxes();
tester.getSelectedCheckboxes();
tester.findCheckbox({indexOrText: 3});
`
);

test(
  'combobox: renames getters, getOptions, toggleOptionSelection, and findOption param key',
  `
const tester = user.createTester('ComboBox', {root: el});
tester.combobox;
tester.trigger;
tester.listbox;
tester.sections;
tester.options();
tester.focusedOption;
await tester.selectOption({option: 'Two'});
tester.findOption({optionIndexOrText: 'Two'});
`,
  `
const tester = user.createTester('ComboBox', {root: el});
tester.getCombobox();
tester.getTrigger();
tester.getListbox();
tester.getSections();
tester.getOptions();
tester.getFocusedOption();
await tester.toggleOptionSelection({option: 'Two'});
tester.findOption({indexOrText: 'Two'});
`
);

test(
  'dialog: renames getters',
  `
const tester = user.createTester('Dialog', {root: el});
tester.trigger;
tester.dialog;
`,
  `
const tester = user.createTester('Dialog', {root: el});
tester.getTrigger();
tester.getDialog();
`
);

test(
  'gridlist: renames getters, getCells, and findRow param key',
  `
const tester = user.createTester('GridList', {root: el});
tester.gridlist;
tester.rows;
tester.selectedRows;
tester.cells();
tester.findRow({rowIndexOrText: 'Item 1'});
`,
  `
const tester = user.createTester('GridList', {root: el});
tester.getGridlist();
tester.getRows();
tester.getSelectedRows();
tester.getCells();
tester.findRow({indexOrText: 'Item 1'});
`
);

test(
  'listbox: renames getters, getOptions, and findOption param key',
  `
const tester = user.createTester('ListBox', {root: el});
tester.listbox;
tester.selectedOptions;
tester.sections;
tester.options();
tester.findOption({optionIndexOrText: 'Foo'});
tester.findOption({optionIndexOrText: 3});
`,
  `
const tester = user.createTester('ListBox', {root: el});
tester.getListbox();
tester.getSelectedOptions();
tester.getSections();
tester.getOptions();
tester.findOption({indexOrText: 'Foo'});
tester.findOption({indexOrText: 3});
`
);

test(
  'menu: renames getters, getOptions, and toggleOptionSelection',
  `
const tester = user.createTester('Menu', {root: el});
tester.trigger;
tester.menu;
tester.sections;
tester.options();
tester.submenuTriggers;
await tester.selectOption({option: 'Bar', menuSelectionMode: 'single'});
`,
  `
const tester = user.createTester('Menu', {root: el});
tester.getTrigger();
tester.getMenu();
tester.getSections();
tester.getOptions();
tester.getSubmenuTriggers();
await tester.toggleOptionSelection({option: 'Bar', menuSelectionMode: 'single'});
`
);

test(
  'radiogroup: renames getters and findRadio param key',
  `
const tester = user.createTester('RadioGroup', {root: el});
tester.radiogroup;
tester.radios;
tester.selectedRadio;
tester.findRadio({radioIndexOrText: 3});
tester.findRadio({radioIndexOrText: 'Chocobo'});
`,
  `
const tester = user.createTester('RadioGroup', {root: el});
tester.getRadioGroup();
tester.getRadios();
tester.getSelectedRadio();
tester.findRadio({indexOrText: 3});
tester.findRadio({indexOrText: 'Chocobo'});
`
);

test(
  'select: renames getters, getOptions, toggleOptionSelection, and findOption param key',
  `
const tester = user.createTester('Select', {root: el});
tester.trigger;
tester.listbox;
tester.sections;
tester.options();
await tester.selectOption({option: 'Three'});
tester.findOption({optionIndexOrText: 'Three'});
`,
  `
const tester = user.createTester('Select', {root: el});
tester.getTrigger();
tester.getListbox();
tester.getSections();
tester.getOptions();
await tester.toggleOptionSelection({option: 'Three'});
tester.findOption({indexOrText: 'Three'});
`
);

test(
  'table: renames getters, getCells, and findRow param key',
  `
const tester = user.createTester('Table', {root: el});
tester.table;
tester.rowGroups;
tester.columns;
tester.rows;
tester.selectedRows;
tester.rowHeaders;
tester.cells();
tester.findRow({rowIndexOrText: 'Apples'});
`,
  `
const tester = user.createTester('Table', {root: el});
tester.getTable();
tester.getRowGroups();
tester.getColumns();
tester.getRows();
tester.getSelectedRows();
tester.getRowHeaders();
tester.getCells();
tester.findRow({indexOrText: 'Apples'});
`
);

test(
  'tabs: renames getters and findTab param key',
  `
const tester = user.createTester('Tabs', {root: el});
tester.tablist;
tester.tabs;
tester.tabpanels;
tester.selectedTab;
tester.activeTabpanel;
tester.findTab({tabIndexOrText: 3});
tester.findTab({tabIndexOrText: 'Tab 5'});
`,
  `
const tester = user.createTester('Tabs', {root: el});
tester.getTablist();
tester.getTabs();
tester.getTabpanels();
tester.getSelectedTab();
tester.getActiveTabpanel();
tester.findTab({indexOrText: 3});
tester.findTab({indexOrText: 'Tab 5'});
`
);

test(
  'tree: renames getters, getCells, and findRow param key',
  `
const tester = user.createTester('Tree', {root: el});
tester.tree;
tester.rows;
tester.selectedRows;
tester.cells();
tester.findRow({rowIndexOrText: 'Folder'});
`,
  `
const tester = user.createTester('Tree', {root: el});
tester.getTree();
tester.getRows();
tester.getSelectedRows();
tester.getCells();
tester.findRow({indexOrText: 'Folder'});
`
);

test(
  'does not rename accessors on non-tester variables',
  `
const rows = someOtherObject.rows;
const options = config.options();
const table = ui.table;
someOtherObj.findOption({optionIndexOrText: 'Foo'});
someOtherObj.findRow({rowIndexOrText: 3});
`,
  `
const rows = someOtherObject.rows;
const options = config.options();
const table = ui.table;
someOtherObj.findOption({optionIndexOrText: 'Foo'});
someOtherObj.findRow({rowIndexOrText: 3});
`
);

test(
  'handles accessor used inline without intermediate variable',
  `
const tester = user.createTester('Tree', {root: el});
expect(tester.tree).toBeDefined();
expect(tester.rows.length).toBe(3);
expect(tester.selectedRows).toHaveLength(1);
expect(tester.cells()).toHaveLength(6);
`,
  `
const tester = user.createTester('Tree', {root: el});
expect(tester.getTree()).toBeDefined();
expect(tester.getRows().length).toBe(3);
expect(tester.getSelectedRows()).toHaveLength(1);
expect(tester.getCells()).toHaveLength(6);
`
);

test(
  'handles optional chaining on direct tester variables',
  `
const tester = user.createTester('Menu', {root: el});
expect(tester?.menu).toBeInTheDocument();
expect(tester?.options()).toHaveLength(3);
expect(tester?.submenuTriggers[0]).toBeDefined();
`,
  `
const tester = user.createTester('Menu', {root: el});
expect(tester?.getMenu()).toBeInTheDocument();
expect(tester?.getOptions()).toHaveLength(3);
expect(tester?.getSubmenuTriggers()[0]).toBeDefined();
`
);

test(
  'handles variables assigned from openSubmenu with non-null assertion',
  `
const menuTester = user.createTester('Menu', {root: el});
let submenuUtil = (await menuTester.openSubmenu({submenuTrigger: 'Share…'}))!;
let submenu = submenuUtil.menu;
expect(submenuUtil.options()).toHaveLength(2);
`,
  `
const menuTester = user.createTester('Menu', {root: el});
let submenuUtil = (await menuTester.openSubmenu({submenuTrigger: 'Share…'}))!;
let submenu = submenuUtil.getMenu();
expect(submenuUtil.getOptions()).toHaveLength(2);
`
);

test(
  'handles variables assigned from openSubmenu and optional chaining on them',
  `
const menuTester = user.createTester('Menu', {root: el});
let submenuTester = await menuTester.openSubmenu({submenuTrigger: 'Copy'});
let nestedSubmenu = await submenuTester?.openSubmenu({submenuTrigger: 'Email'});
expect(submenuTester?.menu).toBeInTheDocument();
expect(submenuTester?.options()).toHaveLength(3);
expect(nestedSubmenu?.menu).toBeInTheDocument();
expect(document.activeElement).toBe(nestedSubmenu?.trigger);
expect(nestedSubmenu?.options()[0]).toBeFocused();
`,
  `
const menuTester = user.createTester('Menu', {root: el});
let submenuTester = await menuTester.openSubmenu({submenuTrigger: 'Copy'});
let nestedSubmenu = await submenuTester?.openSubmenu({submenuTrigger: 'Email'});
expect(submenuTester?.getMenu()).toBeInTheDocument();
expect(submenuTester?.getOptions()).toHaveLength(3);
expect(nestedSubmenu?.getMenu()).toBeInTheDocument();
expect(document.activeElement).toBe(nestedSubmenu?.getTrigger());
expect(nestedSubmenu?.getOptions()[0]).toBeFocused();
`
);
