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

import {act, fireEvent, render as renderComponent, within} from '@testing-library/react';
import {ActionButton} from '@react-spectrum/button';
import Add from '@spectrum-icons/workflow/Add';
import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {CRUDExample} from '../stories/CRUDExample';
import {getFocusableTreeWalker} from '@react-aria/focus';
import {HidingColumns} from '../stories/HidingColumns';
import {Link} from '@react-spectrum/link';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {Switch} from '@react-spectrum/switch';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import {typeText} from '@react-spectrum/test-utils';
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

describe('Table', function () {
  let offsetWidth, offsetHeight;
  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
    jest.useFakeTimers();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  let render = (children, scale = 'medium') => renderComponent(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );

  let rerender = (tree, children, scale = 'medium') => tree.rerender(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );

  // I'd use tree.getByRole(role, {name: text}) here, but it's unbearably slow.
  let getCell = (tree, text) => {
    // Find by text, then go up to the element with the cell role.
    let el = tree.getByText(text);
    while (el && !/gridcell|rowheader|columnheader/.test(el.getAttribute('role'))) {
      el = el.parentElement;
    }

    return el;
  };

  it('renders a static table', function () {
    let {getByRole} = render(
      <Table aria-label="Table" data-testid="test">
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
    expect(grid).toHaveAttribute('aria-label', 'Table');
    expect(grid).toHaveAttribute('data-testid', 'test');

    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '3');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');

    let headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');

    for (let header of headers) {
      expect(header).not.toHaveAttribute('aria-sort');
    }

    expect(headers[0]).toHaveTextContent('Foo');
    expect(headers[1]).toHaveTextContent('Bar');
    expect(headers[2]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '2');
    expect(rows[1]).toHaveAttribute('aria-rowindex', '3');

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '1');

    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 2');
    expect(rowheader).toHaveAttribute('aria-colindex', '1');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);


    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(4);

    expect(cells[0]).toHaveAttribute('aria-colindex', '2');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '2');
    expect(cells[3]).toHaveAttribute('aria-colindex', '3');
  });

  it('renders a static table with selection', function () {
    let {getByRole} = render(
      <Table aria-label="Table" data-testid="test" selectionMode="multiple">
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
    expect(grid).toHaveAttribute('aria-label', 'Table');
    expect(grid).toHaveAttribute('data-testid', 'test');
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '4');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');

    let headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');
    expect(headers[3]).toHaveAttribute('aria-colindex', '4');

    for (let header of headers) {
      expect(header).not.toHaveAttribute('aria-sort');
    }

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Foo');
    expect(headers[2]).toHaveTextContent('Bar');
    expect(headers[3]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '2');
    expect(rows[1]).toHaveAttribute('aria-rowindex', '3');

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);

    checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 2');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);


    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(6);

    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '4');
    expect(cells[3]).toHaveAttribute('aria-colindex', '1');
    expect(cells[4]).toHaveAttribute('aria-colindex', '3');
    expect(cells[5]).toHaveAttribute('aria-colindex', '4');
  });

  it('renders a dynamic table', function () {
    let {getByRole} = render(
      <Table aria-label="Table">
        <TableHeader columns={columns}>
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '3');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');

    let headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');

    expect(headers[0]).toHaveTextContent('Foo');
    expect(headers[1]).toHaveTextContent('Bar');
    expect(headers[2]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '1');

    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 2');
    expect(rowheader).toHaveAttribute('aria-colindex', '1');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(4);

    expect(cells[0]).toHaveAttribute('aria-colindex', '2');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '2');
    expect(cells[3]).toHaveAttribute('aria-colindex', '3');
  });

  it('renders a dynamic table with selection', function () {
    let {getByRole} = render(
      <Table aria-label="Table" selectionMode="multiple">
        <TableHeader columns={columns}>
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '4');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');

    let headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');
    expect(headers[3]).toHaveAttribute('aria-colindex', '4');

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Foo');
    expect(headers[2]).toHaveTextContent('Bar');
    expect(headers[3]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);

    checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 2');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);


    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(6);

    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '4');
    expect(cells[3]).toHaveAttribute('aria-colindex', '1');
    expect(cells[4]).toHaveAttribute('aria-colindex', '3');
    expect(cells[5]).toHaveAttribute('aria-colindex', '4');
  });

  it('renders a static table with nested columns', function () {
    let {getByRole} = render(
      <Table aria-label="Table" selectionMode="multiple">
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
    expect(grid).toHaveAttribute('aria-rowcount', '4');
    expect(grid).toHaveAttribute('aria-colcount', '5');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(2);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');
    expect(headerRows[1]).toHaveAttribute('aria-rowindex', '2');

    let headers = within(headerRows[0]).getAllByRole('columnheader');
    let placeholderCells = within(headerRows[0]).getAllByRole('gridcell');
    expect(headers).toHaveLength(2);
    expect(placeholderCells).toHaveLength(1);

    expect(placeholderCells[0]).toHaveTextContent('');
    expect(placeholderCells[0]).toHaveAttribute('aria-colspan', '2');
    expect(placeholderCells[0]).toHaveAttribute('aria-colindex', '1');

    expect(headers[0]).toHaveTextContent('Group 1');
    expect(headers[0]).toHaveAttribute('aria-colspan', '2');
    expect(headers[0]).toHaveAttribute('aria-colindex', '3');
    expect(headers[1]).toHaveTextContent('Group 2');
    expect(headers[1]).toHaveAttribute('aria-colindex', '5');

    headers = within(headerRows[1]).getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');
    expect(headers[3]).toHaveAttribute('aria-colindex', '4');
    expect(headers[4]).toHaveAttribute('aria-colindex', '5');

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Test');
    expect(headers[2]).toHaveTextContent('Foo');
    expect(headers[3]).toHaveTextContent('Bar');
    expect(headers[4]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Test 1');

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '3');

    checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Test 2');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);
    expect(rows[1]).toHaveAttribute('aria-rowindex', '4');


    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(8);
  });

  it('renders a dynamic table with nested columns', function () {
    let {getByRole} = render(
      <Table aria-label="Table" selectionMode="multiple">
        <TableHeader columns={nestedColumns}>
          {column =>
            <Column childColumns={column.children}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    expect(grid).toHaveAttribute('aria-rowcount', '5');
    expect(grid).toHaveAttribute('aria-colcount', '6');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(3);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');
    expect(headerRows[1]).toHaveAttribute('aria-rowindex', '2');
    expect(headerRows[2]).toHaveAttribute('aria-rowindex', '3');

    let headers = within(headerRows[0]).getAllByRole('columnheader');
    let placeholderCells = within(headerRows[0]).getAllByRole('gridcell');
    expect(headers).toHaveLength(1);
    expect(placeholderCells).toHaveLength(1);

    expect(placeholderCells[0]).toHaveTextContent('');
    expect(placeholderCells[0]).toHaveAttribute('aria-colspan', '2');
    expect(placeholderCells[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[0]).toHaveTextContent('Tiered One Header');
    expect(headers[0]).toHaveAttribute('aria-colspan', '4');
    expect(headers[0]).toHaveAttribute('aria-colindex', '3');

    headers = within(headerRows[1]).getAllByRole('columnheader');
    placeholderCells = within(headerRows[1]).getAllByRole('gridcell');
    expect(headers).toHaveLength(2);
    expect(placeholderCells).toHaveLength(2);

    expect(placeholderCells[0]).toHaveTextContent('');
    expect(placeholderCells[0]).toHaveAttribute('aria-colspan', '2');
    expect(placeholderCells[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[0]).toHaveTextContent('Tier Two Header A');
    expect(headers[0]).toHaveAttribute('aria-colspan', '2');
    expect(headers[0]).toHaveAttribute('aria-colindex', '3');
    expect(placeholderCells[1]).toHaveTextContent('');
    expect(placeholderCells[1]).toHaveAttribute('aria-colindex', '5');
    expect(headers[1]).toHaveTextContent('Tier Two Header B');
    expect(headers[1]).toHaveAttribute('aria-colindex', '6');

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

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Test 1');

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '4');

    checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Test 2');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);
    expect(rows[1]).toHaveAttribute('aria-rowindex', '5');


    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(10);
  });

  it('renders a table with multiple row headers', function () {
    let {getByRole} = render(
      <Table aria-label="Table" selectionMode="multiple">
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
    );

    let grid = getByRole('grid');
    let rowgroups = within(grid).getAllByRole('rowgroup');
    let rows = within(rowgroups[1]).getAllByRole('row');

    let rowheaders = within(rows[0]).getAllByRole('rowheader');
    expect(rowheaders).toHaveLength(2);
    expect(rowheaders[0]).toHaveTextContent('Sam');
    expect(rowheaders[1]).toHaveTextContent('Smith');

    expect(rows[0]).toHaveAttribute('aria-labelledby', `${rowheaders[0].id} ${rowheaders[1].id}`);

    let checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheaders[0].id} ${rowheaders[1].id}`);

    rowheaders = within(rows[1]).getAllByRole('rowheader');
    expect(rowheaders).toHaveLength(2);
    expect(rowheaders[0]).toHaveTextContent('Julia');
    expect(rowheaders[1]).toHaveTextContent('Jones');

    expect(rows[1]).toHaveAttribute('aria-labelledby', `${rowheaders[0].id} ${rowheaders[1].id}`);

    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheaders[0].id} ${rowheaders[1].id}`);
  });

  describe('keyboard focus', function () {
    // locale is being set here, since we can't nest them, use original render function
    let renderTable = (locale = 'en-US') => renderComponent(
      <Provider locale={locale} theme={theme}>
        <Table aria-label="Table">
          <TableHeader columns={columns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={items}>
            {item =>
              (<Row key={item.foo}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>)
            }
          </TableBody>
        </Table>
      </Provider>
    );

    // locale is being set here, since we can't nest them, use original render function
    let renderNested = (locale = 'en-US') => renderComponent(
      <Provider locale={locale} theme={theme}>
        <Table aria-label="Table">
          <TableHeader columns={nestedColumns}>
            {column =>
              <Column childColumns={column.children}>{column.name}</Column>
            }
          </TableHeader>
          <TableBody items={items}>
            {item =>
              (<Row key={item.foo}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>)
            }
          </TableBody>
        </Table>
      </Provider>
    );

    let renderMany = () => render(
      <Table aria-label="Table">
        <TableHeader columns={columns}>
          {column =>
            <Column>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyItems}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let focusCell = (tree, text) => act(() => getCell(tree, text).focus());
    let moveFocus = (key, opts = {}) => {fireEvent.keyDown(document.activeElement, {key, ...opts});};

    describe('ArrowRight', function () {
      it('should move focus to the next cell in a row with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Baz 1'));
      });

      it('should move focus to the previous cell in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Foo 1'));
      });

      it('should move focus to the row when on the last cell with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Baz 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus to the row when on the first cell with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Foo 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus from the row to the first cell with ArrowRight', function () {
        let tree = renderTable();
        act(() => {tree.getAllByRole('row')[1].focus();});
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Foo 1'));
      });

      it('should move focus from the row to the last cell with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        act(() => {tree.getAllByRole('row')[1].focus();});
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Baz 1'));
      });

      it('should move to the next column header in a row with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Baz'));
      });

      it('should move to the previous column header in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Foo'));
      });

      it('should move to the next nested column header in a row with ArrowRight', function () {
        let tree = renderNested();
        focusCell(tree, 'Tier Two Header A');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Tier Two Header B'));
      });

      it('should move to the previous nested column header in a row with ArrowRight in RTL', function () {
        let tree = renderNested('ar-AE');
        focusCell(tree, 'Tier Two Header B');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Tier Two Header A'));
      });

      it('should move to the first column header when focus is on the last column with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Baz');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Foo'));
      });

      it('should move to the last column header when focus is on the first column with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Foo');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(tree, 'Baz'));
      });
    });

    describe('ArrowLeft', function () {
      it('should move focus to the previous cell in a row with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Foo 1'));
      });

      it('should move focus to the next cell in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Baz 1'));
      });

      it('should move focus to the row when on the first cell with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Foo 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus to the row when on the last cell with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Baz 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus from the row to the last cell with ArrowLeft', function () {
        let tree = renderTable();
        act(() => {tree.getAllByRole('row')[1].focus();});
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Baz 1'));
      });

      it('should move focus from the row to the first cell with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        act(() => {tree.getAllByRole('row')[1].focus();});
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Foo 1'));
      });

      it('should move to the previous column header in a row with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Foo'));
      });

      it('should move to the next column header in a row with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Baz'));
      });

      it('should move to the previous nested column header in a row with ArrowLeft', function () {
        let tree = renderNested();
        focusCell(tree, 'Tier Two Header B');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Tier Two Header A'));
      });

      it('should move to the next nested column header in a row with ArrowLeft in RTL', function () {
        let tree = renderNested('ar-AE');
        focusCell(tree, 'Tier Two Header A');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Tier Two Header B'));
      });

      it('should move to the last column header when focus is on the first column with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Foo');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Baz'));
      });

      it('should move to the first column header when focus is on the last column with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Baz');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(tree, 'Foo'));
      });
    });

    describe('ArrowUp', function () {
      it('should move focus to the cell above with ArrowUp', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 2');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(tree, 'Bar 1'));
      });

      it('should move focus to the row above with ArrowUp', function () {
        let tree = renderTable();
        act(() => {tree.getAllByRole('row')[2].focus();});
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus to the column header above a cell in the first row with ArrowUp', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(tree, 'Bar'));
      });

      it('should move focus to the column header above the first row with ArrowUp', function () {
        let tree = renderTable();
        act(() => {tree.getAllByRole('row')[1].focus();});
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(tree, 'Foo'));
      });

      it('should move focus to the parent column header with ArrowUp', function () {
        let tree = renderNested();
        focusCell(tree, 'Bar');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(tree, 'Tier Two Header A'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(tree, 'Tiered One Header'));
        // do nothing when at the top
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(tree, 'Tiered One Header'));
      });
    });

    describe('ArrowDown', function () {
      it('should move focus to the cell below with ArrowDown', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(tree, 'Bar 2'));
      });

      it('should move focus to the row below with ArrowDown', function () {
        let tree = renderTable();
        act(() => {tree.getAllByRole('row')[1].focus();});
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);
      });

      it('should move focus to the child column header with ArrowDown', function () {
        let tree = renderNested();
        focusCell(tree, 'Tiered One Header');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(tree, 'Tier Two Header A'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(tree, 'Foo'));
      });

      it('should move focus to the cell below a column header with ArrowDown', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(tree, 'Bar 1'));
      });
    });

    describe('Home', function () {
      it('should focus the first cell in a row with Home', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('Home');
        expect(document.activeElement).toBe(getCell(tree, 'Foo 1'));
      });

      it('should focus the first cell in the first row with ctrl + Home', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 2');
        moveFocus('Home', {ctrlKey: true});
        expect(document.activeElement).toBe(getCell(tree, 'Foo 1'));
      });

      it('should focus the first row with Home', function () {
        let tree = renderTable();
        act(() => {tree.getAllByRole('row')[2].focus();});
        moveFocus('Home');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });
    });

    describe('End', function () {
      it('should focus the last cell in a row with End', function () {
        let tree = renderTable();
        focusCell(tree, 'Foo 1');
        moveFocus('End');
        expect(document.activeElement).toBe(getCell(tree, 'Baz 1'));
      });

      it('should focus the last cell in the last row with ctrl + End', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('End', {ctrlKey: true});
        expect(document.activeElement).toBe(getCell(tree, 'Baz 2'));
      });

      it('should focus the last row with End', function () {
        let tree = renderTable();
        act(() => {tree.getAllByRole('row')[1].focus();});
        moveFocus('End');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);
      });
    });

    describe('PageDown', function () {
      it('should focus the cell a page below', function () {
        let tree = renderMany();
        focusCell(tree, 'Foo 1');
        moveFocus('PageDown');
        expect(document.activeElement).toBe(getCell(tree, 'Foo 25'));
        moveFocus('PageDown');
        expect(document.activeElement).toBe(getCell(tree, 'Foo 49'));
      });

      it('should focus the row a page below', function () {
        let tree = renderMany();
        act(() => {tree.getAllByRole('row')[1].focus();});
        moveFocus('PageDown');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[25]);
      });
    });

    describe('PageUp', function () {
      it('should focus the cell a page below', function () {
        let tree = renderMany();
        focusCell(tree, 'Foo 25');
        moveFocus('PageUp');
        expect(document.activeElement).toBe(getCell(tree, 'Foo 1'));
      });

      it('should focus the row a page below', function () {
        let tree = renderMany();
        act(() => {tree.getAllByRole('row')[25].focus();});
        moveFocus('PageUp');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });
    });

    describe('type to select', function () {
      let renderTypeSelect = () => render(
        <Table aria-label="Table" selectionMode="none">
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
            <Row>
              <Cell>John</Cell>
              <Cell>Doe</Cell>
              <Cell>December 12</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      it('focuses cell by typing letters in rapid succession', function () {
        let tree = renderTypeSelect();
        focusCell(tree, 'Sam');

        moveFocus('J');
        expect(document.activeElement).toBe(getCell(tree, 'Julia'));

        moveFocus('o');
        expect(document.activeElement).toBe(getCell(tree, 'Jones'));

        moveFocus('h');
        expect(document.activeElement).toBe(getCell(tree, 'John'));
      });

      it('matches against all row header cells', function () {
        let tree = renderTypeSelect();
        focusCell(tree, 'Sam');

        moveFocus('D');
        expect(document.activeElement).toBe(getCell(tree, 'Doe'));
      });

      it('non row header columns don\'t match', function () {
        let tree = renderTypeSelect();
        focusCell(tree, 'Sam');

        moveFocus('F');
        expect(document.activeElement).toBe(getCell(tree, 'Sam'));
      });

      it('focuses row by typing letters in rapid succession', function () {
        let tree = renderTypeSelect();
        act(() => {tree.getAllByRole('row')[1].focus();});

        moveFocus('J');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);

        moveFocus('o');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);

        moveFocus('h');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[3]);
      });

      it('matches row against all row header cells', function () {
        let tree = renderTypeSelect();
        act(() => {tree.getAllByRole('row')[1].focus();});

        moveFocus('D');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[3]);
      });

      it('resets the search text after a timeout', function () {
        let tree = renderTypeSelect();
        focusCell(tree, 'Sam');

        moveFocus('J');
        expect(document.activeElement).toBe(getCell(tree, 'Julia'));

        act(() => {jest.runAllTimers();});

        moveFocus('J');
        expect(document.activeElement).toBe(getCell(tree, 'Julia'));
      });

      it('wraps around when reaching the end of the collection', function () {
        let tree = renderTypeSelect();
        focusCell(tree, 'Sam');

        moveFocus('J');
        expect(document.activeElement).toBe(getCell(tree, 'Julia'));

        moveFocus('o');
        expect(document.activeElement).toBe(getCell(tree, 'Jones'));

        moveFocus('h');
        expect(document.activeElement).toBe(getCell(tree, 'John'));

        act(() => {jest.runAllTimers();});

        moveFocus('J');
        expect(document.activeElement).toBe(getCell(tree, 'John'));

        moveFocus('u');
        expect(document.activeElement).toBe(getCell(tree, 'Julia'));
      });

      it('wraps around when no items past the current one match', function () {
        let tree = renderTypeSelect();
        focusCell(tree, 'Sam');

        moveFocus('J');
        expect(document.activeElement).toBe(getCell(tree, 'Julia'));

        act(() => {jest.runAllTimers();});

        moveFocus('S');
        expect(document.activeElement).toBe(getCell(tree, 'Sam'));
      });
    });

    describe('focus marshalling', function () {
      let renderFocusable = () => render(
        <>
          <input data-testid="before" />
          <Table aria-label="Table" selectionMode="multiple">
            <TableHeader>
              <Column>Foo</Column>
              <Column>Bar</Column>
              <Column>baz</Column>
            </TableHeader>
            <TableBody>
              <Row>
                <Cell textValue="Foo 1"><Switch aria-label="Foo 1" /></Cell>
                <Cell textValue="Google"><Link><a href="https://google.com" target="_blank">Google</a></Link></Cell>
                <Cell>Baz 1</Cell>
              </Row>
              <Row>
                <Cell textValue="Foo 2"><Switch aria-label="Foo 2" /></Cell>
                <Cell textValue="Yahoo"><Link><a href="https://yahoo.com" target="_blank">Yahoo</a></Link></Cell>
                <Cell>Baz 2</Cell>
              </Row>
            </TableBody>
          </Table>
          <input data-testid="after" />
        </>
      );

      it('should marshall focus to the focusable element inside a cell', function () {
        let tree = renderFocusable();
        focusCell(tree, 'Baz 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);

        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('checkbox')[2]);

        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getAllByRole('checkbox')[1]);

        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getAllByRole('checkbox')[0]);
      });

      it('should support keyboard navigation after pressing focusable element inside a cell', function () {
        let tree = renderFocusable();
        triggerPress(tree.getAllByRole('switch')[0]);
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);
      });

      it('should marshall focus to the child on press of the cell', function () {
        let tree = renderFocusable();
        triggerPress(tree.getAllByRole('rowheader')[0]);
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);
      });

      it('should move focus to the first row when tabbing into the table from the start', function () {
        let tree = renderFocusable();

        let table = tree.getByRole('grid');
        expect(table).toHaveAttribute('tabIndex', '0');

        let before = tree.getByTestId('before');
        act(() => before.focus());

        // Simulate tabbing to the first "tabbable" item inside the table
        fireEvent.keyDown(before, {key: 'Tab'});
        act(() => {within(table).getAllByRole('switch')[0].focus();});
        fireEvent.keyUp(before, {key: 'Tab'});

        expect(document.activeElement).toBe(within(table).getAllByRole('row')[1]);
      });

      it('should move focus to the last row when tabbing into the table from the end', function () {
        let tree = renderFocusable();

        let table = tree.getByRole('grid');
        expect(table).toHaveAttribute('tabIndex', '0');

        let after = tree.getByTestId('after');
        act(() => after.focus());

        // Simulate tabbing to the last "tabbable" item inside the table
        act(() => {
          fireEvent.keyDown(after, {key: 'Tab', shiftKey: true});
          within(table).getAllByRole('link')[1].focus();
          fireEvent.keyUp(after, {key: 'Tab', shiftKey: true});
        });

        expect(document.activeElement).toBe(within(table).getAllByRole('row')[2]);
      });

      it('should move focus to the last focused cell when tabbing into the table from the start', function () {
        let tree = renderFocusable();

        let table = tree.getByRole('grid');
        expect(table).toHaveAttribute('tabIndex', '0');

        let baz1 = getCell(tree, 'Baz 1');
        act(() => baz1.focus());

        expect(table).toHaveAttribute('tabIndex', '-1');

        let before = tree.getByTestId('before');
        act(() => before.focus());

        // Simulate tabbing to the first "tabbable" item inside the table
        fireEvent.keyDown(before, {key: 'Tab'});
        act(() => {within(table).getAllByRole('switch')[0].focus();});
        fireEvent.keyUp(before, {key: 'Tab'});

        expect(document.activeElement).toBe(baz1);
      });

      it('should move focus to the last focused cell when tabbing into the table from the end', function () {
        let tree = renderFocusable();

        let table = tree.getByRole('grid');
        expect(table).toHaveAttribute('tabIndex', '0');

        let baz1 = getCell(tree, 'Baz 1');
        act(() => baz1.focus());

        expect(table).toHaveAttribute('tabIndex', '-1');

        let after = tree.getByTestId('after');
        act(() => after.focus());

        // Simulate tabbing to the last "tabbable" item inside the table
        fireEvent.keyDown(after, {key: 'Tab'});
        act(() => {within(table).getAllByRole('link')[1].focus();});
        fireEvent.keyUp(after, {key: 'Tab'});

        expect(document.activeElement).toBe(baz1);
      });

      it('should move focus after the table when tabbing', function () {
        let tree = renderFocusable();

        triggerPress(tree.getAllByRole('switch')[1]);
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

        // Simulate tabbing within the table
        fireEvent.keyDown(document.activeElement, {key: 'Tab'});
        let walker = getFocusableTreeWalker(document.body, {tabbable: true});
        walker.currentNode = document.activeElement;
        act(() => {walker.nextNode().focus();});
        fireEvent.keyUp(document.activeElement, {key: 'Tab'});

        let after = tree.getByTestId('after');
        expect(document.activeElement).toBe(after);
      });

      it('should move focus after the table when tabbing from the last row', function () {
        let tree = renderFocusable();

        act(() => tree.getAllByRole('row')[2].focus());
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);

        // Simulate tabbing within the table
        act(() => {
          fireEvent.keyDown(document.activeElement, {key: 'Tab'});
          let walker = getFocusableTreeWalker(document.body, {tabbable: true});
          walker.currentNode = document.activeElement;
          walker.nextNode().focus();
          fireEvent.keyUp(document.activeElement, {key: 'Tab'});
        });

        let after = tree.getByTestId('after');
        expect(document.activeElement).toBe(after);
      });

      it('should move focus before the table when shift tabbing', function () {
        let tree = renderFocusable();

        triggerPress(tree.getAllByRole('switch')[1]);
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

        // Simulate shift tabbing within the table
        fireEvent.keyDown(document.activeElement, {key: 'Tab', shiftKey: true});
        let walker = getFocusableTreeWalker(document.body, {tabbable: true});
        walker.currentNode = document.activeElement;
        act(() => {walker.previousNode().focus();});
        fireEvent.keyUp(document.activeElement, {key: 'Tab', shiftKey: true});

        let before = tree.getByTestId('before');
        expect(document.activeElement).toBe(before);
      });
    });

    describe('scrolling', function () {
      it('should scroll to a cell when it is focused', function () {
        let tree = renderMany();
        let body = tree.getByRole('grid').childNodes[1];
        expect(body.scrollTop).toBe(0);

        focusCell(tree, 'Baz 25');
        expect(body.scrollTop).toBe(24);
      });

      it('should scroll to a cell when it is focused off screen', function () {
        let tree = renderMany();
        let body = tree.getByRole('grid').childNodes[1];

        let cell = getCell(tree, 'Baz 5');
        act(() => cell.focus());
        expect(document.activeElement).toBe(cell);
        expect(body.scrollTop).toBe(0);

        // When scrolling the focused item out of view, focus should move to the table itself
        body.scrollTop = 1000;
        fireEvent.scroll(body);

        expect(body.scrollTop).toBe(1000);
        expect(document.activeElement).toBe(tree.getByRole('grid'));
        expect(cell).not.toBeInTheDocument();

        // Moving focus should scroll the new focused item into view
        moveFocus('ArrowLeft');
        expect(body.scrollTop).toBe(164);
        expect(document.activeElement).toBe(getCell(tree, 'Bar 5'));
      });

      it('should not scroll when a column header receives focus', function () {
        let tree = renderMany();
        let body = tree.getByRole('grid').childNodes[1];

        focusCell(tree, 'Baz 5');

        body.scrollTop = 1000;
        fireEvent.scroll(body);

        expect(body.scrollTop).toBe(1000);
        expect(document.activeElement).toBe(tree.getByRole('grid'));

        focusCell(tree, 'Bar');
        expect(document.activeElement).toHaveAttribute('role', 'columnheader');
        expect(document.activeElement).toHaveTextContent('Bar');
        expect(body.scrollTop).toBe(1000);
      });
    });
  });

  describe('selection', function () {
    let renderJSX = (onSelectionChange, items = manyItems) => (
      <Table aria-label="Table" onSelectionChange={onSelectionChange} selectionMode="multiple">
        <TableHeader columns={columns}>
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let renderTable = (onSelectionChange, items = manyItems) => render(renderJSX(onSelectionChange, items));

    let checkSelection = (onSelectionChange, selectedKeys) => {
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(selectedKeys));
    };

    let checkSelectAll = (tree, state = 'indeterminate') => {
      let checkbox = tree.getByLabelText('Select All');
      if (state === 'indeterminate') {
        expect(checkbox.indeterminate).toBe(true);
      } else {
        expect(checkbox.checked).toBe(state === 'checked');
      }
    };

    let checkRowSelection = (rows, selected) => {
      for (let row of rows) {
        expect(row).toHaveAttribute('aria-selected', '' + selected);
      }
    };

    let pressWithKeyboard = (element, key = ' ') => {
      fireEvent.keyDown(element, {key});
      act(() => {element.focus();});
      fireEvent.keyUp(element, {key});
    };

    describe('row selection', function () {
      it('should select a row from checkbox', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        let row = tree.getAllByRole('row')[1];
        expect(row).toHaveAttribute('aria-selected', 'false');
        userEvent.click(within(row).getByRole('checkbox'));

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(row).toHaveAttribute('aria-selected', 'true');
        checkSelectAll(tree);
      });

      it('should select a row by pressing on a cell', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        let row = tree.getAllByRole('row')[1];
        expect(row).toHaveAttribute('aria-selected', 'false');
        triggerPress(getCell(tree, 'Baz 1'));

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(row).toHaveAttribute('aria-selected', 'true');
        checkSelectAll(tree);
      });

      it('should select a row by pressing the Space key on a row', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        let row = tree.getAllByRole('row')[1];
        expect(row).toHaveAttribute('aria-selected', 'false');
        fireEvent.keyDown(row, {key: ' '});

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(row).toHaveAttribute('aria-selected', 'true');
        checkSelectAll(tree);
      });

      it('should select a row by pressing the Enter key on a row', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        let row = tree.getAllByRole('row')[1];
        expect(row).toHaveAttribute('aria-selected', 'false');
        fireEvent.keyDown(row, {key: 'Enter'});

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(row).toHaveAttribute('aria-selected', 'true');
        checkSelectAll(tree);
      });

      it('should select a row by pressing the Space key on a cell', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        let row = tree.getAllByRole('row')[1];
        expect(row).toHaveAttribute('aria-selected', 'false');
        fireEvent.keyDown(getCell(tree, 'Bar 1'), {key: ' '});

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(row).toHaveAttribute('aria-selected', 'true');
        checkSelectAll(tree);
      });

      it('should select a row by pressing the Enter key on a cell', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        let row = tree.getAllByRole('row')[1];
        expect(row).toHaveAttribute('aria-selected', 'false');
        fireEvent.keyDown(getCell(tree, 'Bar 1'), {key: 'Enter'});

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(row).toHaveAttribute('aria-selected', 'true');
        checkSelectAll(tree);
      });

      it('should support selecting multiple with a pointer', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        triggerPress(getCell(tree, 'Baz 1'));

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(rows[1]).toHaveAttribute('aria-selected', 'true');
        checkRowSelection(rows.slice(2), false);
        checkSelectAll(tree, 'indeterminate');

        onSelectionChange.mockReset();
        triggerPress(getCell(tree, 'Baz 2'));

        checkSelection(onSelectionChange, ['Foo 1', 'Foo 2']);
        expect(rows[1]).toHaveAttribute('aria-selected', 'true');
        expect(rows[2]).toHaveAttribute('aria-selected', 'true');
        checkRowSelection(rows.slice(3), false);
        checkSelectAll(tree, 'indeterminate');

        // Deselect
        onSelectionChange.mockReset();
        triggerPress(getCell(tree, 'Baz 2'));

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(rows[1]).toHaveAttribute('aria-selected', 'true');
        checkRowSelection(rows.slice(2), false);
        checkSelectAll(tree, 'indeterminate');
      });

      it('should support selecting multiple with the Space key', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        pressWithKeyboard(getCell(tree, 'Baz 1'));

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(rows[1]).toHaveAttribute('aria-selected', 'true');
        checkRowSelection(rows.slice(2), false);
        checkSelectAll(tree, 'indeterminate');

        onSelectionChange.mockReset();
        pressWithKeyboard(getCell(tree, 'Baz 2'));

        checkSelection(onSelectionChange, ['Foo 1', 'Foo 2']);
        expect(rows[1]).toHaveAttribute('aria-selected', 'true');
        expect(rows[2]).toHaveAttribute('aria-selected', 'true');
        checkRowSelection(rows.slice(3), false);
        checkSelectAll(tree, 'indeterminate');

        // Deselect
        onSelectionChange.mockReset();
        pressWithKeyboard(getCell(tree, 'Baz 2'));

        checkSelection(onSelectionChange, ['Foo 1']);
        expect(rows[1]).toHaveAttribute('aria-selected', 'true');
        checkRowSelection(rows.slice(2), false);
        checkSelectAll(tree, 'indeterminate');
      });
    });

    describe('range selection', function () {
      it('should support selecting a range with a pointer', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        triggerPress(getCell(tree, 'Baz 1'));

        onSelectionChange.mockReset();
        triggerPress(getCell(tree, 'Baz 20'), {shiftKey: true});

        checkSelection(onSelectionChange, [
          'Foo 1', 'Foo 2', 'Foo 3', 'Foo 4', 'Foo 5', 'Foo 6', 'Foo 7', 'Foo 8', 'Foo 9', 'Foo 10',
          'Foo 11', 'Foo 12', 'Foo 13', 'Foo 14', 'Foo 15', 'Foo 16', 'Foo 17', 'Foo 18', 'Foo 19', 'Foo 20'
        ]);

        checkRowSelection(rows.slice(1, 21), true);
        checkRowSelection(rows.slice(21), false);
      });

      it('should anchor range selections with a pointer', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        triggerPress(getCell(tree, 'Baz 10'));

        onSelectionChange.mockReset();
        triggerPress(getCell(tree, 'Baz 20'), {shiftKey: true});

        checkSelection(onSelectionChange, [
          'Foo 10', 'Foo 11', 'Foo 12', 'Foo 13', 'Foo 14', 'Foo 15',
          'Foo 16', 'Foo 17', 'Foo 18', 'Foo 19', 'Foo 20'
        ]);

        checkRowSelection(rows.slice(11, 21), true);
        checkRowSelection(rows.slice(21), false);

        onSelectionChange.mockReset();
        triggerPress(getCell(tree, 'Baz 1'), {shiftKey: true});

        checkSelection(onSelectionChange, [
          'Foo 1', 'Foo 2', 'Foo 3', 'Foo 4', 'Foo 5',
          'Foo 6', 'Foo 7', 'Foo 8', 'Foo 9', 'Foo 10'
        ]);

        checkRowSelection(rows.slice(1, 11), true);
        checkRowSelection(rows.slice(11), false);
      });

      it('should extend a selection with Shift + ArrowDown', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        pressWithKeyboard(getCell(tree, 'Baz 10'));

        onSelectionChange.mockReset();
        fireEvent.keyDown(getCell(tree, 'Baz 10'), {key: 'ArrowDown', shiftKey: true});

        checkSelection(onSelectionChange, ['Foo 10', 'Foo 11']);
        checkRowSelection(rows.slice(1, 10), false);
        checkRowSelection(rows.slice(11, 12), true);
        checkRowSelection(rows.slice(12), false);
      });

      it('should extend a selection with Shift + ArrowUp', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        pressWithKeyboard(getCell(tree, 'Baz 10'));

        onSelectionChange.mockReset();
        fireEvent.keyDown(getCell(tree, 'Baz 10'), {key: 'ArrowUp', shiftKey: true});

        checkSelection(onSelectionChange, ['Foo 9', 'Foo 10']);
        checkRowSelection(rows.slice(1, 9), false);
        checkRowSelection(rows.slice(9, 10), true);
        checkRowSelection(rows.slice(11), false);
      });

      it('should extend a selection with Ctrl + Shift + Home', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        pressWithKeyboard(getCell(tree, 'Baz 10'));

        onSelectionChange.mockReset();
        fireEvent.keyDown(getCell(tree, 'Baz 10'), {key: 'Home', shiftKey: true, ctrlKey: true});

        checkSelection(onSelectionChange, [
          'Foo 1', 'Foo 2', 'Foo 3', 'Foo 4', 'Foo 5',
          'Foo 6', 'Foo 7', 'Foo 8', 'Foo 9', 'Foo 10'
        ]);

        checkRowSelection(rows.slice(1, 11), true);
        checkRowSelection(rows.slice(11), false);
      });

      it('should extend a selection with Ctrl + Shift + End', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        pressWithKeyboard(getCell(tree, 'Baz 10'));

        onSelectionChange.mockReset();
        fireEvent.keyDown(getCell(tree, 'Baz 10'), {key: 'End', shiftKey: true, ctrlKey: true});

        let expected = [];
        for (let i = 10; i <= 100; i++) {
          expected.push('Foo ' + i);
        }

        checkSelection(onSelectionChange, expected);
      });

      it('should extend a selection with Shift + PageDown', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        pressWithKeyboard(getCell(tree, 'Baz 10'));

        onSelectionChange.mockReset();
        fireEvent.keyDown(getCell(tree, 'Baz 10'), {key: 'PageDown', shiftKey: true});

        let expected = [];
        for (let i = 10; i <= 34; i++) {
          expected.push('Foo ' + i);
        }

        checkSelection(onSelectionChange, expected);
      });

      it('should extend a selection with Shift + PageUp', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        pressWithKeyboard(getCell(tree, 'Baz 10'));

        onSelectionChange.mockReset();
        fireEvent.keyDown(getCell(tree, 'Baz 10'), {key: 'PageUp', shiftKey: true});

        checkSelection(onSelectionChange, [
          'Foo 1', 'Foo 2', 'Foo 3', 'Foo 4', 'Foo 5',
          'Foo 6', 'Foo 7', 'Foo 8', 'Foo 9', 'Foo 10'
        ]);

        checkRowSelection(rows.slice(1, 11), true);
        checkRowSelection(rows.slice(11), false);
      });
    });

    describe('select all', function () {
      it('should support selecting all via the checkbox', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);

        userEvent.click(tree.getByLabelText('Select All'));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange.mock.calls[0][0]).toEqual('all');
        checkRowSelection(rows.slice(1), true);
        checkSelectAll(tree, 'checked');
      });

      it('should support selecting all via ctrl + A', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);

        fireEvent.keyDown(getCell(tree, 'Bar 1'), {key: 'a', ctrlKey: true});

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange.mock.calls[0][0]).toEqual('all');
        checkRowSelection(rows.slice(1), true);
        checkSelectAll(tree, 'checked');
      });

      it('should deselect an item after selecting all', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);

        userEvent.click(tree.getByLabelText('Select All'));

        onSelectionChange.mockReset();
        triggerPress(rows[4]);

        let expected = [];
        for (let i = 1; i <= 100; i++) {
          if (i !== 4) {
            expected.push('Foo ' + i);
          }
        }

        checkSelection(onSelectionChange, expected);
        expect(rows[4]).toHaveAttribute('aria-selected', 'false');
      });

      it('should shift click on an item after selecting all', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);

        userEvent.click(tree.getByLabelText('Select All'));

        onSelectionChange.mockReset();
        triggerPress(rows[4], {shiftKey: true});

        checkSelection(onSelectionChange, ['Foo 4']);
        checkRowSelection(rows.slice(1, 4), false);
        expect(rows[4]).toHaveAttribute('aria-selected', 'true');
        checkRowSelection(rows.slice(5), false);
      });

      it('should support clearing selection via checkbox', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);

        userEvent.click(tree.getByLabelText('Select All'));
        checkSelectAll(tree, 'checked');

        onSelectionChange.mockReset();
        userEvent.click(tree.getByLabelText('Select All'));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set());
        checkRowSelection(rows.slice(1), false);
        checkSelectAll(tree, 'unchecked');
      });

      it('should support clearing selection via Escape', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);
        triggerPress(getCell(tree, 'Baz 1'));
        checkSelectAll(tree, 'indeterminate');

        onSelectionChange.mockReset();
        fireEvent.keyDown(getCell(tree, 'Bar 1'), {key: 'Escape'});

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set());
        checkRowSelection(rows.slice(1), false);
        checkSelectAll(tree, 'unchecked');
      });

      it('should automatically select new items when select all is active', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);

        userEvent.click(tree.getByLabelText('Select All'));
        checkSelectAll(tree, 'checked');
        checkRowSelection(rows.slice(1), true);

        rerender(tree, renderJSX(onSelectionChange, [
          {foo: 'Foo 0', bar: 'Bar 0', baz: 'Baz 0'},
          ...manyItems
        ]));

        act(() => jest.runAllTimers());

        expect(getCell(tree, 'Foo 0')).toBeVisible();
        checkRowSelection(rows.slice(1), true);
      });

      it('manually selecting all should not auto select new items', function () {
        let onSelectionChange = jest.fn();
        let tree = renderTable(onSelectionChange, items);

        checkSelectAll(tree, 'unchecked');

        let rows = tree.getAllByRole('row');
        checkRowSelection(rows.slice(1), false);

        triggerPress(rows[1]);
        checkSelectAll(tree, 'indeterminate');

        triggerPress(rows[2]);
        checkSelectAll(tree, 'checked');

        rerender(tree, renderJSX(onSelectionChange, [
          {foo: 'Foo 0', bar: 'Bar 0', baz: 'Baz 0'},
          ...items
        ]));

        act(() => jest.runAllTimers());

        rows = tree.getAllByRole('row');
        expect(getCell(tree, 'Foo 0')).toBeVisible();
        expect(rows[1]).toHaveAttribute('aria-selected', 'false');
        checkRowSelection(rows.slice(2), true);
        checkSelectAll(tree, 'indeterminate');
      });
    });
  });

  describe('CRUD', function () {
    it('can add items', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(rows[1]).toHaveAttribute('aria-rowindex', '2');
      expect(rows[2]).toHaveAttribute('aria-rowindex', '3');

      let button = tree.getByLabelText('Add item');
      triggerPress(button);

      let dialog = tree.getByRole('dialog');
      expect(dialog).toBeVisible();

      let firstName = tree.getByLabelText('First Name');
      typeText(firstName, 'Devon');
      userEvent.tab();

      let lastName = tree.getByLabelText('Last Name');
      typeText(lastName, 'Govett');
      userEvent.tab();

      let birthday = tree.getByLabelText('Birthday');
      typeText(birthday, 'Feb 3');
      userEvent.tab();

      let createButton = tree.getByText('Create');
      triggerPress(createButton);
      act(() => {jest.runAllTimers();});

      expect(dialog).not.toBeInTheDocument();

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(4);
      expect(rows[1]).toHaveAttribute('aria-rowindex', '2');
      expect(rows[2]).toHaveAttribute('aria-rowindex', '3');
      expect(rows[3]).toHaveAttribute('aria-rowindex', '4');


      let rowHeaders = within(rows[1]).getAllByRole('rowheader');
      expect(rowHeaders[0]).toHaveTextContent('Devon');
      expect(rowHeaders[1]).toHaveTextContent('Govett');

      let cells = within(rows[1]).getAllByRole('gridcell');
      expect(cells[1]).toHaveTextContent('Feb 3');
    });

    it('can remove items', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      let button = within(rows[2]).getByRole('button');
      triggerPress(button);

      let menu = tree.getByRole('menu');
      expect(document.activeElement).toBe(menu);

      let menuItems = within(menu).getAllByRole('menuitem');
      expect(menuItems.length).toBe(2);

      triggerPress(menuItems[1]);
      expect(menu).not.toBeInTheDocument();

      let dialog = tree.getByRole('alertdialog', {hidden: true});
      let deleteButton = within(dialog).getByRole('button', {hidden: true});

      triggerPress(deleteButton);
      expect(dialog).not.toBeInTheDocument();

      act(() => jest.runAllTimers());
      expect(rows[2]).not.toBeInTheDocument();

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(2);

      let rowHeaders = within(rows[1]).getAllByRole('rowheader');
      expect(rowHeaders[0]).toHaveTextContent('Sam');

      // focus gets reset
      act(() => table.focus());
      expect(document.activeElement).toBe(rows[1]);
    });

    it('resets row indexes after deleting a row', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(rows[1]).toHaveAttribute('aria-rowindex', '2');
      expect(rows[2]).toHaveAttribute('aria-rowindex', '3');

      let button = within(rows[1]).getByRole('button');
      triggerPress(button);

      let menu = tree.getByRole('menu');
      expect(document.activeElement).toBe(menu);

      let menuItems = within(menu).getAllByRole('menuitem');
      expect(menuItems.length).toBe(2);

      triggerPress(menuItems[1]);
      expect(menu).not.toBeInTheDocument();

      let dialog = tree.getByRole('alertdialog', {hidden: true});
      let deleteButton = within(dialog).getByRole('button', {hidden: true});

      triggerPress(deleteButton);
      expect(dialog).not.toBeInTheDocument();

      act(() => jest.runAllTimers());
      expect(rows[1]).not.toBeInTheDocument();

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(2);

      let rowHeaders = within(rows[1]).getAllByRole('rowheader');
      expect(rowHeaders[0]).toHaveTextContent('Julia');

      expect(rows[1]).toHaveAttribute('aria-rowindex', '2');
    });

    it('can bulk remove items', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      let checkbox = within(rows[0]).getByRole('checkbox');
      userEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      let deleteButton = tree.getByLabelText('Delete selected items');
      triggerPress(deleteButton);

      let dialog = tree.getByRole('alertdialog');
      let confirmButton = within(dialog).getByRole('button');

      triggerPress(confirmButton);
      expect(dialog).not.toBeInTheDocument();

      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(1);

      expect(checkbox.checked).toBe(false);
    });

    it('can edit items', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      let button = within(rows[2]).getByRole('button');
      triggerPress(button);

      let menu = tree.getByRole('menu');
      expect(document.activeElement).toBe(menu);

      let menuItems = within(menu).getAllByRole('menuitem');
      expect(menuItems.length).toBe(2);

      triggerPress(menuItems[0]);
      expect(menu).not.toBeInTheDocument();

      let dialog = tree.getByRole('dialog', {hidden: true});
      expect(dialog).toBeVisible();

      let firstName = tree.getByLabelText('First Name');
      typeText(firstName, 'Jessica');

      let saveButton = tree.getByText('Save');
      triggerPress(saveButton);

      expect(dialog).not.toBeInTheDocument();

      act(() => jest.runAllTimers());

      let rowHeaders = within(rows[2]).getAllByRole('rowheader');
      expect(rowHeaders[0]).toHaveTextContent('Jessica');
      expect(rowHeaders[1]).toHaveTextContent('Jones');
    });

    it('keyboard navigation works as expected with menu buttons', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      act(() => within(rows[1]).getAllByRole('gridcell').pop().focus());
      expect(document.activeElement).toBe(within(rows[1]).getByRole('button'));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});

      expect(() => {
        tree.getByRole('menu');
      }).toThrow();

      expect(document.activeElement).toBe(within(rows[2]).getByRole('button'));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});

      expect(() => {
        tree.getByRole('menu');
      }).toThrow();

      expect(document.activeElement).toBe(within(rows[1]).getByRole('button'));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', altKey: true});

      let menu = tree.getByRole('menu');
      expect(document.activeElement).toBe(within(menu).getAllByRole('menuitem')[0]);
    });

    it('menu buttons can be opened with Alt + ArrowDown', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      act(() => within(rows[1]).getAllByRole('gridcell').pop().focus());
      expect(document.activeElement).toBe(within(rows[1]).getByRole('button'));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', altKey: true});

      let menu = tree.getByRole('menu');
      expect(menu).toBeInTheDocument();
      expect(document.activeElement).toBe(within(menu).getAllByRole('menuitem')[0]);
    });

    it('menu buttons can be opened with Alt + ArrowUp', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      act(() => within(rows[1]).getAllByRole('gridcell').pop().focus());
      expect(document.activeElement).toBe(within(rows[1]).getByRole('button'));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowUp', altKey: true});

      let menu = tree.getByRole('menu');
      expect(menu).toBeInTheDocument();
      expect(document.activeElement).toBe(within(menu).getAllByRole('menuitem').pop());
    });

    it('menu keyboard navigation does not affect table', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      act(() => within(rows[1]).getAllByRole('gridcell').pop().focus());
      expect(document.activeElement).toBe(within(rows[1]).getByRole('button'));

      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', altKey: true});

      let menu = tree.getByRole('menu');
      expect(menu).toBeInTheDocument();
      expect(document.activeElement).toBe(within(menu).getAllByRole('menuitem')[0]);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
      expect(document.activeElement).toBe(within(menu).getAllByRole('menuitem')[1]);

      act(() => table.focus());

      expect(menu).not.toBeInTheDocument();
      expect(document.activeElement).toBe(within(rows[1]).getByRole('button'));
    });
  });

  describe('async loading', function () {
    let defaultTable = (
      <Table aria-label="Table">
        <TableHeader>
          <Column key="foo">Foo</Column>
          <Column key="bar">Bar</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Foo 1</Cell>
            <Cell>Bar 1</Cell>
          </Row>
          <Row>
            <Cell>Foo 2</Cell>
            <Cell>Bar 2</Cell>
          </Row>
        </TableBody>
      </Table>
    );

    it('should display a spinner when loading', function () {
      let tree = render(
        <Table aria-label="Table" selectionMode="multiple">
          <TableHeader>
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
          </TableHeader>
          <TableBody isLoading>
            {[]}
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(2);
      expect(rows[1]).toHaveAttribute('aria-rowindex', '2');

      let cell = within(rows[1]).getByRole('rowheader');
      expect(cell).toHaveAttribute('aria-colspan', '3');

      let spinner = within(cell).getByRole('progressbar');
      expect(spinner).toBeVisible();
      expect(spinner).toHaveAttribute('aria-label', 'Loading…');
      expect(spinner).not.toHaveAttribute('aria-valuenow');

      rerender(tree, defaultTable);
      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(spinner).not.toBeInTheDocument();
    });

    it('should display a spinner at the bottom when loading more', function () {
      let tree = render(
        <Table aria-label="Table">
          <TableHeader>
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
          </TableHeader>
          <TableBody isLoading>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
            </Row>
            <Row>
              <Cell>Foo 2</Cell>
              <Cell>Bar 2</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(4);
      expect(rows[3]).toHaveAttribute('aria-rowindex', '4');

      let cell = within(rows[3]).getByRole('rowheader');
      expect(cell).toHaveAttribute('aria-colspan', '2');

      let spinner = within(cell).getByRole('progressbar');
      expect(spinner).toBeVisible();
      expect(spinner).toHaveAttribute('aria-label', 'Loading more…');
      expect(spinner).not.toHaveAttribute('aria-valuenow');

      rerender(tree, defaultTable);
      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(spinner).not.toBeInTheDocument();
    });

    it('should fire onLoadMore when scrolling near the bottom', function () {
      let items = [];
      for (let i = 1; i <= 100; i++) {
        items.push({id: i, foo: 'Foo ' + i, bar: 'Bar ' + i});
      }

      let onLoadMore = jest.fn();
      let tree = render(
        <Table aria-label="Table">
          <TableHeader>
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
          </TableHeader>
          <TableBody items={items} onLoadMore={onLoadMore}>
            {row => (
              <Row>
                {key => <Cell>row[key]</Cell>}
              </Row>
            )}
          </TableBody>
        </Table>
      );

      let body = tree.getAllByRole('rowgroup')[1];
      let scrollView = body.parentNode.parentNode;

      let rows = within(body).getAllByRole('row');
      expect(rows).toHaveLength(25); // each row is 41px tall. table is 1000px tall. 25 rows fit.

      scrollView.scrollTop = 250;
      fireEvent.scroll(scrollView);

      scrollView.scrollTop = 1500;
      fireEvent.scroll(scrollView);

      scrollView.scrollTop = 2800;
      fireEvent.scroll(scrollView);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should display an empty state when there are no items', function () {
      let tree = render(
        <Table aria-label="Table" renderEmptyState={() => <h3>No results</h3>}>
          <TableHeader>
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
          </TableHeader>
          <TableBody>
            {[]}
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(2);
      expect(rows[1]).toHaveAttribute('aria-rowindex', '2');

      let cell = within(rows[1]).getByRole('rowheader');
      expect(cell).toHaveAttribute('aria-colspan', '2');

      let heading = within(cell).getByRole('heading');
      expect(heading).toBeVisible();
      expect(heading).toHaveTextContent('No results');

      rerender(tree, defaultTable);
      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(heading).not.toBeInTheDocument();
    });
  });

  describe('sorting', function () {
    it('should set aria-sort="none" on sortable column headers', function () {
      let tree = render(
        <Table aria-label="Table">
          <TableHeader>
            <Column key="foo" allowsSorting>Foo</Column>
            <Column key="bar" allowsSorting>Bar</Column>
            <Column key="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');
    });

    it('should set aria-sort="ascending" on sorted column header', function () {
      let tree = render(
        <Table aria-label="Table" sortDescriptor={{column: 'bar', direction: 'ascending'}}>
          <TableHeader>
            <Column key="foo" allowsSorting>Foo</Column>
            <Column key="bar" allowsSorting>Bar</Column>
            <Column key="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'ascending');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');
    });

    it('should set aria-sort="descending" on sorted column header', function () {
      let tree = render(
        <Table aria-label="Table" sortDescriptor={{column: 'bar', direction: 'descending'}}>
          <TableHeader>
            <Column key="foo" allowsSorting>Foo</Column>
            <Column key="bar" allowsSorting>Bar</Column>
            <Column key="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'descending');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');
    });

    it('should fire onSortChange when there is no existing sortDescriptor', function () {
      let onSortChange = jest.fn();
      let tree = render(
        <Table aria-label="Table" onSortChange={onSortChange}>
          <TableHeader>
            <Column key="foo" allowsSorting>Foo</Column>
            <Column key="bar" allowsSorting>Bar</Column>
            <Column key="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');

      triggerPress(columnheaders[0]);

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith({column: 'foo', direction: 'ascending'});
    });

    it('should toggle the sort direction from ascending to descending', function () {
      let onSortChange = jest.fn();
      let tree = render(
        <Table aria-label="Table" sortDescriptor={{column: 'foo', direction: 'ascending'}} onSortChange={onSortChange}>
          <TableHeader>
            <Column key="foo" allowsSorting>Foo</Column>
            <Column key="bar" allowsSorting>Bar</Column>
            <Column key="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'ascending');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');

      triggerPress(columnheaders[0]);

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith({column: 'foo', direction: 'descending'});
    });

    it('should toggle the sort direction from descending to ascending', function () {
      let onSortChange = jest.fn();
      let tree = render(
        <Table aria-label="Table" sortDescriptor={{column: 'foo', direction: 'descending'}} onSortChange={onSortChange}>
          <TableHeader>
            <Column key="foo" allowsSorting>Foo</Column>
            <Column key="bar" allowsSorting>Bar</Column>
            <Column key="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'descending');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');

      triggerPress(columnheaders[0]);

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith({column: 'foo', direction: 'ascending'});
    });

    it('should trigger sorting on a different column', function () {
      let onSortChange = jest.fn();
      let tree = render(
        <Table aria-label="Table" sortDescriptor={{column: 'foo', direction: 'ascending'}} onSortChange={onSortChange}>
          <TableHeader>
            <Column key="foo" allowsSorting>Foo</Column>
            <Column key="bar" allowsSorting>Bar</Column>
            <Column key="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'ascending');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');

      triggerPress(columnheaders[1]);

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith({column: 'bar', direction: 'ascending'});
    });
  });

  describe('layout', function () {
    describe('row heights', function () {
      let renderTable = (props, scale) => render(
        <Table aria-label="Table" {...props}>
          <TableHeader columns={columns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={items}>
            {item =>
              (<Row key={item.foo}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>)
            }
          </TableBody>
        </Table>
      , scale);

      it('should layout rows with default height', function () {
        let tree = renderTable();
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('41px');
        expect(rows[2].style.top).toBe('41px');
        expect(rows[2].style.height).toBe('41px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('40px');
        }
      });

      it('should layout rows with default height in large scale', function () {
        let tree = renderTable({}, 'large');
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('40px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('51px');
        expect(rows[2].style.top).toBe('51px');
        expect(rows[2].style.height).toBe('51px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('50px');
        }
      });

      it('should layout rows with density="compact"', function () {
        let tree = renderTable({density: 'compact'});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('33px');
        expect(rows[2].style.top).toBe('33px');
        expect(rows[2].style.height).toBe('33px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('32px');
        }
      });

      it('should layout rows with density="compact" in large scale', function () {
        let tree = renderTable({density: 'compact'}, 'large');
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('40px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('41px');
        expect(rows[2].style.top).toBe('41px');
        expect(rows[2].style.height).toBe('41px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('40px');
        }
      });

      it('should layout rows with density="spacious"', function () {
        let tree = renderTable({density: 'spacious'});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('49px');
        expect(rows[2].style.top).toBe('49px');
        expect(rows[2].style.height).toBe('49px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }
      });

      it('should layout rows with density="spacious" in large scale', function () {
        let tree = renderTable({density: 'spacious'}, 'large');
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('40px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('61px');
        expect(rows[2].style.top).toBe('61px');
        expect(rows[2].style.height).toBe('61px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('60px');
        }
      });

      it('should support variable row heights with overflowMode="wrap"', function () {
        let scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get')
          .mockImplementation(function () {
            return this.textContent === 'Foo 1' ? 64 : 48;
          });

        let tree = renderTable({overflowMode: 'wrap'});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('65px');
        expect(rows[2].style.top).toBe('65px');
        expect(rows[2].style.height).toBe('49px');

        for (let cell of rows[1].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('64px');
        }

        for (let cell of rows[2].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }

        scrollHeight.mockRestore();
      });

      it('should support variable column header heights with overflowMode="wrap"', function () {
        let scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get')
          .mockImplementation(function () {
            return this.textContent === 'Tier Two Header B' ? 48 : 34;
          });

        let tree = render(
          <Table aria-label="Table" overflowMode="wrap">
            <TableHeader columns={nestedColumns}>
              {column => <Column childColumns={column.children}>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(5);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('34px');
        expect(rows[1].style.height).toBe('48px');
        expect(rows[2].style.top).toBe('82px');
        expect(rows[2].style.height).toBe('34px');

        for (let cell of rows[0].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('34px');
        }

        for (let cell of rows[1].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }

        for (let cell of rows[2].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('34px');
        }

        scrollHeight.mockRestore();
      });
    });

    describe('column widths', function () {
      it('should divide the available width by default', function () {
        let tree = render(
          <Table aria-label="Table" selectionMode="multiple">
            <TableHeader columns={columns}>
              {column => <Column>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('315px');
          expect(row.childNodes[2].style.width).toBe('315px');
          expect(row.childNodes[3].style.width).toBe('315px');
        }
      });

      it('should support explicitly sized columns', function () {
        let tree = render(
          <Table aria-label="Table">
            <TableHeader>
              <Column key="foo" width={200}>Foo</Column>
              <Column key="bar" width={500}>Bar</Column>
              <Column key="baz" width={300}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('200px');
          expect(row.childNodes[1].style.width).toBe('500px');
          expect(row.childNodes[2].style.width).toBe('300px');
        }
      });

      it('should divide remaining width amoung remaining columns', function () {
        let tree = render(
          <Table aria-label="Table" selectionMode="multiple">
            <TableHeader>
              <Column key="foo" width={200}>Foo</Column>
              <Column key="bar">Bar</Column>
              <Column key="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('372.5px');
          expect(row.childNodes[3].style.width).toBe('372.5px');
        }
      });

      it('should support percentage widths', function () {
        let tree = render(
          <Table aria-label="Table">
            <TableHeader>
              <Column key="foo" width="10%">Foo</Column>
              <Column key="bar" width={500}>Bar</Column>
              <Column key="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('100px');
          expect(row.childNodes[1].style.width).toBe('500px');
          expect(row.childNodes[2].style.width).toBe('400px');
        }
      });

      it('should support minWidth', function () {
        let tree = render(
          <Table aria-label="Table" selectionMode="multiple">
            <TableHeader>
              <Column key="foo" width={200}>Foo</Column>
              <Column key="bar" minWidth={500}>Bar</Column>
              <Column key="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('500px');
          expect(row.childNodes[3].style.width).toBe('245px');
        }
      });

      it('should support maxWidth', function () {
        let tree = render(
          <Table aria-label="Table">
            <TableHeader>
              <Column key="foo" width={200}>Foo</Column>
              <Column key="bar" maxWidth={300}>Bar</Column>
              <Column key="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('200px');
          expect(row.childNodes[1].style.width).toBe('300px');
          expect(row.childNodes[2].style.width).toBe('500px');

        }
      });

      it('should compute the correct widths for tiered headings with selection', function () {
        let tree = render(
          <Table aria-label="Table" selectionMode="multiple">
            <TableHeader columns={nestedColumns}>
              {column => <Column childColumns={column.children}>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        expect(rows[0].childNodes[0].style.width).toBe('244px');
        expect(rows[0].childNodes[1].style.width).toBe('756px');

        expect(rows[1].childNodes[0].style.width).toBe('244px');
        expect(rows[1].childNodes[1].style.width).toBe('378px');
        expect(rows[1].childNodes[2].style.width).toBe('189px');
        expect(rows[1].childNodes[3].style.width).toBe('189px');

        for (let row of rows.slice(2)) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('189px');
          expect(row.childNodes[2].style.width).toBe('189px');
          expect(row.childNodes[3].style.width).toBe('189px');
          expect(row.childNodes[4].style.width).toBe('189px');
          expect(row.childNodes[5].style.width).toBe('189px');
        }
      });
    });
  });

  describe('updating columns', function () {
    it('should support removing columns', function () {
      let tree = render(<HidingColumns />);

      let checkbox = tree.getByLabelText('Net Budget');
      expect(checkbox.checked).toBe(true);

      let table = tree.getByRole('grid');
      let columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(6);
      expect(columns[1]).toHaveTextContent('Plan Name');
      expect(columns[2]).toHaveTextContent('Audience Type');
      expect(columns[3]).toHaveTextContent('Net Budget');
      expect(columns[4]).toHaveTextContent('Target OTP');
      expect(columns[5]).toHaveTextContent('Reach');

      for (let row of within(table).getAllByRole('row').slice(1)) {
        expect(within(row).getAllByRole('rowheader')).toHaveLength(1);
        expect(within(row).getAllByRole('gridcell')).toHaveLength(5);
      }

      userEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);

      act(() => jest.runAllTimers());

      columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(5);
      expect(columns[1]).toHaveTextContent('Plan Name');
      expect(columns[2]).toHaveTextContent('Audience Type');
      expect(columns[3]).toHaveTextContent('Target OTP');
      expect(columns[4]).toHaveTextContent('Reach');

      for (let row of within(table).getAllByRole('row').slice(1)) {
        expect(within(row).getAllByRole('rowheader')).toHaveLength(1);
        expect(within(row).getAllByRole('gridcell')).toHaveLength(4);
      }
    });

    it('should support adding columns', function () {
      let tree = render(<HidingColumns />);

      let checkbox = tree.getByLabelText('Net Budget');
      expect(checkbox.checked).toBe(true);

      userEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);

      act(() => jest.runAllTimers());

      let table = tree.getByRole('grid');
      let columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(5);

      userEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      act(() => jest.runAllTimers());

      columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(6);
      expect(columns[1]).toHaveTextContent('Plan Name');
      expect(columns[2]).toHaveTextContent('Audience Type');
      expect(columns[3]).toHaveTextContent('Net Budget');
      expect(columns[4]).toHaveTextContent('Target OTP');
      expect(columns[5]).toHaveTextContent('Reach');

      for (let row of within(table).getAllByRole('row').slice(1)) {
        expect(within(row).getAllByRole('rowheader')).toHaveLength(1);
        expect(within(row).getAllByRole('gridcell')).toHaveLength(5);
      }
    });
  });

  describe('headerless columns', function () {

    let renderTable = (props, scale) => render(
      <Table aria-label="Table" data-testid="test" {...props}>
        <TableHeader>
          <Column key="foo">Foo</Column>
          <Column key="addAction" noHeader>
              Add Item
          </Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Foo 1</Cell>
            <Cell>
              <ActionButton isQuiet>
                <Add />
              </ActionButton>
            </Cell>
          </Row>
        </TableBody>
      </Table>
      , scale);

    it('renders  table with headerless column with default scale', function () {
      let {getByRole} = renderTable();
      let grid = getByRole('grid');
      expect(grid).toBeVisible();
      expect(grid).toHaveAttribute('aria-label', 'Table');
      expect(grid).toHaveAttribute('data-testid', 'test');

      expect(grid).toHaveAttribute('aria-rowcount', '2');
      expect(grid).toHaveAttribute('aria-colcount', '2');
      let rowgroups = within(grid).getAllByRole('rowgroup');
      expect(rowgroups).toHaveLength(2);

      let headerRows = within(rowgroups[0]).getAllByRole('row');
      expect(headerRows).toHaveLength(1);
      expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');

      let headers = within(grid).getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
      let className = headers[1].className;
      expect(className.includes('react-spectrum-Table-cell--noHeader')).toBeTruthy();
      expect(headers[0]).toHaveTextContent('Foo');
      expect(headers[1]).toBeEmptyDOMElement();


      let rows = within(rowgroups[1]).getAllByRole('row');
      expect(rows).toHaveLength(1);
      // The width of headerless column
      expect(rows[0].childNodes[1].style.width).toBe('39px');
      let rowheader = within(rows[0]).getByRole('rowheader');
      expect(rowheader).toHaveTextContent('Foo 1');
      let actionCell = within(rows[0]).getAllByRole('gridcell');
      expect(actionCell).toHaveLength(1);
      let buttons = within(actionCell[0]).getAllByRole('button');
      expect(buttons).toHaveLength(1);
      className = actionCell[0].className;
      expect(className.includes('react-spectrum-Table-cell--noHeader')).toBeTruthy();
    });

    it('renders table with headerless column with large scale', function () {
      let {getByRole} = renderTable({}, 'large');
      let grid = getByRole('grid');
      expect(grid).toBeVisible();
      expect(grid).toHaveAttribute('aria-label', 'Table');
      expect(grid).toHaveAttribute('data-testid', 'test');
      let rowgroups = within(grid).getAllByRole('rowgroup');
      let rows = within(rowgroups[1]).getAllByRole('row');
      expect(rows).toHaveLength(1);
      // The width of headerless column
      expect(rows[0].childNodes[1].style.width).toBe('45px');
    });

    it('renders table with headerless column with tooltip', function () {
      let {getByRole} = renderTable({}, 'large');
      let grid = getByRole('grid');
      expect(grid).toBeVisible();
      expect(grid).toHaveAttribute('aria-label', 'Table');
      expect(grid).toHaveAttribute('data-testid', 'test');
      let headers = within(grid).getAllByRole('columnheader');
      let headerlessColumn = headers[1];
      act(() => {
        headerlessColumn.focus();
      });
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

    });

  });
});
