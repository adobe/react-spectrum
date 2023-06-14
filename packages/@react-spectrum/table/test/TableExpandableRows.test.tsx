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
import {Scale} from '@react-types/provider';
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

let render = (children, scale = 'medium' as Scale, locale = 'en-US') => {
  enableTableNestedRows();
  let tree = renderComponent(
    <Provider theme={theme} scale={scale} locale={locale}>
      {children}
    </Provider>
  );

  act(() => {jest.runAllTimers();});
  return tree;
};

let rerender = (tree, children, scale = 'medium' as Scale) => {
  let newTree = tree.rerender(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );
  act(() => {jest.runAllTimers();});
  return newTree;
};

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

  it.each`
    Name                 | Component
    ${'static'}          | ${StaticExpandableTable}
    ${'dynamic'}         | ${DynamicExpandableTable}
  `('renders a $Name expandable rows table', ({Component}) => {
    let {getByRole} = render(<Component expandedKeys="all" />);

    let treegrid = getByRole('treegrid');
    expect(treegrid).toBeVisible();

    expect(treegrid).toHaveAttribute('aria-rowcount', '5');
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
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(row).toHaveAttribute('aria-level', '1');
    expect(row).toHaveAttribute('aria-posinset', '1');
    expect(row).toHaveAttribute('aria-setsize', '1');
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
    row = rows[1];
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(row).toHaveAttribute('aria-level', '2');
    expect(row).toHaveAttribute('aria-posinset', '1');
    expect(row).toHaveAttribute('aria-setsize', '2');
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
    row = rows[2];
    expect(row).not.toHaveAttribute('aria-expanded');
    expect(row).toHaveAttribute('aria-level', '3');
    expect(row).toHaveAttribute('aria-posinset', '1');
    expect(row).toHaveAttribute('aria-setsize', '1');
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
    row = rows[3];
    expect(row).not.toHaveAttribute('aria-expanded');
    expect(row).toHaveAttribute('aria-level', '2');
    expect(row).toHaveAttribute('aria-posinset', '2');
    expect(row).toHaveAttribute('aria-setsize', '2');
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

  it.each`
    Name                 | Component
    ${'static'}          | ${StaticExpandableTable}
    ${'dynamic'}         | ${DynamicExpandableTable}
  `('renders a $Name expandable rows table with selection', ({Component}) => {
    let {getByRole} = render(<Component expandedKeys="all" selectionMode="multiple" />);

    let treegrid = getByRole('treegrid');
    expect(treegrid).toHaveAttribute('aria-multiselectable', 'true');
    expect(treegrid).toHaveAttribute('aria-colcount', '4');

    let rowgroups = within(treegrid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headers = within(treegrid).getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');
    expect(headers[3]).toHaveAttribute('aria-colindex', '4');

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    // First row
    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(4);
    let row = rows[0];

    let rowheader = within(row).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Lvl 1 Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');
    expect(row).toHaveAttribute('aria-labelledby', rowheader.id);

    checkbox = within(row).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(row).getAllByRole('gridcell');
    expect(cells).toHaveLength(3);
    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '4');

    // first child Row
    row = rows[1];
    rowheader = within(row).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Lvl 2 Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');
    expect(row).toHaveAttribute('aria-labelledby', rowheader.id);

    checkbox = within(row).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    cells = within(row).getAllByRole('gridcell');
    expect(cells).toHaveLength(3);
    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '4');

    // child of child Row
    row = rows[2];
    rowheader = within(row).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Lvl 3 Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');
    expect(row).toHaveAttribute('aria-labelledby', rowheader.id);

    cells = within(row).getAllByRole('gridcell');
    expect(cells).toHaveLength(3);
    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '4');

    // 2nd child Row of original top level row
    row = rows[3];
    rowheader = within(row).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Lvl 2 Foo 2');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');
    expect(row).toHaveAttribute('aria-labelledby', rowheader.id);

    cells = within(row).getAllByRole('gridcell');
    expect(cells).toHaveLength(3);
    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '4');
  });

  it('shouldn\'t render a child row if its parent isn\'t included in the expanded keys', function () {
    let treegrid = render(<DynamicExpandableTable expandedKeys={['Lvl 2 Foo 1']} />);
    let rowgroups = treegrid.getAllByRole('rowgroup');
    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toContainElement(getCell(treegrid, 'Lvl 1 Foo 1'));
    rerender(treegrid, <DynamicExpandableTable expandedKeys={['Lvl 2 Foo 1', 'Lvl 1 Foo 1']} />);
    rowgroups = treegrid.getAllByRole('rowgroup');
    rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(4);
  });

  describe('keyboard focus', function () {
    // TODO: bring the same tests that table.test already has
    let focusCell = (tree, text) => act(() => getCell(tree, text).focus());
    let moveFocus = (key, opts = {}) => {
      fireEvent.keyDown(document.activeElement, {key, ...opts});
      fireEvent.keyUp(document.activeElement, {key, ...opts});
    };

    // TODO: for arrow down/up check that it lands on column header as well
    // Also check that it skips collapsed rows
    describe('ArrowDown', function () {
      it('should move focus to the nested row\'s below', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        let rows = treegrid.getAllByRole('row');
        act(() => {rows[1].focus();});
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(rows[2]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(rows[3]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 1, Lvl 3, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(rows[4]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 2, Lvl 1, Foo'));
      });

      it('should move focus to the nested row\'s cell below', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        focusCell(treegrid, 'Row 1, Lvl 1, Foo');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 3, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 2, Lvl 1, Foo'));
      });

      it('should move focus to the cell below a column header', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        focusCell(treegrid, 'Bar');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 1, Bar'));
      });

      it('should allow the user to focus disabled nested rows', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" disabledKeys={['Row 1 Lvl 2']} />);
        focusCell(treegrid, 'Row 1, Lvl 1, Foo');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
      });

      it('should skip child rows of non-expanded parent rows', function () {
        // Only one child level of Row 1 and Row 3 should be exposed, otherwise only the top level rows are rendered
        let treegrid = render(<ManyRowsExpandableTable expandedKeys={['Row 1 Lvl 1', 'Row 3 Lvl 1']} />);
        let rows = treegrid.getAllByRole('row');
        act(() => {rows[1].focus();});
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(rows[2]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(rows[3]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 2, Lvl 1, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(rows[4]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 3, Lvl 1, Foo'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(rows[5]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 3, Lvl 2, Foo'));
      });
    });

    describe('ArrowUp', function () {
      it('should move focus to the nested row\'s above', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        let rows = treegrid.getAllByRole('row');
        act(() => {rows[4].focus();});
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(rows[3]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 1, Lvl 3, Foo'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(rows[2]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(rows[1]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 1, Lvl 1, Foo'));
      });

      it('should move focus to the nested row\'s cell above', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        focusCell(treegrid, 'Row 2, Lvl 1, Foo');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 3, Foo'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 1, Foo'));
      });

      it('should move focus to the column header above a cell in the first row ', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        focusCell(treegrid, 'Row 1, Lvl 1, Bar');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(treegrid, 'Bar'));
      });

      it('should move focus to the column header above the first row', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        let rows = treegrid.getAllByRole('row');
        act(() => {rows[1].focus();});
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(treegrid, 'Foo'));
      });

      it('should allow the user to focus disabled nested rows', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" disabledKeys={['Row 1 Lvl 2']} />);
        focusCell(treegrid, 'Row 1, Lvl 3, Foo');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
      });

      it('should skip child rows of non-expanded parent rows', function () {
        // Only one child level of Row 1 and Row 3 should be exposed, otherwise only the top level rows are rendered
        let treegrid = render(<ManyRowsExpandableTable expandedKeys={['Row 1 Lvl 1', 'Row 3 Lvl 1']} />);
        let rows = treegrid.getAllByRole('row');
        act(() => {rows[5].focus();});
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(rows[4]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 3, Lvl 1, Foo'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(rows[3]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 2, Lvl 1, Foo'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(rows[2]);
        expect(document.activeElement).toContainElement(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
      });
    });

    describe('ArrowRight', function () {
      it('should properly wrap focus with ArrowRight', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        let row = treegrid.getAllByRole('row')[2];
        focusCell(treegrid, 'Row 1, Lvl 2, Foo');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Bar'));
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Baz'));
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(row);
        expect(row).toContainElement(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
      });

      it('should properly wrap focus with ArrowRight (RTL)', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />, undefined, 'ar-AE');
        let row = treegrid.getAllByRole('row')[2];
        focusCell(treegrid, 'Row 1, Lvl 2, Foo');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(row);
        expect(row).toContainElement(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Baz'));
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Bar'));
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
      });
    });

    describe('ArrowLeft', function () {
      it('should properly wrap focus with ArrowLeft', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />);
        let row = treegrid.getAllByRole('row')[2];
        focusCell(treegrid, 'Row 1, Lvl 2, Foo');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(row);
        expect(row).toContainElement(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Baz'));
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Bar'));
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
      });

      it('should properly wrap focus with ArrowRight (RTL)', function () {
        let treegrid = render(<ManyRowsExpandableTable expandedKeys="all" />, undefined, 'ar-AE');
        let row = treegrid.getAllByRole('row')[2];
        focusCell(treegrid, 'Row 1, Lvl 2, Foo');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Bar'));
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Baz'));
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(row);
        expect(row).toContainElement(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(getCell(treegrid, 'Row 1, Lvl 2, Foo'));
      });
    });
    // TODO add End/Home/PageUp/Down and check that it can land on a nested row

    // Test that type to select works with nested rows
  });

  // TODO: write tests for the following
  // selection (nested rows are selected on click, selected when all selection checkbox is pressed, multiple range selection including nested keys, test standard keyboard selection still works with expanded keyboard interactions)
  // expanding/collapsing table (pointer/touch), check the aria values set (wait for interactions to be finalized to make testing that easier)
  // persisted keys
  // keyboard interaction (arrow keys, page up/down, home, end, expanding/closing via right/left arrow, skipping over the chevron button)
  // empty state renders with treegrid props
  // loading state renders with treegrid props
  // calculated aria attributes update when rows are expanded/collapsed
});
