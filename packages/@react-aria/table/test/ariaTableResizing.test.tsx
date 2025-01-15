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

import {act, fireEvent} from '@react-spectrum/test-utils-internal';
import {Cell, Column, Row, TableBody, TableHeader} from '@react-stately/table';
import {composeStories} from '@storybook/react';
import {Key} from '@react-types/shared';
import React from 'react';
import {render} from '@testing-library/react';
import {Table as ResizingTable} from '../stories/example-resizing';
import {resizingTests} from './tableResizingTests';
import {setInteractionModality} from '@react-aria/interactions';
import * as stories from '../stories/useTable.stories';
import {within} from '@testing-library/dom';


let {TableWithSomeResizingFRsControlled} = composeStories(stories);

// I'd use tree.getByRole(role, {name: text}) here, but it's unbearably slow.
function getColumn(tree, name) {
  // Find by text, then go up to the element with the cell role.
  let el = tree.getByText(name);
  while (el && !/columnheader/.test(el.getAttribute('role'))) {
    el = el.parentElement;
  }

  return el;
}

function resizeCol(tree, col, delta) {
  act(() => {setInteractionModality('pointer');});
  let column = getColumn(tree, col);
  let resizer = within(column).getByRole('slider');

  fireEvent.pointerEnter(resizer);

  // actual locations do not matter, the delta matters between events for the calculation of useMove
  fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 0, pageY: 30});
  fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: delta, pageY: 25});
  fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});
}

function resizeTable(clientWidth, newValue) {
  clientWidth.mockImplementation(() => newValue);
  fireEvent(window, new Event('resize'));
  act(() => {jest.runAllTimers();});
}

describe('Aria Table', () => {
  resizingTests(render, (tree, ...args) => tree.rerender(...args), Table, TableWithSomeResizingFRsControlled, resizeCol, resizeTable);
});

function Table(props: {columns: {id: Key, name: string}[], rows: Record<string, string>[]}) {
  let {columns, rows, ...args} = props;
  return (
    <ResizingTable {...args}>
      <TableHeader columns={columns}>
        {column => (
          <Column {...column}>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={rows}>
        {item => (
          <Row>
            {columnKey => <Cell>{item[columnKey]}</Cell>}
          </Row>
        )}
      </TableBody>
    </ResizingTable>
  );
}
