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
});
