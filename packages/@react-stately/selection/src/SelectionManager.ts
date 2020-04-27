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
import {SelectionMode} from '@react-types/shared';

interface SelectionManagerOptions {
  allowsCellSelection?: boolean
}

/**
 * An interface for reading and updating multiple selection state.
 */
export class SelectionManager implements MultipleSelectionManager {
  private collection: Collection<Node<unknown>>;
  private state: MultipleSelectionState;
  private allowsCellSelection: boolean;
  private _isSelectAll: boolean;

  constructor(collection: Collection<Node<unknown>>, state: MultipleSelectionState, options?: SelectionManagerOptions) {
    this.collection = collection;
    this.state = state;
    this.allowsCellSelection = options?.allowsCellSelection ?? false;
    this._isSelectAll = null;
  }

  get selectionMode(): SelectionMode {
    return this.state.selectionMode;
  }

  get disallowEmptySelection(): boolean {
    return this.state.disallowEmptySelection;
  }

  get isFocused(): boolean {
    return this.state.isFocused;
  }

  setFocused(isFocused: boolean) {
    this.state.setFocused(isFocused);
  }

  get focusedKey(): Key {
    return this.state.focusedKey;
  }

  setFocusedKey(key: Key) {
    this.state.setFocusedKey(key);
  }

  get selectedKeys(): Set<Key> {
    return this.state.selectedKeys;
  }

  setSelectedKeys(keys: Selection) {
    this.state.setSelectedKeys(keys);
  }

  isSelected(key: Key) {
    return this.state.selectedKeys.has(key);
  }

  get isEmpty() {
    return this.state.selectedKeys.size === 0;
  }

  get isSelectAll() {
    if (this._isSelectAll != null) {
      return this._isSelectAll;
    }

    let allKeys = this.getSelectAllKeys();
    this._isSelectAll = allKeys.every(k => this.state.selectedKeys.has(k));
    return this._isSelectAll;
  }

  extendSelection(toKey: Key) {
    toKey = this.getKey(toKey);
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
    let fromItem = this.collection.getItem(from);
    let toItem = this.collection.getItem(to);
    if (fromItem && toItem) {
      if (fromItem.index <= toItem.index) {
        return this.getKeyRangeInternal(from, to);
      }

      return this.getKeyRangeInternal(to, from);
    }

    return [];
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

    return [];
  }

  private getKey(key: Key) {
    let item = this.collection.getItem(key);
    if (!item) {
      // ¯\_(ツ)_/¯
      return key;
    }

    // If cell selection is allowed, just return the key.
    if (item.type === 'cell' && this.allowsCellSelection) {
      return key;
    }

    // Find a parent item to select
    while (item.type !== 'item' && item.parentKey) {
      item = this.collection.getItem(item.parentKey);
    }

    if (!item || item.type !== 'item') {
      return null;
    }

    return item.key;
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
    let keys = [];
    let addKeys = (key: Key) => {
      while (key) {
        let item = this.collection.getItem(key);
        if (item.type === 'item') {
          keys.push(key);
        }
        
        // Add child keys. If cell selection is allowed, then include item children too.
        if (item.hasChildNodes && (this.allowsCellSelection || item.type !== 'item')) {
          addKeys([...item.childNodes][0].key);
        }

        key = this.collection.getKeyAfter(key);
      }
    };

    addKeys(this.collection.getFirstKey());
    return keys;
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
