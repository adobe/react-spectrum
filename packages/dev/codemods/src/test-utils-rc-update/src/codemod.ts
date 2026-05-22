import {API, FileInfo} from 'jscodeshift';
import {parse} from '@babel/parser';
import {parse as recastParse} from 'recast';

const RENAME_MAP: Record<string, string> = {
  checkboxgroup: 'getCheckboxGroup',
  checkboxes: 'getCheckboxes',
  selectedCheckboxes: 'getSelectedCheckboxes',
  combobox: 'getCombobox',
  trigger: 'getTrigger',
  listbox: 'getListbox',
  sections: 'getSections',
  options: 'getOptions',
  focusedOption: 'getFocusedOption',
  selectOption: 'toggleOptionSelection',
  dialog: 'getDialog',
  gridlist: 'getGridlist',
  rows: 'getRows',
  selectedRows: 'getSelectedRows',
  cells: 'getCells',
  selectedOptions: 'getSelectedOptions',
  menu: 'getMenu',
  submenuTriggers: 'getSubmenuTriggers',
  radiogroup: 'getRadioGroup',
  radios: 'getRadios',
  selectedRadio: 'getSelectedRadio',
  table: 'getTable',
  rowGroups: 'getRowGroups',
  columns: 'getColumns',
  rowHeaders: 'getRowHeaders',
  tablist: 'getTablist',
  tabpanels: 'getTabpanels',
  selectedTab: 'getSelectedTab',
  tabs: 'getTabs',
  activeTabpanel: 'getActiveTabpanel',
  tree: 'getTree'
};

const FIND_PARAM_KEY_MAP: Record<string, string> = {
  findCheckbox: 'checkboxIndexOrText',
  findOption: 'optionIndexOrText',
  findRow: 'rowIndexOrText',
  findRadio: 'radioIndexOrText',
  findTab: 'tabIndexOrText'
};

// Methods on a tester that return another tester object
const TESTER_RETURNING_METHODS = new Set(['openSubmenu']);

