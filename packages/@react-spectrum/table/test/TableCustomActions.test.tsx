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
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
import Delete from '@spectrum-icons/workflow/Delete';
import Deselect from '@spectrum-icons/workflow/Deselect';
import Filter from '@spectrum-icons/workflow/Filter';
import {fireEvent, triggerPress} from '@react-spectrum/test-utils';
import {Item, Section} from '@react-stately/collections';
import {Keyboard, Text} from '@react-spectrum/text';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {Scale} from '@react-types/provider';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let items = [
  {test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];

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
    let actions = (
      <>
        <Item key="hide">Hide</Item>
        <Item key="filter">Filter</Item>
        <Item key="delete">Delete</Item>
      </>
    );
    let sectionedActions = (
      <Section>
        <Item key="hide">Hide</Item>
        <Item key="filter">Filter</Item>
        <Item key="delete">Delete</Item>
      </Section>
    );
    let complexActions = (
      <Section>
        <Item key="hide" textValue="Hide">
          <Deselect />
          <Text>Hide</Text>
          <Keyboard>⌘X</Keyboard>
        </Item>
        <Item key="filter" textValue="Filter">
          <Filter />
          <Text>Hide</Text>
          <Keyboard>⌘Y</Keyboard>
        </Item>
        <Item key="delete" textValue="Delete">
          <Delete />
          <Text>Delete</Text>
          <Keyboard>⌘Z</Keyboard>
        </Item>
      </Section>
    );
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

      it('can trigger a custom action inside a section', function () {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader columns={columns}>
              {column => <Column actions={sectionedActions} onAction={onAction}>{column.name}</Column>}
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

        triggerPress(menuItems[2]);
        expect(onAction).toHaveBeenCalledWith('delete', 'foo');
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

      it('can trigger a custom action in a section even with our actions', function () {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader columns={columns}>
              {column => <Column actions={sectionedActions} onAction={onAction} allowsResizing>{column.name}</Column>}
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

      it('can trigger actions on complex custom actions', function () {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader columns={columns}>
              {column => <Column actions={complexActions} onAction={onAction} allowsResizing>{column.name}</Column>}
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
