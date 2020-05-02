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

import {action} from '@storybook/addon-actions';
import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {CRUDExample} from './CRUDExample';
import {Link} from '@react-spectrum/link';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';

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
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 3', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 4', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 5', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 6', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 7', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 8', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];

let manyColunns = [];
for (let i = 0; i < 100; i++) {
  manyColunns.push({name: 'Column ' + i, key: 'C' + i});
}

let manyRows = [];
for (let i = 0; i < 1000; i++) {
  let row = {key: 'R' + i};
  for (let j = 0; j < 100; j++) {
    row['C' + j] = `${i}, ${j}`;
  }

  manyRows.push(row);
}

let onSelectionChange = action('onSelectionChange');
storiesOf('Table', module)
  .add(
    'static',
    () => (
      <Table width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column key="foo">Foo</Column>
          <Column key="bar">Bar</Column>
          <Column key="baz">Baz</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'dynamic',
    () => (
      <Table width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={columns} columnKey="key">
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items} itemKey="foo">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'static with nested columns',
    () => (
      <Table width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column key="test">Test</Column>
          <Column title="Group 1">
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
          </Column>
          <Column title="Group 2">
            <Column key="baz">Baz</Column>
          </Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Test1</Cell>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>Test2</Cell>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'dynamic with nested columns',
    () => (
      <Table width={700} height={300} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={nestedColumns} columnKey="key">
          {column =>
            <Column childColumns={column.children}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items} itemKey="foo">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'focusable cells',
    () => (
      <Table width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column key="foo">Foo</Column>
          <Column key="bar">Bar</Column>
          <Column key="baz">baz</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell><Switch aria-label="Foo" /></Cell>
            <Cell><Link><a href="https://google.com" target="_blank">Google</a></Link></Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell><Switch aria-label="Foo" /></Cell>
            <Cell><Link><a href="https://yahoo.com" target="_blank">Yahoo</a></Link></Cell>
            <Cell>Three</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'many columns and rows',
    () => (
      <Table width={700} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={manyColunns} columnKey="key">
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyRows} itemKey="key">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'isQuiet, many columns and rows',
    () => (
      <Table width={700} height={200} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={manyColunns} columnKey="key">
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyRows} itemKey="key">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'column widths and dividers',
    () => (
      <Table width={500} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'isQuiet, column widths and dividers',
    () => (
      <Table width={500} height={200} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'custom isRowHeader labeling',
    () => (
      <Table width={500} height={200} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column isRowHeader>First Name</Column>
          <Column isRowHeader>Last Name</Column>
          <Column>Birthday</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Sam</Cell>
            <Cell>Smith</Cell>
            <Cell>May 3</Cell>
          </Row>
          <Row>
            <Cell>Julia</Cell>
            <Cell>Jones</Cell>
            <Cell>February 10</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'CRUD',
    () => (
      <CRUDExample />
    )
  );
