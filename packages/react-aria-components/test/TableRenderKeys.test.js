/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import userEvent from '@testing-library/user-event';

// Rows and cells skip rendering unless their render key changes. These tests run the same
// interactions against the real Table and against a copy where memo is disabled, so every row and
// cell renders every time, and check that the two always produce the same DOM. A difference means
// a render key is missing some state that the row or cell renders.

function loadComponents() {
  return {
    ...require('../src/Table'),
    Button: require('../src/Button').Button,
    Checkbox: require('../src/Checkbox').Checkbox,
    Collection: require('react-aria/Collection').Collection,
    useDragAndDrop: require('../src/useDragAndDrop').useDragAndDrop
  };
}

let MemoizedTreeTable;
let UnmemoizedTreeTable;

// Renders every render prop into the class name, so that the DOM shows the values that rows and
// cells rendered with.
function renderPropsClassName(renderProps) {
  return Object.entries(renderProps)
    .filter(([key, value]) => key !== 'defaultClassName' && typeof value !== 'object')
    .map(([key, value]) => `${key}-${value}`)
    .join(' ');
}

const initialState = {
  items: [
    {
      id: 'games',
      name: 'Games',
      type: 'Folder',
      date: '6/7/2023',
      children: [
        {id: 'mario', name: 'Mario Kart', type: 'Game', date: '8/27/1992'},
        {id: 'tetris', name: 'Tetris', type: 'Game', date: '1/27/1988'}
      ]
    },
    {
      id: 'apps',
      name: 'Applications',
      type: 'Folder',
      date: '4/7/2025',
      children: [
        {id: 'ps', name: 'Photoshop', type: 'Application', date: '2/19/1990'},
        {id: 'premiere', name: 'Premiere', type: 'Application', date: '9/23/2003'}
      ]
    },
    {id: 'readme', name: 'README', type: 'File', date: '1/1/2024'}
  ],
  columns: ['name', 'type', 'date'],
  rowHeader: 'name',
  tableProps: {selectionMode: 'multiple'}
};

let setTableState;
let setState = update => {
  act(() => setTableState(update));
};

function createTreeTable(components) {
  let {Table, TableHeader, Column, TableBody, Row, Cell, Button, Checkbox, Collection} = components;
  let useDragAndDrop = components.useDragAndDrop;

  return function TreeTable({withDragAndDrop}) {
    let [state, setStateInner] = useState(initialState);
    useEffect(() => {
      setTableState = setStateInner;
    }, []);
    let {dragAndDropHooks} = useDragAndDrop({
      getItems: keys => [...keys].map(key => ({'text/plain': String(key)}))
    });
    let {items, columns, rowHeader, tableProps} = state;

    let renderRow = item => (
      <Row id={item.id} textValue={item.name} className={renderPropsClassName}>
        {withDragAndDrop && (
          <Cell className={renderPropsClassName}>
            <Button slot="drag">≡</Button>
          </Cell>
        )}
        <Cell className={renderPropsClassName}>
          <Checkbox slot="selection" />
        </Cell>
        {columns.map(column => (
          <Cell key={column} className={renderPropsClassName}>
            {({hasChildItems, isTreeColumn}) => (
              <>
                {hasChildItems && isTreeColumn && (
                  <Button slot="chevron" data-chevron>
                    &gt;
                  </Button>
                )}
                {item[column]}
              </>
            )}
          </Cell>
        ))}
        {item.children && <Collection items={item.children}>{renderRow}</Collection>}
      </Row>
    );

    return (
      <>
        <button>Before</button>
        <Table
          aria-label="Files"
          treeColumn={rowHeader}
          dragAndDropHooks={withDragAndDrop ? dragAndDropHooks : undefined}
          {...tableProps}>
          <TableHeader>
            {withDragAndDrop && <Column />}
            <Column>
              <Checkbox slot="selection" />
            </Column>
            {columns.map(column => (
              <Column key={column} id={column} isRowHeader={column === rowHeader}>
                {column}
              </Column>
            ))}
          </TableHeader>
          <TableBody
            items={items}
            dependencies={[columns, rowHeader]}
            renderEmptyState={() => 'No files'}>
            {renderRow}
          </TableBody>
        </Table>
        <button>After</button>
      </>
    );
  };
}

MemoizedTreeTable = createTreeTable(loadComponents());
jest.isolateModules(() => {
  jest.doMock('react', () => ({...React, memo: Component => Component}));
  jest.doMock('react-dom', () => ReactDOM);
  UnmemoizedTreeTable = createTreeTable(loadComponents());
});

