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

import {Key, useState} from 'react';

interface ListOptions<T> {
  initialItems?: T[],
  initialSelectedKeys?: Iterable<Key>,
  getKey?: (item: T) => Key
}

export interface ListData<T> {
  /** The items in the list. */
  items: T[],

  /** The keys of the currently selected items in the list. */
  selectedKeys: Set<Key>,

  /** Sets the selected keys. */
  setSelectedKeys(keys: Set<Key>): void,

  /**
   * Gets an item from the list by key.
   * @param key - the key of the item to retrieve.
   */
  getItem(key: Key): T,

  /**
   * Inserts items into the list at the given index.
   * @param index - the index to insert into.
   * @param values - the values to insert.
   */
  insert(index: number, ...values: T[]): void,

  /**
   * Inserts items into the list before the item at the given key.
   * @param key - the key of the item to insert before.
   * @param values - the values to insert.
   */
  insertBefore(key: Key, ...values: T[]): void,

  /**
   * Inserts items into the list after the item at the given key.
   * @param key - the key of the item to insert after.
   * @param values - the values to insert.
   */
  insertAfter(key: Key, ...values: T[]): void,

  /**
   * Appends items to the list.
   * @param values - the values to insert.
   */
  append(...values: T[]): void,

  /**
   * Prepends items to the list.
   * @param value - the value to insert.
   */
  prepend(...values: T[]): void,

  /**
   * Removes items from the list by their keys.
   * @param keys - the keys of the item to remove.
   */
  remove(...keys: Key[]): void,

  /**
   * Removes all items from the list that are currently 
   * in the set of selected items.
   */
  removeSelectedItems(): void,

  /**
   * Moves an item within the list.
   * @param key - the key of the item to move.
   * @param toIndex - the index to move the item to.
   */
  move(key: Key, toIndex: number): void,

  /**
   * Updates an item in the list.
   * @param key - the key of the item to update.
   * @param newValue - the new value for the item.
   */
  update(key: Key, newValue: T): void
}

export interface ListState<T> {
  items: T[],
  selectedKeys: Set<Key>
}

/**
 * Manages state for an immutable list data structure, and provides convenience methods to
 * update the data over time.
 */
export function useListData<T>(opts: ListOptions<T>): ListData<T> {
  let {
    initialItems = [],
    initialSelectedKeys,
    getKey = (item: any) => item.id || item.key
  } = opts;
  let [state, setState] = useState<ListState<T>>({
    items: initialItems,
    selectedKeys: new Set<Key>(initialSelectedKeys || [])
  });

  return {
    ...state,
    ...createListActions({getKey}, setState),
    getItem(key: Key) {
      return state.items.find(item => getKey(item) === key);
    }
  };
}

function insert<T>(state: ListState<T>, index: number, ...values: T[]): ListState<T> {
  return {
    ...state,
    items: [
      ...state.items.slice(0, index),
      ...values,
      ...state.items.slice(index)
    ]
  };
}

export function createListActions<T>(opts: ListOptions<T>, dispatch: (updater: (state: ListState<T>) => ListState<T>) => void): Omit<ListData<T>, 'items' | 'selectedKeys' | 'getItem'> {
  let {getKey} = opts;
  return {
    setSelectedKeys(selectedKeys: Set<Key>) {
      dispatch(state => ({
        ...state,
        selectedKeys
      }));
    },
    insert(index: number, ...values: T[]) {
      dispatch(state => insert(state, index, ...values));
    },
    insertBefore(key: Key, ...values: T[]) {
      dispatch(state => {
        let index = state.items.findIndex(item => getKey(item) === key);
        if (index === -1) {
          return;
        }

        return insert(state, index, ...values);
      });
    },
    insertAfter(key: Key, ...values: T[]) {
      dispatch(state => {
        let index = state.items.findIndex(item => getKey(item) === key);
        if (index === -1) {
          return;
        }

        return insert(state, index + 1, ...values);
      });
    },
    prepend(...values: T[]) {
      dispatch(state => insert(state, 0, ...values));
    },
    append(...values: T[]) {
      dispatch(state => insert(state, state.items.length, ...values));
    },
    remove(...keys: Key[]) {
      dispatch(state => {
        let keySet = new Set(keys);
        let items = state.items.filter(item => !keySet.has(getKey(item)));

        let selection = new Set(state.selectedKeys);
        for (let key of keys) {
          selection.delete(key);
        }

        return {
          ...state,
          items,
          selectedKeys: selection
        };
      });
    },
    removeSelectedItems() {
      dispatch(state => {
        let items = state.items.filter(item => !state.selectedKeys.has(getKey(item)));
        return {
          ...state,
          items,
          selectedKeys: new Set()
        }
      });
    },
    move(key: Key, toIndex: number) {
      dispatch(state => {
        let index = state.items.findIndex(item => getKey(item) === key);
        if (index === -1) {
          return state;
        }

        let copy = state.items.slice();
        let [item] = copy.splice(index, 1);
        copy.splice(toIndex, 0, item);
        return {
          ...state,
          items: copy
        };
      });
    },
    update(key: Key, newValue: T) {
      dispatch(state => {
        let index = state.items.findIndex(item => getKey(item) === key);
        if (index === -1) {
          return state;
        }

        return {
          ...state,
          items: [
            ...state.items.slice(0, index),
            newValue,
            ...state.items.slice(index + 1)
          ]
        };
      });
    }
  };
}
