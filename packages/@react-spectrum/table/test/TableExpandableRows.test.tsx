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
import {act, fireEvent, render as renderComponent, within} from '@react-spectrum/test-utils';
import {composeStories} from '@storybook/testing-react';
import {enableTableNestedRows} from '@react-stately/flags';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import * as stories from '../stories/TreeGridTable.stories';
import {theme} from '@react-spectrum/theme-default';

// Importing this stuff made Table test run along side this test even when only this test suite is targeted
// import {getCell, render, rerender} from './Table.test';

let {
  StaticExpandableRows: StaticExpandableTable,
  DynamicExpandableRowsStory: DynamicExpandableTable,
  ManyExpandableRowsStory: ManyRowsExpandableTable
} = composeStories(stories);

// function pointerEvent(type, opts) {
//   let evt = new Event(type, {bubbles: true, cancelable: true});
//   Object.assign(evt, {
//     ctrlKey: false,
//     metaKey: false,
//     shiftKey: false,
//     altKey: false,
//     button: opts.button || 0,
//     width: 1,
//     height: 1
//   }, opts);
//   return evt;
// }

let getCell = (tree, text) => {
  // Find by text, then go up to the element with the cell role.
  let el = tree.getByText(text);
  while (el && !/gridcell|rowheader|columnheader/.test(el.getAttribute('role'))) {
    el = el.parentElement;
  }

  return el;
};

let render = (children, scale = 'medium') => {
  enableTableNestedRows();
  let tree = renderComponent(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );
  // account for table column resizing to do initial pass due to relayout from useTableColumnResizeState render
  act(() => {jest.runAllTimers();});
  return tree;
};

// let rerender = (tree, children, scale = 'medium') => {
//   let newTree = tree.rerender(
//     <Provider theme={theme} scale={scale}>
//       {children}
//     </Provider>
//   );
//   act(() => {jest.runAllTimers();});
//   return newTree;
// };

describe('TableView with expandable rows', function () {
  let offsetWidth, offsetHeight;

  beforeAll(function () {
    enableTableNestedRows();
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

  describe.each`
    Name                 | Component
    ${'static'}          | ${StaticExpandableTable}
    ${'dynamic'}         | ${DynamicExpandableTable}
  `('renders a $Name expandable rows table', ({Component}) => {
    let {getByRole} = render(<Component expandedKeys="all" />);

    let treegrid = getByRole('treegrid');
    expect(treegrid).toBeVisible();

    expect(treegrid).toHaveAttribute('aria-rowcount', '4');
    expect(treegrid).toHaveAttribute('aria-colcount', '3');

    let rowgroups = within(treegrid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]).not.toHaveAttribute('aria-rowindex');

    let headers = within(treegrid).getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');

    for (let header of headers) {
      expect(header).not.toHaveAttribute('aria-sort');
      expect(header).not.toHaveAttribute('aria-describedby');
    }

    expect(headers[0]).toHaveTextContent('Foo');
    expect(headers[1]).toHaveTextContent('Bar');
    expect(headers[2]).toHaveTextContent('Baz');

    // First row
    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(4);
    let row = rows[0];
    expect(row).toHaveAttribute('aria-expanded', true);
    expect(row).toHaveAttribute('aria-level', 1);
    expect(row).toHaveAttribute('aria-posinset', 1);
    expect(row).toHaveAttribute('aria-setsize', 1);
    expect(row).not.toHaveAttribute('aria-rowindex');

    let rowheader = within(row).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Lvl 1 Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '1');
    expect(row).toHaveAttribute('aria-labelledby', rowheader.id);

    let cells = within(row).getAllByRole('gridcell');
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveAttribute('aria-colindex', '2');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');

    // first child Row
    row = row[1];
    expect(row).toHaveAttribute('aria-expanded', true);
    expect(row).toHaveAttribute('aria-level', 2);
    expect(row).toHaveAttribute('aria-posinset', 1);
    expect(row).toHaveAttribute('aria-setsize', 2);
    expect(row).not.toHaveAttribute('aria-rowindex');

    rowheader = within(row).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Lvl 2 Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '1');
    expect(row).toHaveAttribute('aria-labelledby', rowheader.id);

    cells = within(row).getAllByRole('gridcell');
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveAttribute('aria-colindex', '2');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');

    // child of child Row
    row = row[2];
    expect(row).not.toHaveAttribute('aria-expanded');
    expect(row).toHaveAttribute('aria-level', 3);
    expect(row).toHaveAttribute('aria-posinset', 1);
    expect(row).toHaveAttribute('aria-setsize', 1);
    expect(row).not.toHaveAttribute('aria-rowindex');

    rowheader = within(row).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Lvl 3 Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '1');
    expect(row).toHaveAttribute('aria-labelledby', rowheader.id);

    cells = within(row).getAllByRole('gridcell');
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveAttribute('aria-colindex', '2');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');

    // 2nd child Row of original top level row
    row = row[3];
    expect(row).not.toHaveAttribute('aria-expanded');
    expect(row).toHaveAttribute('aria-level', 2);
    expect(row).toHaveAttribute('aria-posinset', 2);
    expect(row).toHaveAttribute('aria-setsize', 2);
    expect(row).not.toHaveAttribute('aria-rowindex');

    rowheader = within(row).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Lvl 2 Foo 2');
    expect(rowheader).toHaveAttribute('aria-colindex', '1');
    expect(row).toHaveAttribute('aria-labelledby', rowheader.id);

    cells = within(row).getAllByRole('gridcell');
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveAttribute('aria-colindex', '2');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
  });

  describe('keyboard focus', function () {
    // TODO: bring the same tests that table.test already has
    let focusCell = (tree, text) => act(() => getCell(tree, text).focus());
    let moveFocus = (key, opts = {}) => {
      fireEvent.keyDown(document.activeElement, {key, ...opts});
      fireEvent.keyUp(document.activeElement, {key, ...opts});
    };

    describe('ArrowDown', function () {
      it('should move focus down through nested rows', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        focusCell(treegrid, 'Row 1, Lvl 1, Foo');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 3, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 2, Lvl 1, Foo'));
      });
    });
  });

  // TODO: write tests for the following
  // static table
  // dynamic table
  // selection
  // expanding/collapsing table (pointer/touch)
  // persisted keys
  // keyboard interaction (arrow keys, page up/down, home, end, expanding/closing via right/left arrow, skipping over the chevron button)
  // empty state renders with treegrid props
  // loading state renders with treegrid props
  // calculated aria attributes update when rows are expanded/collapsed
});
