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

interface ListOptions<T extends object> {
  initialItems?: T[],
  initialSelectedKeys?: Iterable<Key>,
  getKey?: (item: T) => Key
}

interface ListData<T extends object> {
  /** The items in the list. */
  items: T[],

  /** The keys of the currently selected items in the list. */
  selectedKeys: Set<Key>,

  /** Sets the selected keys. */
  setSelectedKeys(keys: Set<Key>): void,

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

/**
 * Manages state for an immutable list data structure, and provides convenience methods to
 * update the data over time.
 */
export function useListData<T extends object>(opts: ListOptions<T>): ListData<T> {
  let {
    initialItems = [],
    initialSelectedKeys,
    getKey = (item: any) => item.id || item.key
  } = opts;
  let [items, setItems] = useState(initialItems);
  let [selectedKeys, setSelectedKeys] = useState(new Set<Key>(initialSelectedKeys || []));

  return {
    items,
    selectedKeys,
    setSelectedKeys,
    insert(index: number, ...values: T[]) {
      setItems(items => [
        ...items.slice(0, index),
        ...values,
        ...items.slice(index)
      ]);
    },
    insertBefore(key: Key, ...values: T[]) {
      let index = items.findIndex(item => getKey(item) === key);
      if (index === -1) {
        return;
      }

      this.insert(index, ...values);
    },
    insertAfter(key: Key, ...values: T[]) {
      let index = items.findIndex(item => getKey(item) === key);
      if (index === -1) {
        return;
      }

      this.insert(index + 1, ...values);
    },
    prepend(...values: T[]) {
      this.insert(0, ...values);
    },
    append(...values: T[]) {
      this.insert(items.length, ...values);
    },
    remove(...keys: Key[]) {
      let keySet = new Set(keys);
      setItems(items => items.filter(item => !keySet.has(getKey(item))));

      let selection = new Set(selectedKeys);
      for (let key of keys) {
        selection.delete(key);
      }

      setSelectedKeys(selection);
    },
    removeSelectedItems() {
      this.remove(...selectedKeys);
    },
    move(key: Key, toIndex: number) {
      setItems(items => {
        let index = items.findIndex(item => getKey(item) === key);
        if (index === -1) {
          return items;
        }

        let copy = items.slice();
        let [item] = copy.splice(index, 1);
        copy.splice(toIndex, 0, item);
        return copy;
      });
    },
    update(key: Key, newValue: T) {
      setItems(items => {
        let index = items.findIndex(item => getKey(item) === key);
        if (index === -1) {
          return items;
        }

        return [
          ...items.slice(0, index),
          newValue,
          ...items.slice(index + 1)
        ];
      });
    }
  };
}
