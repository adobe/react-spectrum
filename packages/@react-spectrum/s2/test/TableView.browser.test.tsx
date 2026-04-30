/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../src/TableView';
import {expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';
import {User} from '@react-aria/test-utils';

let columns = [
  {name: 'Title', id: 'title', isRowHeader: true},
  {name: 'Status', id: 'status'},
  {name: 'Payment Method', id: 'paymentMethod'},
  {name: 'Price', id: 'price'}
];

const items = [
  {id: 1, title: 'Website Design', status: 'Paid', paymentMethod: 'Credit Card', price: 1200},
  {id: 2, title: 'Logo Creation', status: 'Pending', paymentMethod: 'PayPal', price: 350},
  {id: 3, title: 'SEO Optimization', status: 'Overdue', paymentMethod: 'Bank Transfer', price: 800},
  {id: 4, title: 'Social Media Setup', status: 'Paid', paymentMethod: 'Debit Card', price: 450},
  {id: 5, title: 'Content Writing', status: 'Pending', paymentMethod: 'Credit Card', price: 600}
];

function TableExample() {
  return (
    <TableView aria-label="Test table" selectionMode="multiple">
      <TableHeader columns={columns}>
        {(column) => <Column isRowHeader={column.isRowHeader}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={items}>
        {(item) => (
          <Row id={item.id} columns={columns}>
            {(column) => <Cell>{item[column.id]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('selects a row via $interactionType', async ({interactionType}) => {
  let testUtilUser = new User();
  let {container} = await render(<TableExample />);

  let tester = testUtilUser.createTester('Table', {root: container.querySelector('[role=grid]') as HTMLElement, interactionType});
  await tester.toggleRowSelection({row: 2});
  expect(tester.rows()[2].getAttribute('aria-selected')).toBe('true');
});
