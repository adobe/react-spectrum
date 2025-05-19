/*
 * Copyright 2025 Adobe. All rights reserved.
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
jest.mock('@react-aria/utils/src/scrollIntoView');
import {act, render} from '@react-spectrum/test-utils-internal';
import {
  Cell,
  Column,
  MenuItem,
  MenuSection,
  Row,
  TableBody,
  TableHeader,
  TableView,
  Text
} from '../src';
import Filter from '../s2wf-icons/S2_Icon_Filter_20_N.svg';
import React from 'react';
import {User} from '@react-aria/test-utils';

// @ts-ignore
window.getComputedStyle = (el) => el.style;

describe('TableView', () => {
  let offsetWidth, offsetHeight;
  let testUtilUser = new User({advanceTimer: jest.advanceTimersByTime});
  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 400);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 200);
    jest.useFakeTimers();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });

  let columns = [
    {name: 'Foo', id: 'foo', isRowHeader: true},
    {name: 'Bar', id: 'bar'},
    {name: 'Baz', id: 'baz'},
    {name: 'Yah', id: 'yah'}
  ];

  let items = [
    {id: 1, foo: 'Foo 1', bar: 'Bar 1', baz: 'Baz 1', yah: 'Yah long long long 1'},
    {id: 2, foo: 'Foo 2', bar: 'Bar 2', baz: 'Baz 2', yah: 'Yah long long long 2'},
    {id: 3, foo: 'Foo 3', bar: 'Bar 3', baz: 'Baz 3', yah: 'Yah long long long 3'},
    {id: 4, foo: 'Foo 4', bar: 'Bar 4', baz: 'Baz 4', yah: 'Yah long long long 4'},
    {id: 5, foo: 'Foo 5', bar: 'Bar 5', baz: 'Baz 5', yah: 'Yah long long long 5'},
    {id: 6, foo: 'Foo 6', bar: 'Bar 6', baz: 'Baz 6', yah: 'Yah long long long 6'},
    {id: 7, foo: 'Foo 7', bar: 'Bar 7', baz: 'Baz 7', yah: 'Yah long long long 7'},
    {id: 8, foo: 'Foo 8', bar: 'Bar 8', baz: 'Baz 8', yah: 'Yah long long long 8'},
    {id: 9, foo: 'Foo 9', bar: 'Bar 9', baz: 'Baz 9', yah: 'Yah long long long 9'},
    {id: 10, foo: 'Foo 10', bar: 'Bar 10', baz: 'Baz 10', yah: 'Yah long long long 10'}
  ];

  it('should render custom menus', async () => {
    let onAction = jest.fn();
    let {getByRole} = render(
      <TableView aria-label="Dynamic table">
        <TableHeader columns={columns}>
          {(column) => (
            <Column
              width={150}
              minWidth={150}
              isRowHeader={column.isRowHeader}
              menuItems={
                <>
                  <MenuSection>
                    <MenuItem onAction={onAction}><Filter /><Text slot="label">Filter</Text></MenuItem>
                  </MenuSection>
                  <MenuSection>
                    <MenuItem><Text slot="label">Hide column</Text></MenuItem>
                    <MenuItem><Text slot="label">Manage columns</Text></MenuItem>
                  </MenuSection>
                </>
              }>{column.name}</Column>
          )}
        </TableHeader>
        <TableBody items={items}>
          {item => (
            <Row id={item.id} columns={columns}>
              {(column) => {
                return <Cell>{item[column.id]}</Cell>;
              }}
            </Row>
          )}
        </TableBody>
      </TableView>
    );

    let tableTester = testUtilUser.createTester('Table', {root: getByRole('grid')});
    await tableTester.triggerColumnHeaderAction({column: 1, action: 0, interactionType: 'keyboard'});
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
