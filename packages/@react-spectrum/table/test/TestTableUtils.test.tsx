/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, render, screen} from '@react-spectrum/test-utils-internal';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
import {installPointerEvent, User} from '@react-aria/test-utils';
import {Provider} from '@react-spectrum/provider';
import React, {useState} from 'react';
import {theme} from '@react-spectrum/theme-default';

let manyItems = [] as any[];
for (let i = 1; i <= 10; i++) {
  manyItems.push({id: i, foo: 'Foo ' + i, bar: 'Bar ' + i, baz: 'Baz ' + i});
}

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

// getComputedStyle is very slow in our version of jsdom.
// These tests only care about direct inline styles. We can avoid parsing other stylesheets.
window.getComputedStyle = (el) => (el as HTMLElement).style;

describe('Table ', function () {
  let onSelectionChange = jest.fn();
  let onSortChange = jest.fn();
  let testUtilRealTimer = new User({advanceTimer: (waitTime) => new Promise((resolve) => setTimeout(resolve, waitTime))});

  beforeAll(function () {
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 50);
  });

  let TableExample = (props) => {
    let [sort, setSort] = useState({});
    let setSortDescriptor = (sort) => {
      setSort(sort);
      onSortChange(sort);
    };

    return (
      <Provider theme={theme}>
        <TableView aria-label="Table" selectionMode="multiple" data-testid="test" sortDescriptor={sort} onSortChange={setSortDescriptor} onSelectionChange={onSelectionChange} {...props}>
          <TableHeader columns={columns}>
            {column => <Column allowsSorting allowsResizing={props.allowsResizing}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={manyItems}>
            {item =>
              (<Row key={item.foo}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>)
            }
          </TableBody>
        </TableView>
      </Provider>
    );
  };

  describe.each`
    interactionType
    ${'mouse'}
    ${'keyboard'}
    ${'touch'}
  `('with real timers, interactionType: $interactionType ', ({interactionType}) => {
    beforeAll(function () {
      jest.useRealTimers();
    });

    afterEach(function () {
      jest.clearAllMocks();
    });

    it('basic flow with TableTester', async function () {
      render(<TableExample />);
      let tableTester = testUtilRealTimer.createTester('Table', {root: screen.getByTestId('test')});
      tableTester.setInteractionType(interactionType);
      await tableTester.toggleRowSelection({row: 2});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['Foo 3']));

      await tableTester.toggleRowSelection({row: 'Foo 4'});
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['Foo 3', 'Foo 4']));

      await tableTester.toggleSelectAll();
      expect(onSelectionChange).toHaveBeenCalledTimes(3);
      expect((onSelectionChange.mock.calls[2][0])).toEqual('all');

      await tableTester.toggleSort({column: 2});
      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'bar', direction: 'ascending'});

      await tableTester.toggleSort({column: 'Foo'});
      expect(onSortChange).toHaveBeenCalledTimes(2);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'foo', direction: 'ascending'});

      await tableTester.toggleSort({column: 'Foo'});
      expect(onSortChange).toHaveBeenCalledTimes(3);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'foo', direction: 'descending'});
    });


    it('basic flow with TableTester (testing menu sort change and highlight selection)', async function () {
      render(<TableExample allowsResizing selectionStyle="highlight" />);
      let tableTester = testUtilRealTimer.createTester('Table', {root: screen.getByTestId('test')});
      tableTester.setInteractionType(interactionType);
      await tableTester.toggleRowSelection({row: 2});
      // Called multiple times because highlight selections will change selection on focus unless you use
      // a modifier key
      if (interactionType === 'keyboard') {
        expect(onSelectionChange).toHaveBeenCalledTimes(3);
      } else {
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
      }
      expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 3']));

      await tableTester.toggleRowSelection({row: 'Foo 4'});
      if (interactionType === 'keyboard') {
        expect(onSelectionChange).toHaveBeenCalledTimes(4);
      } else {
        expect(onSelectionChange).toHaveBeenCalledTimes(2);
      }
      expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 4']));

      await tableTester.toggleSort({column: 2});
      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'baz', direction: 'ascending'});

      await tableTester.toggleSort({column: 'Foo'});
      expect(onSortChange).toHaveBeenCalledTimes(2);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'foo', direction: 'ascending'});

      await tableTester.toggleSort({column: 'Foo'});
      expect(onSortChange).toHaveBeenCalledTimes(3);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'foo', direction: 'descending'});
    });
  });

  describe('long press, real timers', () => {
    installPointerEvent();
    beforeAll(function () {
      jest.useRealTimers();
    });

    afterEach(function () {
      jest.clearAllMocks();
    });

    it('highlight selection should switch to selection mode on long press', async function () {
      render(<TableExample allowsResizing selectionStyle="highlight" />);
      let tableTester = testUtilRealTimer.createTester('Table', {root: screen.getByTestId('test'), interactionType: 'touch'});
      tableTester.setInteractionType('touch');
      await tableTester.toggleRowSelection({row: 2, needsLongPress: true});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['Foo 3']));

      await tableTester.toggleRowSelection({row: 'Foo 4'});
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['Foo 3', 'Foo 4']));
    });
  });

  describe.each`
    interactionType
    ${'mouse'}
    ${'keyboard'}
    ${'touch'}
  `('with fake timers, interactionType: $interactionType ', ({interactionType}) => {
    let testUtilFakeTimer = new User({advanceTimer: jest.advanceTimersByTime});
    // For proper touch simulation
    installPointerEvent();
    beforeAll(function () {
      jest.useFakeTimers();
    });

    afterEach(function () {
      act(() => jest.runAllTimers());
      jest.clearAllMocks();
    });

    it('basic flow with TableTester', async function () {
      render(<TableExample />);
      let tableTester = testUtilFakeTimer.createTester('Table', {root: screen.getByTestId('test')});
      tableTester.setInteractionType(interactionType);
      await tableTester.toggleRowSelection({row: 2});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['Foo 3']));

      await tableTester.toggleRowSelection({row: 'Foo 4'});
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['Foo 3', 'Foo 4']));

      await tableTester.toggleSelectAll();
      expect(onSelectionChange).toHaveBeenCalledTimes(3);
      expect((onSelectionChange.mock.calls[2][0])).toEqual('all');

      await tableTester.toggleSort({column: 2});
      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'bar', direction: 'ascending'});

      await tableTester.toggleSort({column: 'Foo'});
      expect(onSortChange).toHaveBeenCalledTimes(2);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'foo', direction: 'ascending'});

      await tableTester.toggleSort({column: 'Foo'});
      expect(onSortChange).toHaveBeenCalledTimes(3);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'foo', direction: 'descending'});
    });


    it('basic flow with TableTester (testing menu sort change and highlight selection)', async function () {
      render(<TableExample allowsResizing selectionStyle="highlight" />);
      let tableTester = testUtilFakeTimer.createTester('Table', {root: screen.getByTestId('test')});
      tableTester.setInteractionType(interactionType);

      await tableTester.toggleRowSelection({row: 2});
      // Called multiple times because highlight selections will change selection on focus unless you use
      // a modifier key
      if (interactionType === 'keyboard') {
        expect(onSelectionChange).toHaveBeenCalledTimes(3);
      } else {
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
      }
      expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 3']));

      await tableTester.toggleRowSelection({row: 'Foo 4'});
      if (interactionType === 'keyboard') {
        expect(onSelectionChange).toHaveBeenCalledTimes(4);
      } else {
        expect(onSelectionChange).toHaveBeenCalledTimes(2);
      }

      // touch always acts as toggle
      if (interactionType === 'touch') {
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 3', 'Foo 4']));
      } else {
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 4']));
      }


      await tableTester.toggleSort({column: 2});
      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'baz', direction: 'ascending'});

      await tableTester.toggleSort({column: 'Foo'});
      expect(onSortChange).toHaveBeenCalledTimes(2);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'foo', direction: 'ascending'});

      await tableTester.toggleSort({column: 'Foo'});
      expect(onSortChange).toHaveBeenCalledTimes(3);
      expect(onSortChange).toHaveBeenLastCalledWith({column: 'foo', direction: 'descending'});
    });

    it('highlight selection with modifier key', async function () {
      render(<TableExample allowsResizing selectionStyle="highlight" />);
      let tableTester = testUtilFakeTimer.createTester('Table', {root: screen.getByTestId('test')});
      tableTester.setInteractionType(interactionType);

      await tableTester.toggleRowSelection({row: 2, selectionBehavior: 'replace'});
      // Called multiple times because highlight selections will change selection on focus unless you use
      // a modifier key
      if (interactionType === 'keyboard') {
        expect(onSelectionChange).toHaveBeenCalledTimes(2);
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 1', 'Foo 3']));
      } else {
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 3']));
      }

      await tableTester.toggleRowSelection({row: 'Foo 4', selectionBehavior: 'replace'});
      if (interactionType === 'keyboard') {
        expect(onSelectionChange).toHaveBeenCalledTimes(3);
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 1', 'Foo 3', 'Foo 4']));
      } else {
        expect(onSelectionChange).toHaveBeenCalledTimes(2);
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['Foo 3', 'Foo 4']));
      }
    });
  });

  describe('long press, fake timers', () => {
    installPointerEvent();
    let testUtilFakeTimer = new User({interactionType: 'touch', advanceTimer: jest.advanceTimersByTime});
    beforeAll(function () {
      jest.useFakeTimers();
    });

    afterEach(function () {
      act(() => jest.runAllTimers());
      jest.clearAllMocks();
    });

    it('highlight selection should switch to selection mode on long press', async function () {
      render(<TableExample allowsResizing selectionStyle="highlight" />);
      let tableTester = testUtilFakeTimer.createTester('Table', {root: screen.getByTestId('test')});

      await tableTester.toggleRowSelection({row: 2, needsLongPress: true});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['Foo 3']));

      await tableTester.toggleRowSelection({row: 'Foo 4'});
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['Foo 3', 'Foo 4']));
    });
  });
});
