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
jest.mock('@react-aria/utils/src/scrollIntoView');
import {act, render as renderComponent} from '@react-spectrum/test-utils-internal';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
import {enableTableNestedRows} from '@react-stately/flags';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {tableTests} from './Table.test';
import {theme} from '@react-spectrum/theme-default';

describe('TableView with expandable rows flag on', function () {
  beforeAll(() => {
    enableTableNestedRows();
  });

  tableTests();

  describe('with nested rows', function () {
    let offsetWidth, offsetHeight;

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
      act(() => {jest.runAllTimers();});
    });
    it('can render', function () {
      let columns = [
        {name: 'Foo', key: 'foo'},
        {name: 'Bar', key: 'bar'},
        {name: 'Baz', key: 'baz'}
      ];

      let nestedItems = [
        {foo: 'Lvl 1 Foo 1', bar: 'Lvl 1 Bar 1', baz: 'Lvl 1 Baz 1', childRows: [
          {foo: 'Lvl 2 Foo 1', bar: 'Lvl 2 Bar 1', baz: 'Lvl 2 Baz 1', childRows: [
            {foo: 'Lvl 3 Foo 1', bar: 'Lvl 3 Bar 1', baz: 'Lvl 3 Baz 1'}
          ]},
          {foo: 'Lvl 2 Foo 2', bar: 'Lvl 2 Bar 2', baz: 'Lvl 2 Baz 2'}
        ]}
      ];

      renderComponent(
        <Provider theme={theme}>
          <TableView aria-label="example table with nested rows" UNSTABLE_allowsExpandableRows>
            <TableHeader columns={columns}>
              {column => <Column>{column.name}</Column>}
            </TableHeader>
            <TableBody items={nestedItems}>
              {(item) =>
                (<Row key={item.foo} UNSTABLE_childItems={item.childRows}>
                  {(key) => {
                    return <Cell>{item[key]}</Cell>;
                  }}
                </Row>)
              }
            </TableBody>
          </TableView>
        </Provider>
      );
    });
  });
});
