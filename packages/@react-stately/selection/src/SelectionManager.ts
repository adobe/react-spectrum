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

import {Collection, Node} from '@react-stately/collections';
import {Key} from 'react';
import {MultipleSelectionManager, MultipleSelectionState} from './types';
import {Selection} from './Selection';

interface SelectionManagerOptions {
  allowsCellSelection?: boolean
}

export class SelectionManager<T> implements MultipleSelectionManager {
  private collection: Collection<Node<T>>;
  private state: MultipleSelectionState;
  private allowsCellSelection: boolean;

  constructor(collection: Collection<Node<T>>, state: MultipleSelectionState, options?: SelectionManagerOptions) {
    this.collection = collection;
    this.state = state;
    this.allowsCellSelection = options?.allowsCellSelection ?? false;
  }

  get selectionMode() {
    return this.state.selectionMode;
  }

  get isFocused() {
    return this.state.isFocused;
  }

  setFocused(isFocused: boolean) {
    this.state.setFocused(isFocused);
  }

  get focusedKey() {
    return this.state.focusedKey;
  }

  setFocusedKey(key: Key) {
    this.state.setFocusedKey(key);
  }

  get selectedKeys() {
    return this.state.selectedKeys;
  }

  setSelectedKeys(keys: Selection) {
    this.state.setSelectedKeys(keys);
  }

  get isEmpty() {
    return this.state.selectedKeys.size === 0;
  }

  get isSelectAll() {
    let allKeys = this.getSelectAllKeys();
    return allKeys.every(k => this.state.selectedKeys.has(k));
  }

  extendSelection(toKey: Key) {
    this.state.setSelectedKeys((selectedKeys: Selection) => {
      let anchorKey = selectedKeys.anchorKey || toKey;
      let keys = new Selection(selectedKeys, anchorKey, toKey);
      for (let key of this.getKeyRange(anchorKey, selectedKeys.currentKey || toKey)) {
        keys.delete(key);
      }

      for (let key of this.getKeyRange(toKey, anchorKey)) {
        keys.add(key);
      }

      return keys;
    });
  }

  private getKeyRange(from: Key, to: Key) {
    return this.getKeyRangeInternal(from, to) || this.getKeyRangeInternal(to, from) || [];
  }

  private getKeyRangeInternal(from: Key, to: Key) {
    let keys: Key[] = [];
    let key = from;
    while (key) {
      let item = this.collection.getItem(key);
      if (item && item.type === 'item' || (item.type === 'cell' && this.allowsCellSelection)) {
        keys.push(key);
      }

      if (key === to) {
        return keys;
      }

      key = this.collection.getKeyAfter(key);
    }

    return null;
  }

  private getKey(key: Key) {
    let item = this.collection.getItem(key);
    if (!item) {
      // ¯\_(ツ)_/¯
      return key;
    }

    if (!this.allowsCellSelection && item.type === 'cell') {
      key = item.parentKey;
    } else if (item.type !== 'item') {
      return null;
    }

    return key;
  }

  toggleSelection(key: Key) {
    key = this.getKey(key);
    if (key == null) {
      return;
    }

    this.state.setSelectedKeys(selectedKeys => {
      let keys = new Selection(selectedKeys);
      if (keys.has(key)) {
        keys.delete(key);
        // TODO: move anchor to last selected key...
        // Does `current` need to move here too?
      } else {
        keys.add(key);
        keys.anchorKey = key;
        keys.currentKey = key;
      }

      return keys;
    });
  }

  replaceSelection(key: Key) {
    key = this.getKey(key);
    if (key == null) {
      return;
    }
    
    this.state.setSelectedKeys(new Selection([key], key, key));
  }

  private getSelectAllKeys() {
    return [...this.collection.getKeys()].filter(key => {
      let item = this.collection.getItem(key);
      if (!item) {
        return false;
      }

      return item.type === 'item' ||
        (item.type === 'cell' && this.allowsCellSelection);
    });
  }

  selectAll() {
    let keys = this.getSelectAllKeys();
    this.state.setSelectedKeys(new Selection(keys, keys[0], keys[keys.length - 1]));
  }

  clearSelection() {
    this.state.setSelectedKeys(new Selection());
  }

  toggleSelectAll() {
    if (this.isSelectAll) {
      this.clearSelection();
    } else {
      this.selectAll();
    }
  }
}
