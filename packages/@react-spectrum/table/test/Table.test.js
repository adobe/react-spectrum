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

import {act, cleanup, fireEvent, render, within} from '@testing-library/react';
import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {Link} from '@react-spectrum/link';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {Switch} from '@react-spectrum/switch';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
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

describe('Table', function () {
  beforeAll(function () {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
    jest.useFakeTimers();
  });

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

  describe('keyboard focus', function () {
    let renderTable = (locale = 'en-US') => render(
      <Provider locale={locale} theme={theme}>
        <Table selectionMode="none">
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
      </Provider>
    );

    let renderNested = () => render(
      <Table selectionMode="none">
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

    let focusCell = (tree, text) => tree.getByText(text).focus();
    let moveFocus = (key, opts = {}) => fireEvent.keyDown(document.activeElement, {key, ...opts});

    describe('ArrowRight', function () {
      it('should move focus to the next cell in a row with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should move focus to the previous cell in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
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
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should move focus from the row to the last cell with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should move to the next column header in a row with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Baz'));
      });

      it('should move to the previous column header in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move to the first column header when focus is on the last column with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Baz');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move to the last column header when focus is on the first column with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Foo');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Baz'));
      });
    });

    describe('ArrowLeft', function () {
      it('should move focus to the previous cell in a row with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should move focus to the next cell in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
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
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should move focus from the row to the first cell with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should move to the previous column header in a row with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move to the next column header in a row with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Baz'));
      });

      it('should move to the last column header when focus is on the first column with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Foo');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Baz'));
      });

      it('should move to the first column header when focus is on the last column with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Baz');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });
    });

    describe('ArrowUp', function () {
      it('should move focus to the cell above with ArrowUp', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 2');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Bar 1'));
      });

      it('should move focus to the row above with ArrowUp', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[2].focus();
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus to the column header above a cell in the first row with ArrowUp', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Bar'));
      });

      it('should move focus to the column header above the first row with ArrowUp', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move focus to the parent column header with ArrowUp', function () {
        let tree = renderNested();
        focusCell(tree, 'Bar');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Tier Two Header A'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Tiered One Header'));
        // do nothing when at the top
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Tiered One Header'));
      });
    });

    describe('ArrowDown', function () {
      it('should move focus to the cell below with ArrowDown', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getByText('Bar 2'));
      });

      it('should move focus to the row below with ArrowDown', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);
      });

      it('should move focus to the child column header with ArrowDown', function () {
        let tree = renderNested();
        focusCell(tree, 'Tiered One Header');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getByText('Tier Two Header A'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move focus to the cell below a column header with ArrowDown', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getByText('Bar 1'));
      });
    });

    describe('Home', function () {
      it('should focus the first cell in a row with Home', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('Home');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should focus the first cell in the first row with ctrl + Home', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 2');
        moveFocus('Home', {ctrlKey: true});
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should focus the first row with Home', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[2].focus();
        moveFocus('Home');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });
    });

    describe('End', function () {
      it('should focus the last cell in a row with End', function () {
        let tree = renderTable();
        focusCell(tree, 'Foo 1');
        moveFocus('End');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should focus the last cell in the last row with ctrl + End', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('End', {ctrlKey: true});
        expect(document.activeElement).toBe(tree.getByText('Baz 2'));
      });

      it('should focus the last row with End', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[1].focus();
        moveFocus('End');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);
      });
    });

    // TODO: PageUp and PageDown once scrolling is supported
    // TODO: type to select once that is figured out

    describe('focus marshalling', function () {
      let renderFocusable = () => render(
        <Table>
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
    });
  });

  describe('selection', function () {
    let renderTable = (onSelectionChange, locale = 'en-US') => render(
      <Table onSelectionChange={onSelectionChange}>
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

    it('should select a row from checkbox', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(within(row).getByRole('checkbox')));

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing on a cell', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => triggerPress(tree.getByText('Baz 1')));

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing the Space key on a row', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => {fireEvent.keyDown(row, {key: ' '});});

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing the Enter key on a row', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => {fireEvent.keyDown(row, {key: 'Enter'});});

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing the Space key on a cell', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => {fireEvent.keyDown(tree.getByText('Bar 1'), {key: ' '});});

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing the Enter key on a cell', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => {fireEvent.keyDown(tree.getByText('Bar 1'), {key: 'Enter'});});

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should support selecting multiple', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      checkSelectAll(tree, 'unchecked');

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      act(() => triggerPress(tree.getByText('Baz 1')));

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      checkSelectAll(tree, 'indeterminate');

      onSelectionChange.mockReset();
      act(() => triggerPress(tree.getByText('Baz 2')));

      checkSelection(onSelectionChange, ['Foo 1', 'Foo 2']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree, 'checked');
    });

    it('should support selecting all via the checkbox', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      checkSelectAll(tree, 'unchecked');

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      
      act(() => userEvent.click(tree.getByLabelText('Select All')));

      checkSelection(onSelectionChange, ['Foo 1', 'Foo 2']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree, 'checked');
    });

    it('should support selecting all via ctrl + A', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      checkSelectAll(tree, 'unchecked');

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      
      act(() => {fireEvent.keyDown(tree.getByText('Bar 1'), {key: 'a', ctrlKey: true});});

      checkSelection(onSelectionChange, ['Foo 1', 'Foo 2']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree, 'checked');
    });

    it('should support clearing selection via Escape', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      checkSelectAll(tree, 'unchecked');

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      act(() => triggerPress(tree.getByText('Baz 1')));
      checkSelectAll(tree, 'indeterminate');
      
      onSelectionChange.mockReset();
      act(() => {fireEvent.keyDown(tree.getByText('Bar 1'), {key: 'Escape'});});

      checkSelection(onSelectionChange, []);
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      checkSelectAll(tree, 'unchecked');
    });
  });
});
