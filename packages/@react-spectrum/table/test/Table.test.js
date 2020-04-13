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
import {cleanup, render} from '@testing-library/react';
import React from 'react';

describe('Table', function () {
  afterEach(() => {
    cleanup();
  });

  it('renders a static table', function () {
    let {getByRole} = render(
      <Table>
        <TableHeader>
          <Column>Foo</Column>
          <Column>Bar</Column>
          <Column>Baz</Column>
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
    );
    
    let grid = getByRole('grid');
    expect(grid).toBeVisible();
  });
});
