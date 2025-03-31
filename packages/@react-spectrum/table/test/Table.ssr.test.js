/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {testSSR} from '@react-spectrum/test-utils-internal';

describe('Table SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {Provider} from '@react-spectrum/provider';
      import {theme} from '@react-spectrum/theme-default';
      import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
      <Provider theme={theme}>
        <TableView aria-label="Table">
          <TableHeader>
            <Column>Foo</Column>
            <Column>Bar</Column>
            <Column>Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
            <Row>
              <Cell>Foo 2</Cell>
              <Cell>Bar 2</Cell>
              <Cell>Baz 2</Cell>
            </Row>
          </TableBody>
        </TableView>
      </Provider>
    `);
  });
});

describe('Table Nested Rows SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {Provider} from '@react-spectrum/provider';
      import {theme} from '@react-spectrum/theme-default';
      import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
      import {enableTableNestedRows} from '@react-stately/flags';
      enableTableNestedRows();

      let nestedItems = [
        {foo: 'Lvl 1 Foo 1', bar: 'Lvl 1 Bar 1', baz: 'Lvl 1 Baz 1', childRows: [
          {foo: 'Lvl 2 Foo 1', bar: 'Lvl 2 Bar 1', baz: 'Lvl 2 Baz 1', childRows: [
            {foo: 'Lvl 3 Foo 1', bar: 'Lvl 3 Bar 1', baz: 'Lvl 3 Baz 1'}
          ]},
          {foo: 'Lvl 2 Foo 2', bar: 'Lvl 2 Bar 2', baz: 'Lvl 2 Baz 2'}
        ]}
      ];

      let columns = [
        {name: 'Foo', key: 'foo'},
        {name: 'Bar', key: 'bar'},
        {name: 'Baz', key: 'baz'}
      ];

      <Provider theme={theme}>
        <TableView aria-label="example table with nested rows" UNSTABLE_allowsExpandableRows width={500} height={200} >
          <TableHeader columns={columns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={nestedItems}>
            {(item) =>
              (<Row key={item.foo} UNSTABLE_childItems={item.childRows}>
                {(key) => {
                  return <Cell>{item[key.toString()]}</Cell>;
                }}
              </Row>)
            }
          </TableBody>
        </TableView>
      </Provider>
    `);
  });
});

// TODO: selectionMode="multiple" errors
describe('Table Static SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {Provider} from '@react-spectrum/provider';
      import {theme} from '@react-spectrum/theme-default';
      import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
      import {enableTableNestedRows} from '@react-stately/flags';
      enableTableNestedRows();

      <Provider theme={theme}>
        <TableView aria-label="Example table with static contents">
          <TableHeader>
            <Column>Name</Column>
            <Column>Type</Column>
            <Column>Date Modified</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Games</Cell>
              <Cell>File folder</Cell>
              <Cell>6/7/2020</Cell>
            </Row>
            <Row>
              <Cell>Program Files</Cell>
              <Cell>File folder</Cell>
              <Cell>4/7/2021</Cell>
            </Row>
            <Row>
              <Cell>bootmgr</Cell>
              <Cell>System file</Cell>
              <Cell>11/20/2010</Cell>
            </Row>
            <Row>
              <Cell>log.txt</Cell>
              <Cell>Text Document</Cell>
              <Cell>1/18/2016</Cell>
            </Row>
          </TableBody>
        </TableView>
      </Provider>
    `);
  });
});