// Serializes the DOM with generated ids replaced by their order of appearance, so that two
// renders can be compared.
function serialize(container) {
  let ids = new Map();
  let replaceIds = value =>
    value.replace(/_r_[0-9a-z]+_|:r[0-9a-z]+:|«r[0-9a-z]+»|react-aria\d*-\d+/g, id => {
      if (!ids.has(id)) {
        ids.set(id, `<id${ids.size}>`);
      }
      return ids.get(id);
    });

  let lines = [];
  let visit = (node, depth) => {
    let indent = '  '.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim()) {
        lines.push(indent + JSON.stringify(node.textContent));
      }
      return;
    }
    let attributes = [...node.attributes]
      .map(attribute => `${attribute.name}="${replaceIds(attribute.value)}"`)
      .sort()
      .join(' ');
    let focused = node === document.activeElement ? ' (focused)' : '';
    lines.push(`${indent}<${node.tagName.toLowerCase()} ${attributes}>${focused}`);
    for (let child of node.childNodes) {
      visit(child, depth + 1);
    }
  };
  visit(container, 0);
  return lines.join('\n');
}

let row = (container, key) => container.querySelector(`[role="row"][data-key="${key}"]`);

function updateItem(id, update) {
  let visit = items =>
    items.map(item => {
      if (item.id === id) {
        return update(item);
      }
      return item.children ? {...item, children: visit(item.children)} : item;
    });
  setState(state => ({...state, items: visit(state.items)}));
}

function updateTableProps(props) {
  setState(state => ({...state, tableProps: {...state.tableProps, ...props}}));
}

function removeItem(key) {
  let visit = items =>
    items
      .filter(item => item.id !== key)
      .map(item => (item.children ? {...item, children: visit(item.children)} : item));
  setState(state => ({...state, items: visit(state.items)}));
}

let focusRow = (container, key) => {
  act(() => row(container, key).focus());
};
let checkbox = (container, key) => within(row(container, key)).getByRole('checkbox');

