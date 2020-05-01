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

import {act, renderHook} from 'react-hooks-testing-library';
import React from 'react';
import {useTreeData} from '../src/useTreeData';

const initial = [
  {
    name: 'David',
    children: [
      {name: 'John', children: [
        {name: 'Suzie'}
      ]},
      {name: 'Sam', children: [
        {name: 'Stacy'},
        {name: 'Brad'}
      ]},
      {name: 'Jane'}
    ]
  }
];

let getKey = (item) => item.name;
let getChildren = (item) => item.children || [];

describe('useTreeData', function () {
  it('should construct a tree using initial data', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey, initialSelectedKeys: ['John', 'Stacy']}));
    expect(result.current.items[0].value).toBe(initial[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0].value).toBe(initial[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(1);
    expect(result.current.items[0].children[1].children).toHaveLength(2);
    expect(result.current.items[0].children[2].children).toHaveLength(0);
    expect(result.current.selectedKeys).toEqual(new Set(['John', 'Stacy']));
  });

  it('should insert an item into a child node', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insert('John', 1, {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(2);
    expect(result.current.items[0].children[0].children[0]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[0].children[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should insert multiple items into a child node', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insert('John', 1, {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0].children[0]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[0].children[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[0].children[2].value).toEqual({name: 'Danni'});
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should insert an item into the root', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insert(null, 1, {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1].value).toEqual({name: 'Devon'});
  });

  it('should insert multiple items into the root', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insert(null, 1, {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[2].value).toEqual({name: 'Danni'});
  });

  it('should insert an item into a child node before another item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertBefore('Suzie', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(2);
    expect(result.current.items[0].children[0].children[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[0].children[1]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should insert multiple items into a child node before another item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertBefore('Suzie', {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0].children[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[0].children[1].value).toEqual({name: 'Danni'});
    expect(result.current.items[0].children[0].children[2]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should insert an item into the root before another item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertBefore('David', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[1]).toBe(initialResult.items[0]);
  });

  it('should insert multiple items into the root before another item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertBefore('David', {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[1].value).toEqual({name: 'Danni'});
    expect(result.current.items[2]).toBe(initialResult.items[0]);
  });

  it('should insert an item into a child node after another item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertAfter('Suzie', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(2);
    expect(result.current.items[0].children[0].children[0]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[0].children[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should insert multiple items into a child node after another item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertAfter('Suzie', {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0].children[0]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[0].children[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[0].children[2].value).toEqual({name: 'Danni'});
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should insert an item into the root after another item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertAfter('David', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1].value).toEqual({name: 'Devon'});
  });

  it('should insert multiple items into the root after another item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.insertAfter('David', {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[2].value).toEqual({name: 'Danni'});
  });

  it('should prepend an item into a child node', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.prepend('John', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(2);
    expect(result.current.items[0].children[0].children[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[0].children[1]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should prepend multiple items into a child node', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.prepend('John', {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0].children[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[0].children[1].value).toEqual({name: 'Danni'});
    expect(result.current.items[0].children[0].children[2]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should prepend an item into the root', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.prepend(null, {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[1]).toBe(initialResult.items[0]);
  });

  it('should prepend multiple items into the root', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.prepend(null, {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[1].value).toEqual({name: 'Danni'});
    expect(result.current.items[2]).toBe(initialResult.items[0]);
  });

  it('should append an item into a child node', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.append('John', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(2);
    expect(result.current.items[0].children[0].children[0]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[0].children[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should append multiple items into a child node', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.append('John', {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0].children[0]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[0].children[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[0].children[2].value).toEqual({name: 'Danni'});
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should append an item into the root', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.append(null, {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1].value).toEqual({name: 'Devon'});
  });

  it('should append multiple items into the root', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.append(null, {name: 'Devon'}, {name: 'Danni'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0]).toBe(initialResult.items[0]);
    expect(result.current.items[1].value).toEqual({name: 'Devon'});
    expect(result.current.items[2].value).toEqual({name: 'Danni'});
  });

  it('should remove an item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey, initialSelectedKeys: ['Suzie', 'Sam']}));
    let initialResult = result.current;

    act(() => {
      result.current.remove('Suzie');
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(0);
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
    expect(result.current.selectedKeys).not.toBe(initialResult.selectedKeys);
    expect(result.current.selectedKeys).toEqual(new Set(['Sam']));
  });

  it('should remove multiple items', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey, initialSelectedKeys: ['Brad', 'Sam']}));
    let initialResult = result.current;

    act(() => {
      result.current.remove('Suzie', 'Brad');
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(0);
    expect(result.current.items[0].children[1]).not.toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[1].children).toHaveLength(1);
    expect(result.current.items[0].children[1].children[0]).toBe(initialResult.items[0].children[1].children[0]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
    expect(result.current.selectedKeys).not.toBe(initialResult.selectedKeys);
    expect(result.current.selectedKeys).toEqual(new Set(['Sam']));
  });

  it('should remove an item from the root', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey, initialSelectedKeys: ['David', 'Suzie']}));
    let initialResult = result.current;

    act(() => {
      result.current.remove('David');
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(0);
    expect(result.current.selectedKeys).not.toBe(initialResult.selectedKeys);
    expect(result.current.selectedKeys).toEqual(new Set());
  });

  it('should remove the selected items', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey, initialSelectedKeys: ['Suzie', 'Brad']}));
    let initialResult = result.current;

    act(() => {
      result.current.removeSelectedItems();
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(0);
    expect(result.current.items[0].children[1]).not.toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[1].children).toHaveLength(1);
    expect(result.current.items[0].children[1].children[0]).toBe(initialResult.items[0].children[1].children[0]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
    expect(result.current.selectedKeys).not.toBe(initialResult.selectedKeys);
    expect(result.current.selectedKeys).toEqual(new Set());
  });

  it('should update an item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.update('Suzie', {name: 'Devon'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(1);
    expect(result.current.items[0].children[0].children[0]).not.toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[0].children[0].value).toEqual({name: 'Devon'});
    expect(result.current.items[0].children[1]).toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should move an item within the same parent', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.move('Brad', 'Sam', 0);
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[1]).not.toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[1].children).toHaveLength(2);
    expect(result.current.items[0].children[1].children[0]).toBe(initialResult.items[0].children[1].children[1]);
    expect(result.current.items[0].children[1].children[1]).toBe(initialResult.items[0].children[1].children[0]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should move an item to a different parent', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.move('Brad', 'John', 0);
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0]).not.toBe(initialResult.items[0].children[0]);
    expect(result.current.items[0].children[0].children).toHaveLength(2);
    expect(result.current.items[0].children[0].children[0]).toBe(initialResult.items[0].children[1].children[1]);
    expect(result.current.items[0].children[0].children[1]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[1]).not.toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[1].children).toHaveLength(1);
    expect(result.current.items[0].children[1].children[0]).toBe(initialResult.items[0].children[1].children[0]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });
});
