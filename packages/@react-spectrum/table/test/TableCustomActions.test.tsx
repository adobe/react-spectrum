/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


jest.mock('@react-aria/live-announcer');
import {act, render as renderComponent, within} from '@testing-library/react';
import {ActionButton} from '@react-spectrum/button';
import Add from '@spectrum-icons/workflow/Add';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
import {ColumnSize} from '@react-types/table';
import {ControllingResize} from '../stories/ControllingResize';
import {fireEvent, installPointerEvent, triggerPress, triggerTouch} from '@react-spectrum/test-utils';
import {HidingColumns} from '../stories/HidingColumns';
import {Provider} from '@react-spectrum/provider';
import React, {Key} from 'react';
import {resizingTests} from '@react-aria/table/test/tableResizingTests';
import {Scale} from '@react-types/provider';
import {setInteractionModality} from '@react-aria/interactions';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let nestedColumns = [
  {name: 'Test', key: 'test'},
  {name: 'Tiered One Header', key: 'tier1', children: [
      {name: 'Tier Two Header A', key: 'tier2a', children: [
          {name: 'Foo', key: 'foo'},
          {name: 'Bar', key: 'bar'}
        ]},
      {name: 'Yay', key: 'yay'},
      {name: 'Tier Two Header B', key: 'tier2b', children: [
          {name: 'Baz', key: 'baz'}
        ]}
    ]}
];

let items = [
  {test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];


let manyItems = [];
for (let i = 1; i <= 100; i++) {
  manyItems.push({id: i, foo: 'Foo ' + i, bar: 'Bar ' + i, baz: 'Baz ' + i});
}

let render = (children, scale: Scale = 'medium') => {
  let tree = renderComponent(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );
  // account for table column resizing to do initial pass due to relayout from useTableColumnResizeState render
  act(() => {jest.runAllTimers();});
  return tree;
};

let rerender = (tree, children, scale: Scale = 'medium') => {
  let newTree = tree.rerender(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );
  act(() => {jest.runAllTimers();});
  return newTree;
};
describe('TableView Custom Menu Actions', function () {
  let offsetWidth, offsetHeight;
  let onAction = jest.fn();

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    jest.useFakeTimers();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  afterEach(() => {
    onAction.mockClear();
    act(() => {jest.runAllTimers();});
  });

  describe('dynamic', function () {
    let actions = [
      {
        label: 'Hide',
        id: 'hide'
      },
      {
        label: 'Filter',
        id: 'filter'
      },
      {
        label: 'Delete',
        id: 'delete'
      }
    ];
    describe('pointer', function () {
      it('can trigger a custom action', function () {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader columns={columns}>
              {column => <Column actions={actions} onAction={onAction}>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
          , 'medium');

        // trigger pointer modality
        fireEvent.pointerMove(tree.container);
        let header = tree.getAllByRole('columnheader')[0];
        let menuHeader = within(header).getByRole('button');

        triggerPress(menuHeader);
        act(() => {jest.runAllTimers();});

        let menuItems = tree.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(3);

        triggerPress(menuItems[0]);
        expect(onAction).toHaveBeenCalledWith('hide', 'foo');
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});
        expect(document.activeElement).toBe(menuHeader);
      });

      it('can trigger a custom action even with our actions', function () {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader columns={columns}>
              {column => <Column actions={actions} onAction={onAction} allowsResizing>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
          , 'medium');

        // trigger pointer modality
        fireEvent.pointerMove(tree.container);
        let header = tree.getAllByRole('columnheader')[0];
        let menuHeader = within(header).getByRole('button');

        triggerPress(menuHeader);
        act(() => {jest.runAllTimers();});

        let menuItems = tree.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(4);

        triggerPress(menuItems[0]);
        expect(onAction).not.toHaveBeenCalled();

        fireEvent.keyDown(document.activeElement, {key: 'Escape'});
        fireEvent.keyUp(document.activeElement, {key: 'Escape'});
        act(() => {jest.runAllTimers();});

        triggerPress(menuHeader);
        act(() => {jest.runAllTimers();});

        menuItems = tree.getAllByRole('menuitem');

        triggerPress(menuItems[3]);
        expect(onAction).toHaveBeenCalledWith('delete', 'foo');
        act(() => {jest.runAllTimers();});
      });
    });

    describe('keyboard', function () {
      function pressKey(key) {
        fireEvent.keyDown(document.activeElement, {key});
        fireEvent.keyUp(document.activeElement, {key});
      }
      it('can trigger a custom action', function () {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader columns={columns}>
              {column => <Column actions={actions} onAction={onAction}>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
          , 'medium');

        userEvent.tab();
        let header = tree.getAllByRole('columnheader')[0];
        let menuHeader = within(header).getByRole('button');
        pressKey('ArrowUp');
        expect(document.activeElement).toBe(menuHeader);
        pressKey('Enter');
        act(() => {jest.runAllTimers();});

        let menuItems = tree.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(3);

        pressKey('ArrowDown');
        pressKey('Enter');
        expect(onAction).toHaveBeenCalledWith('filter', 'foo');
      });

      it('can trigger a custom action even with our actions', function () {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader columns={columns}>
              {column => <Column actions={actions} onAction={onAction} allowsResizing>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
          , 'medium');

        userEvent.tab();
        let header = tree.getAllByRole('columnheader')[0];
        let menuHeader = within(header).getByRole('button');
        pressKey('ArrowUp');
        expect(document.activeElement).toBe(menuHeader);
        pressKey('Enter');
        act(() => {jest.runAllTimers();});

        let menuItems = tree.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(4);

        pressKey('Enter');
        expect(onAction).not.toHaveBeenCalled();
        act(() => {jest.runAllTimers();});
        pressKey('Escape');
        act(() => {jest.runAllTimers();});

        pressKey('Enter');
        act(() => {jest.runAllTimers();});

        menuItems = tree.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(4);
        pressKey('ArrowDown');
        pressKey('ArrowDown');
        pressKey('ArrowDown');
        pressKey('Enter');
        expect(onAction).toHaveBeenCalledWith('delete', 'foo');
      });
    });
  });
});


// I'd use tree.getByRole(role, {name: text}) here, but it's unbearably slow.
function getColumn(tree, name) {
  // Find by text, then go up to the element with the cell role.
  let el = tree.getByText(name);
  while (el && !/columnheader/.test(el.getAttribute('role'))) {
    el = el.parentElement;
  }

  return el;
}

