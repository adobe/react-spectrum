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

import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {useListData} from '../src/useListData';

const initial = [
  {name: 'David'},
  {name: 'Sam'},
  {name: 'Julia'}
];

let getKey = (item) => item.name;

describe('useListData', function () {
  it('should construct a list using initial data', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey, initialSelectedKeys: ['Sam', 'Julia']}));
    expect(result.current.items).toBe(initial);
    expect(result.current.selectedKeys).toEqual(new Set(['Sam', 'Julia']));
  });

  it('should get an item by key', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    expect(result.current.getItem('Sam')).toBe(initial[1]);
  });

  it('should insert an item at an index', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insert(1, {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(4);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toEqual({name: 'Devon'});
    expect(result.current.items[2]).toBe(initialResult.items[1]);
    expect(result.current.items[3]).toBe(initialResult.items[2]);
  });

  it('should insert multiple items at an index', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insert(1, {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(5);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toEqual({name: 'Devon'});
    expect(result.current.items[2]).toEqual({name: 'Danni'});
    expect(result.current.items[3]).toBe(initialResult.items[1]);
    expect(result.current.items[4]).toBe(initialResult.items[2]);
  });

  it('should insert an item before another item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertBefore('Sam', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(4);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toEqual({name: 'Devon'});
    expect(result.current.items[2]).toBe(initialResult.items[1]);
    expect(result.current.items[3]).toBe(initialResult.items[2]);
  });

  it('should insert multiple items before another item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertBefore('Sam', {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(5);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toEqual({name: 'Devon'});
    expect(result.current.items[2]).toEqual({name: 'Danni'});
    expect(result.current.items[3]).toBe(initialResult.items[1]);
    expect(result.current.items[4]).toBe(initialResult.items[2]);
  });

  it('should insert an item after another item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertAfter('David', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(4);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toEqual({name: 'Devon'});
    expect(result.current.items[2]).toBe(initialResult.items[1]);
    expect(result.current.items[3]).toBe(initialResult.items[2]);
  });

  it('should insert multiple items after another item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertAfter('David', {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(5);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toEqual({name: 'Devon'});
    expect(result.current.items[2]).toEqual({name: 'Danni'});
    expect(result.current.items[3]).toBe(initialResult.items[1]);
    expect(result.current.items[4]).toBe(initialResult.items[2]);
  });

  it('should insert an prepend an item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.prepend({name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(4);
    expect(result.current.items[0]).toEqual({name: 'Devon'});
    expect(result.current.items[1]).toBe(initialResult.items[0]);
    expect(result.current.items[2]).toBe(initialResult.items[1]);
    expect(result.current.items[3]).toBe(initialResult.items[2]);
  });

  it('should insert an prepend multiple items', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.prepend({name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(5);
    expect(result.current.items[0]).toEqual({name: 'Devon'});
    expect(result.current.items[1]).toEqual({name: 'Danni'});
    expect(result.current.items[2]).toBe(initialResult.items[0]);
    expect(result.current.items[3]).toBe(initialResult.items[1]);
    expect(result.current.items[4]).toBe(initialResult.items[2]);
  });

  it('should insert an append an item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.append({name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(4);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toBe(initialResult.items[1]);
    expect(result.current.items[2]).toBe(initialResult.items[2]);
    expect(result.current.items[3]).toEqual({name: 'Devon'});
  });

  it('should insert an append multiple items', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.append({name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(5);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toBe(initialResult.items[1]);
    expect(result.current.items[2]).toBe(initialResult.items[2]);
    expect(result.current.items[3]).toEqual({name: 'Devon'});
    expect(result.current.items[4]).toEqual({name: 'Danni'});
  });

  it('should remove an item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey, initialSelectedKeys: ['Sam', 'Julia']}));
    let initialResult = result.current;

    act(() => {
      result.current.remove('Sam');
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).toBe(initialResult.items[2]);
    expect(result.current.selectedKeys).not.toBe(initialResult.selectedKeys);
    expect(result.current.selectedKeys).toEqual(new Set(['Julia']));
  });

  it('should remove multiple items', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey, initialSelectedKeys: ['Sam', 'David', 'Julia']}));
    let initialResult = result.current;

    act(() => {
      result.current.remove('Sam', 'David');
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toBe(initialResult.items[2]);
    expect(result.current.selectedKeys).not.toBe(initialResult.selectedKeys);
    expect(result.current.selectedKeys).toEqual(new Set(['Julia']));
  });

  it('should remove the selected items', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey, initialSelectedKeys: ['Sam', 'Julia']}));
    let initialResult = result.current;

    act(() => {
      result.current.removeSelectedItems();
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.selectedKeys).not.toBe(initialResult.selectedKeys);
    expect(result.current.selectedKeys).toEqual(new Set());
  });

  it('should update an item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.update('Sam', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1]).not.toBe(initialResult.items[1]);
    expect(result.current.items[1]).toEqual({name: 'Devon'});
    expect(result.current.items[2]).toBe(initialResult.items[2]);
  });

  it('should move an item', function () {
    let {result} = renderHook(() => useListData({initialItems: initial, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.move('Sam', 0);
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0]).toBe(initialResult.items[1]);
    expect(result.current.items[1]).toBe(initialResult.items[0]);
    expect(result.current.items[2]).toBe(initialResult.items[2]);
  });
});