export default function transformer(file: FileInfo, api: API): string {
  let j = api.jscodeshift.withParser({
    parse(source: string) {
      return recastParse(source, {
        parser: {
          parse(innerSource: string) {
            return parse(innerSource, {
              sourceType: 'module',
              plugins: [
                'jsx',
                'typescript',
                'importAssertions',
                'dynamicImport',
                'decorators-legacy',
                'classProperties',
                'classPrivateProperties',
                'classPrivateMethods',
                'exportDefaultFrom',
                'exportNamespaceFrom',
                'objectRestSpread',
                'optionalChaining',
                'nullishCoalescingOperator',
                'topLevelAwait'
              ],
              tokens: true,
              errorRecovery: true
            });
          }
        }
      });
    }
  });

  let root = j(file.source);

  let testerVarNames = new Set<string>();

  function unwrapAwait(node: any): any {
    while (node?.type === 'AwaitExpression' || node?.type === 'TSNonNullExpression') {
      node = node.type === 'TSNonNullExpression' ? node.expression : node.argument;
    }
    return node;
  }

  function isCallOf(node: any): boolean {
    return node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression';
  }

  function isMemberOf(node: any): boolean {
    return node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression';
  }

  // Initial pass: find variables directly from createTester(...)
  root.find(j.VariableDeclarator).forEach(path => {
    let id = path.node.id;
    if (id.type !== 'Identifier') {
      return;
    }
    let call = unwrapAwait(path.node.init as any);
    if (!isCallOf(call)) {
      return;
    }
    let callee = call.callee;
    let isCreateTester =
      (isMemberOf(callee) && callee.property?.name === 'createTester') ||
      (callee?.type === 'Identifier' && callee?.name === 'createTester');
    if (isCreateTester) {
      testerVarNames.add(id.name);
    }
  });

  if (testerVarNames.size === 0) {
    return file.source;
  }

  // Multi-pass: propagate tracking through methods that return testers (e.g. openSubmenu)
  let propagating = true;
  while (propagating) {
    propagating = false;
    root.find(j.VariableDeclarator).forEach(path => {
      let id = path.node.id;
      if (id.type !== 'Identifier' || testerVarNames.has(id.name)) {
        return;
      }
      let call = unwrapAwait(path.node.init as any);
      if (!isCallOf(call) || !isMemberOf(call.callee)) {
        return;
      }
      let obj = call.callee.object;
      let methodName = call.callee.property?.type === 'Identifier' ? call.callee.property.name : '';
      if (obj?.type === 'Identifier' && testerVarNames.has(obj.name) && TESTER_RETURNING_METHODS.has(methodName)) {
        testerVarNames.add(id.name);
        propagating = true;
      }
    });
  }

  let didChange = false;

  function renamePropInCallee(callee: any): boolean {
    if (!isMemberOf(callee) || callee.object?.type !== 'Identifier' || !testerVarNames.has(callee.object.name)) {
      return false;
    }
    let propName: string = callee.property?.type === 'Identifier' ? callee.property.name : '';
    let newName = RENAME_MAP[propName];
    if (!newName) {
      return false;
    }
    callee.property = j.identifier(newName);
    return true;
  }

  // Pass 1: Rename method calls — tester.options() → tester.getOptions()
  root.find(j.CallExpression, {callee: {type: 'MemberExpression'}}).forEach(path => {
    if (path.node.type !== 'CallExpression') {
      return; // skip OptionalCallExpression matched by babel parser
    }
    if (renamePropInCallee(path.node.callee)) {
      didChange = true;
    }
  });

  // Pass 1B: tester?.options() → tester?.getOptions()
  root.find(j.OptionalCallExpression).forEach(path => {
    if (renamePropInCallee(path.node.callee as any)) {
      didChange = true;
    }
  });

  // Pass 2: Property access → call — tester.rows → tester.getRows()
  root.find(j.MemberExpression).forEach(path => {
    let node = path.node as any;
    if (node.type !== 'MemberExpression') {
      return; // skip OptionalMemberExpression matched by babel parser
    }
    if (node.object?.type !== 'Identifier' || !testerVarNames.has(node.object.name)) {
      return;
    }
    let propName: string = node.property?.type === 'Identifier' ? node.property.name : '';
    let newName = RENAME_MAP[propName];
    if (!newName) {
      return;
    }
    let parent = path.parent?.node;
    if (parent?.type === 'CallExpression' && parent.callee === path.node) {
      return;
    }
    j(path).replaceWith(
      j.callExpression(j.memberExpression(node.object, j.identifier(newName)), [])
    );
    didChange = true;
  });

  // Pass 2B: tester?.rows → tester?.getRows()
  root.find(j.OptionalMemberExpression).forEach(path => {
    let node = path.node as any;
    if (node.object?.type !== 'Identifier' || !testerVarNames.has(node.object.name)) {
      return;
    }
    let propName: string = node.property?.type === 'Identifier' ? node.property.name : '';
    let newName = RENAME_MAP[propName];
    if (!newName) {
      return;
    }
    let parent = path.parent?.node;
    if (
      (parent?.type === 'OptionalCallExpression' || parent?.type === 'CallExpression') &&
      parent.callee === path.node
    ) {
      return;
    }
    j(path).replaceWith(
      j.optionalCallExpression(
        j.optionalMemberExpression(node.object, j.identifier(newName), false, true),
        [],
        false
      )
    );
    didChange = true;
  });

  // Pass 3: Rename param keys inside find* calls — {optionIndexOrText: x} → {indexOrText: x}
  function renameFindParamKey(callPath: any): void {
    let callee = callPath.node.callee as any;
    if (!isMemberOf(callee) || callee.object?.type !== 'Identifier' || !testerVarNames.has(callee.object.name)) {
      return;
    }
    let methodName: string = callee.property?.type === 'Identifier' ? callee.property.name : '';
    let oldKey = FIND_PARAM_KEY_MAP[methodName];
    if (!oldKey) {
      return;
    }
    let firstArg = callPath.node.arguments[0] as any;
    if (firstArg?.type !== 'ObjectExpression') {
      return;
    }
    for (let prop of firstArg.properties) {
      if (prop.type === 'ObjectProperty' && prop.key?.type === 'Identifier' && prop.key.name === oldKey) {
        prop.key = j.identifier('indexOrText');
        didChange = true;
      }
    }
  }

  root.find(j.CallExpression, {callee: {type: 'MemberExpression'}}).forEach(renameFindParamKey);
  root.find(j.OptionalCallExpression).forEach(renameFindParamKey);

  return didChange ? root.toSource({quote: 'single'}) : file.source;
}
