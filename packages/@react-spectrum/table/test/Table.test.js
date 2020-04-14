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

import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {cleanup, render, within} from '@testing-library/react';
import React from 'react';

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

describe('Table', function () {
  afterEach(() => {
    cleanup();
  });

  it('renders a static table', function () {
    let {getByRole, getByText} = render(
      <Table>
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
      </Table>
    );
    
    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(4);

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Foo');
    expect(headers[2]).toHaveTextContent('Bar');
    expect(headers[3]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', `${getByText('Foo').id} ${getByText('Foo 1').id} ${getByText('Bar').id} ${getByText('Bar 1').id} ${getByText('Baz').id} ${getByText('Baz 1').id}`);

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', `${getByText('Foo').id} ${getByText('Foo 2').id} ${getByText('Bar').id} ${getByText('Bar 2').id} ${getByText('Baz').id} ${getByText('Baz 2').id}`);
  
    let rowHeaders = within(rowgroups[1]).getAllByRole('rowheader');
    checkbox = within(rowHeaders[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${getByText('Foo').id} ${getByText('Foo 1').id} ${getByText('Bar').id} ${getByText('Bar 1').id} ${getByText('Baz').id} ${getByText('Baz 1').id}`);

    checkbox = within(rowHeaders[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${getByText('Foo').id} ${getByText('Foo 2').id} ${getByText('Bar').id} ${getByText('Bar 2').id} ${getByText('Baz').id} ${getByText('Baz 2').id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(6);
  });

  it('renders a dynamic table', function () {
    let {getByRole, getByText} = render(
      <Table>
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
    );
    
    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(4);

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Foo');
    expect(headers[2]).toHaveTextContent('Bar');
    expect(headers[3]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', `${getByText('Foo').id} ${getByText('Foo 1').id} ${getByText('Bar').id} ${getByText('Bar 1').id} ${getByText('Baz').id} ${getByText('Baz 1').id}`);

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', `${getByText('Foo').id} ${getByText('Foo 2').id} ${getByText('Bar').id} ${getByText('Bar 2').id} ${getByText('Baz').id} ${getByText('Baz 2').id}`);
  
    let rowHeaders = within(rowgroups[1]).getAllByRole('rowheader');
    checkbox = within(rowHeaders[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${getByText('Foo').id} ${getByText('Foo 1').id} ${getByText('Bar').id} ${getByText('Bar 1').id} ${getByText('Baz').id} ${getByText('Baz 1').id}`);

    checkbox = within(rowHeaders[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${getByText('Foo').id} ${getByText('Foo 2').id} ${getByText('Bar').id} ${getByText('Bar 2').id} ${getByText('Baz').id} ${getByText('Baz 2').id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(6);
  });

  it('renders a static table with nested columns', function () {
    let {getByRole, getByText} = render(
      <Table>
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
            <Cell>Test 1</Cell>
            <Cell>Foo 1</Cell>
            <Cell>Bar 1</Cell>
            <Cell>Baz 1</Cell>
          </Row>
          <Row>
            <Cell>Test 2</Cell>
            <Cell>Foo 2</Cell>
            <Cell>Bar 2</Cell>
            <Cell>Baz 2</Cell>
          </Row>
        </TableBody>
      </Table>
    );
    
    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(2);

    let headers = within(headerRows[0]).getAllByRole('columnheader');
    expect(headers).toHaveLength(3);

    expect(headers[0]).toHaveTextContent('');
    expect(headers[0]).toHaveAttribute('colspan', '2');

    expect(headers[1]).toHaveTextContent('Group 1');
    expect(headers[1]).toHaveAttribute('aria-colspan', '2');
    expect(headers[2]).toHaveTextContent('Group 2');

    headers = within(headerRows[1]).getAllByRole('columnheader');
    expect(headers).toHaveLength(5);

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Test');
    expect(headers[2]).toHaveTextContent('Foo');
    expect(headers[3]).toHaveTextContent('Bar');
    expect(headers[4]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText('Test 1').id} ${getByText('Foo').id} ${getByText('Foo 1').id} ${getByText('Bar').id} ${getByText('Bar 1').id} ${getByText('Baz').id} ${getByText('Baz 1').id}`);

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText('Test 2').id} ${getByText('Foo').id} ${getByText('Foo 2').id} ${getByText('Bar').id} ${getByText('Bar 2').id} ${getByText('Baz').id} ${getByText('Baz 2').id}`);
  
    let rowHeaders = within(rowgroups[1]).getAllByRole('rowheader');
    checkbox = within(rowHeaders[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${getByText('Test').id} ${getByText('Test 1').id} ${getByText('Foo').id} ${getByText('Foo 1').id} ${getByText('Bar').id} ${getByText('Bar 1').id} ${getByText('Baz').id} ${getByText('Baz 1').id}`);

    checkbox = within(rowHeaders[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${getByText('Test').id} ${getByText('Test 2').id} ${getByText('Foo').id} ${getByText('Foo 2').id} ${getByText('Bar').id} ${getByText('Bar 2').id} ${getByText('Baz').id} ${getByText('Baz 2').id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(8);
  });

  it('renders a dynamic table with nested columns', function () {
    let {getByRole, getByText} = render(
      <Table>
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
    );
    
    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(3);

    let headers = within(headerRows[0]).getAllByRole('columnheader');
    expect(headers).toHaveLength(2);

    expect(headers[0]).toHaveTextContent('');
    expect(headers[0]).toHaveAttribute('colspan', '2');
    expect(headers[1]).toHaveTextContent('Tiered One Header');
    expect(headers[1]).toHaveAttribute('aria-colspan', '4');

    headers = within(headerRows[1]).getAllByRole('columnheader');
    expect(headers).toHaveLength(4);

    expect(headers[0]).toHaveTextContent('');
    expect(headers[0]).toHaveAttribute('colspan', '2');
    expect(headers[1]).toHaveTextContent('Tier Two Header A');
    expect(headers[1]).toHaveAttribute('aria-colspan', '2');
    expect(headers[2]).toHaveTextContent('');
    expect(headers[3]).toHaveTextContent('Tier Two Header B');

    headers = within(headerRows[2]).getAllByRole('columnheader');
    expect(headers).toHaveLength(6);

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Test');
    expect(headers[2]).toHaveTextContent('Foo');
    expect(headers[3]).toHaveTextContent('Bar');
    expect(headers[4]).toHaveTextContent('Yay');
    expect(headers[5]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText('Test 1').id} ${getByText('Foo').id} ${getByText('Foo 1').id} ${getByText('Bar').id} ${getByText('Bar 1').id} ${getByText('Yay').id} ${getByText('Yay 1').id} ${getByText('Baz').id} ${getByText('Baz 1').id}`);

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText('Test 2').id} ${getByText('Foo').id} ${getByText('Foo 2').id} ${getByText('Bar').id} ${getByText('Bar 2').id} ${getByText('Yay').id} ${getByText('Yay 2').id} ${getByText('Baz').id} ${getByText('Baz 2').id}`);
  
    let rowHeaders = within(rowgroups[1]).getAllByRole('rowheader');
    checkbox = within(rowHeaders[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${getByText('Test').id} ${getByText('Test 1').id} ${getByText('Foo').id} ${getByText('Foo 1').id} ${getByText('Bar').id} ${getByText('Bar 1').id} ${getByText('Yay').id} ${getByText('Yay 1').id} ${getByText('Baz').id} ${getByText('Baz 1').id}`);

    checkbox = within(rowHeaders[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${getByText('Test').id} ${getByText('Test 2').id} ${getByText('Foo').id} ${getByText('Foo 2').id} ${getByText('Bar').id} ${getByText('Bar 2').id} ${getByText('Yay').id} ${getByText('Yay 2').id} ${getByText('Baz').id} ${getByText('Baz 2').id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(10);
  });
});