const steps = [
  ['initial render', () => {}],
  ['hover a row', (user, container) => user.hover(row(container, 'games'))],
  ['select a row', (user, container) => user.click(checkbox(container, 'games'))],
  ['select another row', (user, container) => user.click(checkbox(container, 'readme'))],
  ['focus a row', (user, container) => focusRow(container, 'games')],
  ['expand with the keyboard', user => user.keyboard('{ArrowRight}')],
  ['move focus down', user => user.keyboard('{ArrowDown}')],
  ['focus a cell', user => user.keyboard('{ArrowRight}')],
  ['move to the next cell', user => user.keyboard('{ArrowRight}')],
  ['move to a cell in the next row', user => user.keyboard('{ArrowDown}')],
  ['focus back on the row', user => user.keyboard('{ArrowLeft}{ArrowLeft}')],
  [
    'expand with the chevron',
    (user, container) => user.click(row(container, 'apps').querySelector('[data-chevron]'))
  ],
  [
    'add a child row',
    () =>
      updateItem('games', item => ({
        ...item,
        children: [...item.children, {id: 'zelda', name: 'Zelda', type: 'Game', date: '2/21/1986'}]
      }))
  ],
  [
    'remove the last child row',
    () => updateItem('games', item => ({...item, children: item.children.slice(0, -1)}))
  ],
  ['change a cell', () => updateItem('tetris', item => ({...item, type: 'Puzzle'}))],
  [
    'give a row children',
    () =>
      updateItem('readme', item => ({
        ...item,
        children: [{id: 'license', name: 'LICENSE', type: 'File', date: '1/1/2024'}]
      }))
  ],
  [
    'expand the new parent row',
    async (user, container) => {
      focusRow(container, 'readme');
      await user.keyboard('{ArrowRight}');
    }
  ],
  ['focus a child row', (user, container) => focusRow(container, 'tetris')],
  ['remove the focused row', () => removeItem('tetris')],
  ['disable rows', () => updateTableProps({disabledKeys: ['mario', 'ps']})],
  ['only disable selection', () => updateTableProps({disabledBehavior: 'selection'})],
  ['add a row action', () => updateTableProps({onRowAction: () => {}})],
  [
    'clear the selection',
    async (user, container) => {
      focusRow(container, 'apps');
      await user.keyboard('{Escape}');
    }
  ],
  ['select a row again', (user, container) => user.click(checkbox(container, 'apps'))],
  ['add a cell action', () => updateTableProps({onCellAction: () => {}})],
  [
    'press a cell with a cell action',
    (user, container) => user.click(within(row(container, 'premiere')).getByText('Premiere'))
  ],
  ['remove the cell action', () => updateTableProps({onCellAction: undefined})],
  ['select on press up', () => updateTableProps({shouldSelectOnPressUp: true})],
  [
    'press a row without releasing',
    (user, container) =>
      user.pointer({
        keys: '[MouseLeft>]',
        target: within(row(container, 'premiere')).getByText('Premiere')
      })
  ],
  ['release the press', user => user.pointer({keys: '[/MouseLeft]'})],
  ['use replace selection', () => updateTableProps({selectionBehavior: 'replace'})],
  [
    'click a row with replace selection',
    (user, container) => user.click(within(row(container, 'readme')).getByText('README'))
  ],
  ['disallow empty selection', () => updateTableProps({disallowEmptySelection: true})],
  [
    'try to deselect the only selected row',
    (user, container) => user.click(checkbox(container, 'readme'))
  ],
  ['use tab keyboard navigation', () => updateTableProps({keyboardNavigationBehavior: 'tab'})],
  [
    'navigate cells with tab navigation',
    async (user, container) => {
      focusRow(container, 'readme');
      await user.keyboard('{ArrowRight}{ArrowRight}');
    }
  ],
  ['tab within a row', user => user.tab()],
  [
    'press an arrow key inside a cell with tab navigation',
    async (user, container) => {
      act(() => checkbox(container, 'apps').focus());
      await user.keyboard('{ArrowRight}');
    }
  ],
  ['use arrow keyboard navigation', () => updateTableProps({keyboardNavigationBehavior: 'arrow'})],
  [
    'navigate cells with arrow navigation',
    async (user, container) => {
      focusRow(container, 'readme');
      await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
    }
  ],
  [
    'press an arrow key inside a cell with arrow navigation',
    async (user, container) => {
      act(() => checkbox(container, 'apps').focus());
      await user.keyboard('{ArrowRight}');
    }
  ],
  ['use toggle selection', () => updateTableProps({selectionBehavior: 'toggle'})],
  ['allow empty selection', () => updateTableProps({disallowEmptySelection: false})],
  ['use single selection', () => updateTableProps({selectionMode: 'single'})],
  [
    'select a row with single selection',
    (user, container) => user.click(checkbox(container, 'premiere'))
  ],
  ['add a column', () => setState(state => ({...state, columns: [...state.columns, 'id']}))],
  [
    'remove a column',
    () => setState(state => ({...state, columns: state.columns.filter(c => c !== 'date')}))
  ],
  ['change the tree column', () => updateTableProps({treeColumn: 'type'})],
  ['change the tree column back', () => updateTableProps({treeColumn: 'name'})],
  ['change the row header column', () => setState(state => ({...state, rowHeader: 'type'}))],
  ['change the row header column back', () => setState(state => ({...state, rowHeader: 'name'}))],
  ['tab out of the table', user => user.tab()],
  ['tab back into the table', user => user.tab({shift: true})],
  [
    'collapse a row',
    async (user, container) => {
      focusRow(container, 'games');
      await user.keyboard('{ArrowLeft}');
    }
  ],
  ['enable rows', () => updateTableProps({disabledKeys: []})],
  ['disable selection', () => updateTableProps({selectionMode: 'none'})],
  ['empty the table', () => setState(state => ({...state, items: []}))],
  ['refill the table', () => setState(state => ({...state, items: initialState.items}))]
];

async function runSteps(TreeTable, withDragAndDrop) {
  let user = userEvent.setup({delay: null, pointerMap});
  let {container, unmount} = render(<TreeTable withDragAndDrop={withDragAndDrop} />);
  let snapshots = [];
  for (let [name, step] of steps) {
    await step(user, container);
    act(() => jest.runAllTimers());
    snapshots.push([name, serialize(container)]);
  }
  unmount();
  return snapshots;
}

describe('Table render keys', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it.each([false, true])(
    'renders the same as a table without memoization (drag and drop: %s)',
    async withDragAndDrop => {
      let expected = await runSteps(UnmemoizedTreeTable, withDragAndDrop);
      let actual = await runSteps(MemoizedTreeTable, withDragAndDrop);
      for (let i = 0; i < steps.length; i++) {
        expect({step: actual[i][0], dom: actual[i][1]}).toEqual({
          step: expected[i][0],
          dom: expected[i][1]
        });
      }
    }
  );
});
