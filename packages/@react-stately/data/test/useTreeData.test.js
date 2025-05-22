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

import {actHook as act, renderHook} from '@react-spectrum/test-utils-internal';
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
let getChildren = (item) => item.children;

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

  it('should get a node by key', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    expect(result.current.getItem('Sam').value).toBe(initial[0].children[1]);
    expect(result.current.getItem('David').value).toBe(initial[0]);
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

  it('should update an root item', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));
    let initialResult = result.current;

    act(() => {
      result.current.update('David', {expanded: true, name: 'Danny'});
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].value).toEqual({expanded: true, name: 'Danny'});
    expect(result.current.items[0].parentKey).toBeNull();
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
    expect(result.current.items[0].children[1].children[0]).toEqual(initialResult.items[0].children[1].children[1]);
    expect(result.current.items[0].children[1].children[1]).toBe(initialResult.items[0].children[1].children[0]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('update parentKey when a node is moved to another parent', function () {
    const {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));

    act(() => {
      result.current.move('Brad', 'John', 0);
    });

    const john = result.current.items[0].children[0];
    const brad = john.children[0];
    expect(brad.parentKey).toBe(john.key);
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
    expect(result.current.items[0].children[0].children[0].value).toBe(initialResult.items[0].children[1].children[1].value);
    expect(result.current.items[0].children[0].children[1]).toBe(initialResult.items[0].children[0].children[0]);
    expect(result.current.items[0].children[1]).not.toBe(initialResult.items[0].children[1]);
    expect(result.current.items[0].children[1].children).toHaveLength(1);
    expect(result.current.items[0].children[1].children[0]).toBe(initialResult.items[0].children[1].children[0]);
    expect(result.current.items[0].children[2]).toBe(initialResult.items[0].children[2]);
  });

  it('should move all children of the moved target into the new map', function () {
    let {result} = renderHook(() =>
      useTreeData({initialItems: initial, getChildren, getKey})
    );
    expect(result.current.getItem('Stacy')).toBe(result.current.items[0].children[1].children[0]);

    act(() => {
      result.current.move('Sam', null, 0);
    });

    expect(result.current.getItem('Stacy')).toBe(result.current.items[0].children[0]);
  });

  it('should move an item to the root', function () {
    let {result} = renderHook(() =>
      useTreeData({initialItems: initial, getChildren, getKey})
    );
    let initialResult = result.current;

    act(() => {
      result.current.move('Stacy', null, 0);
    });

    expect(result.current.items).not.toBe(initialResult.items);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).not.toBe(initialResult.items[0]);
    expect(result.current.items[0].children).toHaveLength(0);
    expect(result.current.items[0].value).toEqual({name: 'Stacy'});
    expect(result.current.items[1]).not.toBe(initialResult.items[0]);
    expect(result.current.items[1].children).toHaveLength(3);
    expect(result.current.items[1].children[0]).toBe(
      initialResult.items[0].children[0]
    );
    expect(result.current.items[1].children[1]).not.toBe(
      initialResult.items[0].children[1]
    );
    expect(result.current.items[1].children[1].children).toHaveLength(1);
    expect(result.current.items[1].children[1].children[0]).toEqual(
      initialResult.items[0].children[1].children[1]
    );
    expect(result.current.items[1].children[2]).toBe(
      initialResult.items[0].children[2]
    );

    /*
      Expected tree structure after moving 'Stacy' to root:
      - Stacy
      - David
        |-- John
        |   -- Suzie
        |-- Sam
        |   -- Brad
        |-- Jane
    */
    let stacyNode = result.current.getItem('Stacy');
    expect(stacyNode.parentKey).toBeNull();
    expect(stacyNode.children).toHaveLength(0);
    expect(stacyNode).toBe(result.current.items[0]);

    let davidNode = result.current.getItem('David');
    expect(davidNode.parentKey).toBeNull();
    expect(davidNode.children.map(c => c.key)).toEqual(['John', 'Sam', 'Jane']);
    expect(davidNode).toBe(result.current.items[1]);

    let samNode = result.current.getItem('Sam');
    expect(samNode.parentKey).toBe('David');
    expect(samNode.children.map(c => c.key)).toEqual(['Brad']);
    expect(samNode).toBe(result.current.items[1].children[1]);

    let bradNode = result.current.getItem('Brad');
    expect(bradNode.parentKey).toBe('Sam');
    expect(bradNode).toBe(result.current.items[1].children[1].children[0]);

    let johnNode = result.current.getItem('John');
    expect(johnNode.parentKey).toBe('David');
    expect(johnNode).toBe(result.current.items[1].children[0]);

    let janeNode = result.current.getItem('Jane');
    expect(janeNode.parentKey).toBe('David');
    expect(janeNode).toBe(result.current.items[1].children[2]);
  });

  it('should move an item to a new index within its current parent', function () {
    let {result} = renderHook(() => useTreeData({initialItems: initial, getChildren, getKey}));

    expect(result.current.items[0].children[0].key).toBe('John');
    expect(result.current.items[0].children[1].key).toBe('Sam');
    expect(result.current.items[0].children[2].key).toBe('Jane');

    act(() => {
      result.current.move('Sam', 'David', 2);
    });

    expect(result.current.items[0].children[0].key).toBe('John');
    expect(result.current.items[0].children[1].key).toBe('Jane');
    expect(result.current.items[0].children[2].key).toBe('Sam');

    act(() => {
      result.current.move('Sam', 'David', 0);
    });

    expect(result.current.items[0].children[0].key).toBe('Sam');
    expect(result.current.items[0].children[1].key).toBe('John');
    expect(result.current.items[0].children[2].key).toBe('Jane');

    act(() => {
      result.current.move('Sam', 'David', 1);
    });

    expect(result.current.items[0].children[0].key).toBe('John');
    expect(result.current.items[0].children[1].key).toBe('Sam');
    expect(result.current.items[0].children[2].key).toBe('Jane');
  });

  it('should move an item to a new index within the root', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    let initialResult = result.current;

    act(() => {
      result.current.move('Eli', null, 1);
    });

    expect(result.current.items).not.toEqual(initialResult.items);
    expect(result.current.items).toHaveLength(initialResult.items.length);
    expect(result.current.items[0]).toEqual(initialResult.items[0]);
    expect(result.current.items[1].children).toEqual(initialResult.items[2].children);
    expect(result.current.items[1].key).toEqual(initialResult.items[2].key);
    expect(result.current.items[1].parentKey).toEqual(null);
    expect(result.current.items[1].value).toEqual(initialResult.items[2].value);
    expect(result.current.items[2]).toEqual(initialResult.items[1]);
  });

  it('should move an item multiple times within the root', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    let initialResult = result.current;

    act(() => {
      result.current.move('Eli', null, 2);
      result.current.move('Eli', null, 3);
      result.current.move('Eli', null, 1);
    });

    expect(result.current.items).not.toEqual(initialResult.items);
    expect(result.current.items).toHaveLength(initialResult.items.length);
    expect(result.current.items[0]).toEqual(initialResult.items[0]);
    expect(result.current.items[1].children).toEqual(initialResult.items[2].children);
    expect(result.current.items[1].key).toEqual(initialResult.items[2].key);
    expect(result.current.items[1].parentKey).toEqual(null);
    expect(result.current.items[1].value).toEqual(initialResult.items[2].value);
    expect(result.current.items[2]).toEqual(initialResult.items[1]);
  });


  it('should move an item within its same level before the target', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.move('Eli', null, 0);
    });
    expect(result.current.items[0].key).toEqual('Eli');
    expect(result.current.items[1].key).toEqual('David');
    expect(result.current.items[2].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(initialItems.length);
  });

  it('should move an item within its same level before the target by key', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.moveBefore('David', ['Suzie']);
    });
    expect(result.current.items[0].key).toEqual('Suzie');
    expect(result.current.items[1].key).toEqual('David');
    expect(result.current.items[2].key).toEqual('Emily');
    expect(result.current.items[3].key).toEqual('Eli');
    expect(result.current.items.length).toEqual(4);
    expect(result.current.items[1].children[0].key).toEqual('John');
    expect(result.current.items[1].children[0].children.length).toEqual(0);
  });

  it('should move an item within its same level before the target by keys', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.moveBefore('David', ['John', 'Eli']);
    });
    expect(result.current.items[0].key).toEqual('John');
    expect(result.current.items[1].key).toEqual('Eli');
    expect(result.current.items[2].key).toEqual('David');
    expect(result.current.items[3].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(4);
    expect(result.current.items[0].children[0].key).toEqual('Suzie');
    expect(result.current.items[1].children.length).toEqual(0);
    expect(result.current.items[2].children[0].key).toEqual('Sam');
  });

  it('should move an item within its same level before the target by keys with nested items and keep tree order', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.moveBefore('David', ['John', 'Eli', 'Suzie']);
    });
    expect(result.current.items[0].key).toEqual('John');
    expect(result.current.items[1].key).toEqual('Suzie');
    expect(result.current.items[2].key).toEqual('Eli');
    expect(result.current.items[3].key).toEqual('David');
    expect(result.current.items[4].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(5);
    expect(result.current.items[0].children.length).toEqual(0);
    expect(result.current.items[1].children.length).toEqual(0);
    expect(result.current.items[2].children.length).toEqual(0);
    expect(result.current.items[3].children[0].key).toEqual('Sam');
  });

  it('should move items down the tree', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.moveBefore('Suzie', ['Sam', 'Eli']);
    });
    expect(result.current.items[0].key).toEqual('David');
    expect(result.current.items[1].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(2);
    expect(result.current.items[0].children.length).toEqual(2);
    expect(result.current.items[1].children.length).toEqual(0);
    expect(result.current.items[0].children[0].children[0].key).toEqual('Sam');
    expect(result.current.items[0].children[0].children[1].key).toEqual('Eli');
    expect(result.current.items[0].children[0].children[2].key).toEqual('Suzie');
    expect(result.current.items[0].children[0].children.length).toEqual(3);
  });

  describe('moveBefore error', function () {
    const consoleError = console.error;
    beforeEach(() => {
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = consoleError;
    });

    it('cannot move an item within itself', function () {
      const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

      let {result} = renderHook(() =>
        useTreeData({initialItems, getChildren, getKey})
      );
      try {
        act(() => result.current.moveBefore('Suzie', ['John', 'Sam', 'Eli']));
      } catch (e) {
        expect(e.toString()).toContain('Cannot move an item to be a child of itself.');
      }
    });
  });

  it('should move an item within its same level after the target by key', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.moveAfter('David', ['Suzie']);
    });
    expect(result.current.items[0].key).toEqual('David');
    expect(result.current.items[1].key).toEqual('Suzie');
    expect(result.current.items[2].key).toEqual('Emily');
    expect(result.current.items[3].key).toEqual('Eli');
    expect(result.current.items.length).toEqual(4);
    expect(result.current.items[0].children[0].key).toEqual('John');
    expect(result.current.items[0].children[0].children.length).toEqual(0);
  });

  it('should move an item within its same level after the target by keys', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.moveAfter('David', ['John', 'Eli']);
    });
    expect(result.current.items[0].key).toEqual('David');
    expect(result.current.items[1].key).toEqual('John');
    expect(result.current.items[2].key).toEqual('Eli');
    expect(result.current.items[3].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(4);
    expect(result.current.items[0].children[0].key).toEqual('Sam');
    expect(result.current.items[1].children[0].key).toEqual('Suzie');
    expect(result.current.items[2].children.length).toEqual(0);
  });

  it('should move an item within its same level after the target by keys with nested items and keep tree order', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.moveAfter('David', ['John', 'Eli', 'Suzie']);
    });
    expect(result.current.items[0].key).toEqual('David');
    expect(result.current.items[1].key).toEqual('John');
    expect(result.current.items[2].key).toEqual('Suzie');
    expect(result.current.items[3].key).toEqual('Eli');
    expect(result.current.items[4].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(5);
    expect(result.current.items[0].children[0].key).toEqual('Sam');
    expect(result.current.items[1].children.length).toEqual(0);
    expect(result.current.items[2].children.length).toEqual(0);
    expect(result.current.items[3].children.length).toEqual(0);
  });

  it('should move an item to a different level before the target', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.move('Eli', 'David', 1);
    });
    expect(result.current.items[0].key).toEqual('David');

    expect(result.current.items[0].children[0].key).toEqual('John');
    expect(result.current.items[0].children[1].key).toEqual('Eli');
    expect(result.current.items[1].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(2);
  });

  it('can move an item multiple times', function () {
    const initialItems = [...initial, {name: 'Eli'}];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );
    act(() => {
      result.current.moveAfter('Eli', ['David']);
    });
    expect(result.current.items[0].key).toEqual('Eli');
    expect(result.current.items[1].key).toEqual('David');
    act(() => {
      result.current.moveAfter('David', ['Eli']);
    });
    expect(result.current.items[0].key).toEqual('David');
    expect(result.current.items[1].key).toEqual('Eli');
    act(() => {
      result.current.moveAfter('Eli', ['David']);
    });
    expect(result.current.items[0].key).toEqual('Eli');
    expect(result.current.items[1].key).toEqual('David');
    act(() => {
      result.current.moveAfter('David', ['Eli']);
    });
    expect(result.current.items[0].key).toEqual('David');
    expect(result.current.items[1].key).toEqual('Eli');

    // do the same with moveBefore
    act(() => {
      result.current.moveBefore('David', ['Eli']);
    });
    expect(result.current.items[0].key).toEqual('Eli');
    expect(result.current.items[1].key).toEqual('David');
    act(() => {
      result.current.moveBefore('Eli', ['David']);
    });
    expect(result.current.items[0].key).toEqual('David');
    expect(result.current.items[1].key).toEqual('Eli');
    act(() => {
      result.current.moveBefore('David', ['Eli']);
    });
    expect(result.current.items[0].key).toEqual('Eli');
    expect(result.current.items[1].key).toEqual('David');
    act(() => {
      result.current.moveBefore('Eli', ['David']);
    });
    expect(result.current.items[0].key).toEqual('David');
    expect(result.current.items[1].key).toEqual('Eli');
  });

  it('can move an item within its same level', function () {
    const initialItems = [
      {id: 'projects', name: 'Projects', childItems: [
        {id: 'project-1', name: 'Project 1'},
        {id: 'project-2', name: 'Project 2', childItems: [
          {id: 'project-2A', name: 'Project 2A'},
          {id: 'project-2B', name: 'Project 2B'},
          {id: 'project-2C', name: 'Project 2C'}
        ]},
        {id: 'project-3', name: 'Project 3'},
        {id: 'project-4', name: 'Project 4'},
        {id: 'project-5', name: 'Project 5', childItems: [
          {id: 'project-5A', name: 'Project 5A'},
          {id: 'project-5B', name: 'Project 5B'},
          {id: 'project-5C', name: 'Project 5C'}
        ]}
      ]},
      {id: 'reports', name: 'Reports', childItems: [
        {id: 'reports-1', name: 'Reports 1', childItems: [
          {id: 'reports-1A', name: 'Reports 1A', childItems: [
            {id: 'reports-1AB', name: 'Reports 1AB', childItems: [
              {id: 'reports-1ABC', name: 'Reports 1ABC'}
            ]}
          ]},
          {id: 'reports-1B', name: 'Reports 1B'},
          {id: 'reports-1C', name: 'Reports 1C'}
        ]},
        {id: 'reports-2', name: 'Reports 2'}
      ]}
    ];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren: (item) => item.childItems, getKey: (item) => item.id})
    );
    act(() => {
      result.current.moveAfter('project-3', ['project-2']);
    });
    expect(result.current.items[0].key).toEqual('projects');
    expect(result.current.items[0].children[0].key).toEqual('project-1');
    expect(result.current.items[0].children[1].key).toEqual('project-3');
    expect(result.current.items[0].children[2].key).toEqual('project-2');

    // move again to the same place
    act(() => {
      result.current.moveAfter('project-3', ['project-2']);
    });
    expect(result.current.items[0].key).toEqual('projects');
    expect(result.current.items[0].children[0].key).toEqual('project-1');
    expect(result.current.items[0].children[1].key).toEqual('project-3');
    expect(result.current.items[0].children[2].key).toEqual('project-2');

    // move to a different place
    act(() => {
      result.current.moveAfter('project-4', ['project-2']);
    });
    expect(result.current.items[0].key).toEqual('projects');
    expect(result.current.items[0].children[0].key).toEqual('project-1');
    expect(result.current.items[0].children[1].key).toEqual('project-3');
    expect(result.current.items[0].children[2].key).toEqual('project-4');
    expect(result.current.items[0].children[3].key).toEqual('project-2');
  });


  it('can move an item to a different level', function () {
    const initialItems = [
      {id: 'projects', name: 'Projects', childItems: [
        {id: 'project-1', name: 'Project 1'},
        {id: 'project-2', name: 'Project 2', childItems: [
          {id: 'project-2A', name: 'Project 2A'},
          {id: 'project-2B', name: 'Project 2B'},
          {id: 'project-2C', name: 'Project 2C'}
        ]},
        {id: 'project-3', name: 'Project 3'},
        {id: 'project-4', name: 'Project 4'},
        {id: 'project-5', name: 'Project 5', childItems: [
          {id: 'project-5A', name: 'Project 5A'},
          {id: 'project-5B', name: 'Project 5B'},
          {id: 'project-5C', name: 'Project 5C'}
        ]}
      ]},
      {id: 'reports', name: 'Reports', childItems: [
        {id: 'reports-1', name: 'Reports 1', childItems: [
          {id: 'reports-1A', name: 'Reports 1A', childItems: [
            {id: 'reports-1AB', name: 'Reports 1AB', childItems: [
              {id: 'reports-1ABC', name: 'Reports 1ABC'}
            ]}
          ]},
          {id: 'reports-1B', name: 'Reports 1B'},
          {id: 'reports-1C', name: 'Reports 1C'}
        ]},
        {id: 'reports-2', name: 'Reports 2'}
      ]}
    ];

    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren: (item) => item.childItems, getKey: (item) => item.id})
    );
    act(() => {
      result.current.moveBefore('project-2B', ['project-3']);
    });
    expect(result.current.items[0].key).toEqual('projects');
    expect(result.current.items[0].children[0].key).toEqual('project-1');
    expect(result.current.items[0].children[1].key).toEqual('project-2');

    expect(result.current.items[0].children[1].children[0].key).toEqual('project-2A');
    expect(result.current.items[0].children[1].children[1].key).toEqual('project-3');
    expect(result.current.items[0].children[1].children[2].key).toEqual('project-2B');
  });

  it('should move an item to a different level after the target', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];
    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );

    act(() => {
      result.current.move('Eli', 'David', 2);
    });
    expect(result.current.items[0].key).toEqual('David');

    expect(result.current.items[0].children[0].key).toEqual('John');
    expect(result.current.items[0].children[1].key).toEqual('Sam');
    expect(result.current.items[0].children[2].key).toEqual('Eli');
    expect(result.current.items[1].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(2);
  });

  it('should move an item to a different level at the end when the index is greater than the node list length', function () {
    const initialItems = [...initial, {name: 'Emily'}, {name: 'Eli'}];
    let {result} = renderHook(() =>
      useTreeData({initialItems, getChildren, getKey})
    );

    act(() => {
      result.current.move('Eli', 'David', 101);
    });
    expect(result.current.items[0].key).toEqual('David');

    expect(result.current.items[0].children[0].key).toEqual('John');
    expect(result.current.items[0].children[1].key).toEqual('Sam');
    expect(result.current.items[0].children[2].key).toEqual('Jane');
    expect(result.current.items[0].children[3].key).toEqual('Eli');
    expect(result.current.items[1].key).toEqual('Emily');
    expect(result.current.items.length).toEqual(2);
  });
});
