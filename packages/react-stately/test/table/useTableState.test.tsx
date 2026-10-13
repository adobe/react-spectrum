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

import {act, renderHook} from '@react-spectrum/test-utils-internal';
import {GridNode} from '../../src/grid/GridCollection';
import {ITableCollection, TableCollection} from '../../src/table/TableCollection';
import {SortDescriptor} from '@react-types/shared';
import {UNSTABLE_useFilteredTableState, useTableState} from '../../src/table/useTableState';
import {useMultipleSelectionState} from '../../src/selection/useMultipleSelectionState';

function createTableCollection<T extends object = object>() {
  let bodyNode: GridNode<T> = {
    type: 'body',
    key: 'body',
    value: null,
    textValue: '',
    level: 0,
    index: 0,
    hasChildNodes: false,
    rendered: null,
    childNodes: [],
    props: {}
  };
  let columnNode: GridNode<T> = {
    type: 'column',
    key: 'col1',
    value: null,
    textValue: 'Col 1',
    level: 0,
    index: 0,
    hasChildNodes: false,
    rendered: null,
    childNodes: [],
    props: {}
  };
  return new TableCollection<T>([columnNode, bodyNode]);
}

describe('useTableState', () => {
  it('should memoize state when props do not change', () => {
    let collection = createTableCollection();
    let {result: selResult} = renderHook(() => useMultipleSelectionState({}));
    let UNSAFE_selectionState = selResult.current;

    let {result, rerender} = renderHook(props => useTableState(props), {
      initialProps: {collection, UNSAFE_selectionState}
    });

    let initial = result.current;
    rerender({collection, UNSAFE_selectionState});
    expect(Object.is(result.current, initial)).toBe(true);
  });

  it('should preserve expandedKeys identity across renders when controlled', () => {
    let collection = createTableCollection();
    let {result: selResult} = renderHook(() => useMultipleSelectionState({}));
    let UNSAFE_selectionState = selResult.current;
    let expandedKeys = new Set(['1']);

    let {result, rerender} = renderHook(props => useTableState(props), {
      initialProps: {collection, expandedKeys, UNSAFE_selectionState}
    });

    let initial = result.current;
    expect(initial.expandedKeys).toEqual(new Set(['1']));

    rerender({collection, expandedKeys, UNSAFE_selectionState});
    expect(result.current.expandedKeys).toBe(initial.expandedKeys);
    expect(Object.is(result.current, initial)).toBe(true);
  });

  it('updates state when sortDescriptor changes', () => {
    let collection = createTableCollection();
    let {result, rerender} = renderHook(props => useTableState(props), {
      initialProps: {
        collection,
        sortDescriptor: {column: 'col1', direction: 'ascending'} as SortDescriptor
      }
    });

    let initial = result.current;
    rerender({
      collection,
      sortDescriptor: {column: 'col1', direction: 'descending'} as SortDescriptor
    });
    expect(result.current).not.toBe(initial);
    expect(result.current.sortDescriptor).toEqual({column: 'col1', direction: 'descending'});
  });

  it('updates state when expandedKeys changes', () => {
    let collection = createTableCollection();
    let {result, rerender} = renderHook(props => useTableState(props), {
      initialProps: {collection, expandedKeys: new Set(['1'])}
    });

    let initial = result.current;
    rerender({collection, expandedKeys: new Set(['1', '2'])});
    expect(result.current).not.toBe(initial);
    expect(result.current.expandedKeys).toEqual(new Set(['1', '2']));
  });

  it('supports uncontrolled expansion toggleKey', () => {
    let collection = createTableCollection();
    let {result} = renderHook(() =>
      useTableState({collection, defaultExpandedKeys: new Set(['1'])})
    );

    let initial = result.current;
    expect(initial.expandedKeys).toEqual(new Set(['1']));

    act(() => {
      initial.toggleKey('2');
    });
    expect(result.current.expandedKeys).toEqual(new Set(['1', '2']));
    expect(result.current).not.toBe(initial);

    act(() => {
      result.current.toggleKey('1');
    });
    expect(result.current.expandedKeys).toEqual(new Set(['2']));
  });

  it('supports controlled expansion toggleKey calling onExpandedChange', () => {
    let collection = createTableCollection();
    let onExpandedChange = jest.fn();
    let {result} = renderHook(() =>
      useTableState({collection, expandedKeys: new Set(['1']), onExpandedChange})
    );

    act(() => {
      result.current.toggleKey('2');
    });
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(['1', '2']));
  });

  it('updates state when collection changes', () => {
    let col1 = createTableCollection();
    let col2 = createTableCollection();
    let {result, rerender} = renderHook(props => useTableState(props), {
      initialProps: {collection: col1}
    });

    let initial = result.current;
    rerender({collection: col2});
    expect(result.current).not.toBe(initial);
    expect(result.current.collection).toBe(col2);
  });

  describe('UNSTABLE_useFilteredTableState', () => {
    it('returns the same state when unfiltered', () => {
      let collection = createTableCollection();
      let {result: stateResult} = renderHook(() => useTableState({collection}));
      let state = stateResult.current;

      let {result, rerender} = renderHook(
        ({state, filter}) => UNSTABLE_useFilteredTableState(state, filter),
        {initialProps: {state, filter: undefined}}
      );

      expect(result.current).toBe(state);

      rerender({state, filter: undefined});
      expect(result.current).toBe(state);
    });

    it('memoizes filtered state when filter function and state do not change', () => {
      let collection = createTableCollection() as ITableCollection<object>;
      collection.filter = jest.fn(() => collection);
      let {result: stateResult} = renderHook(() => useTableState({collection}));
      let state = stateResult.current;
      let filterFn = () => true;

      let {result, rerender} = renderHook(
        ({state, filter}) => UNSTABLE_useFilteredTableState(state, filter),
        {initialProps: {state, filter: filterFn}}
      );

      let initialFiltered = result.current;
      rerender({state, filter: filterFn});
      expect(result.current).toBe(initialFiltered);
    });

    it('updates filtered state when underlying state changes', () => {
      let col1 = createTableCollection() as ITableCollection<object>;
      let col2 = createTableCollection() as ITableCollection<object>;
      col1.filter = jest.fn(() => col1);
      col2.filter = jest.fn(() => col2);
      let {result: stateResult, rerender: rerenderState} = renderHook(
        props => useTableState(props),
        {initialProps: {collection: col1}}
      );
      let filterFn = () => true;

      let {result, rerender} = renderHook(
        ({state, filter}) => UNSTABLE_useFilteredTableState(state, filter),
        {initialProps: {state: stateResult.current, filter: filterFn}}
      );

      let initial = result.current;
      rerenderState({collection: col2});
      rerender({state: stateResult.current, filter: filterFn});

      expect(result.current).not.toBe(initial);
    });
  });
});
