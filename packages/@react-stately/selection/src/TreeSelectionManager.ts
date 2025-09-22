/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Collection, Selection as ISelection, Key, Node} from '@react-types/shared';
import {getChildNodes} from '@react-stately/collections';
import {Selection} from './Selection';
import {SelectionManager} from './SelectionManager';
import {TreeSelectionState} from './types';

export class TreeSelectionManager extends SelectionManager {
  protected state: TreeSelectionState;
  private _indeterminateKeys: Set<Key> | null;
  private _selectedKeys: Set<Key> | null;

  constructor(collection: Collection<Node<unknown>>, state: TreeSelectionState) {
    super(collection, state);
    this.state = state;
    this._indeterminateKeys = null;
    this._selectedKeys = null;
  }

  protected get selection() {
    if (this.state.selectedKeys === 'all' || !this.isAutoTristate) {
      return this.state.selectedKeys;
    }

    if (this._selectedKeys != null) {
      return this._selectedKeys;
    }
    this._selectedKeys = new Selection(this.state.selectedKeys);
    this.applyAutoSelection(this.state.selectedKeys, this._selectedKeys);
    return this._selectedKeys;
  }

  protected setSelection(selection: ISelection) {
    if (selection === 'all' || selection.size === 0) {
      this.state.setSelectedKeys(selection);
      return;
    }
    this.propagateSelection(selection, this.selectionBehavior === 'toggle' ? this.selectedKeys : undefined);
  }

  private get indeterminateKeys() {
    if (this._indeterminateKeys != null) {
      return this._indeterminateKeys;
    }

    let keys = (this._indeterminateKeys = new Set<Key>());
    if (this.selection !== 'all') {
      this.selection.forEach(key => {
        for (let parent of getAncestors(this.collection, key)) {
          if (this.isSelected(parent.key)) {
            break;
          }

          if (this.isPartiallySelected(parent.key)) {
            keys.add(parent.key);
          }
        }
      });
    }
    return keys;
  }

  private get isAutoTristate() {
    return this.state.selectionPropagation && this.state.selectionMode === 'multiple';
  }

  private get whatToShow() {
    return this.isAutoTristate ? this.state.selectionStrategy : 'all';
  }

  forceUpdate(): void {
    if (this.state.selectedKeys !== 'all' && this.state.selectedKeys.size > 0) {
      let keys = this.filter(this.selectedKeys);
      this.state.setSelectedKeys(keys);
    }
  }

  isIndeterminate(key: Key): boolean {
    if (!this.isAutoTristate) {
      return false;
    }

    if (this.isSelected(key)) {
      return false;
    }

    let mappedKey = this.getKey(key);
    if (mappedKey == null) {
      return false;
    }
    return this.indeterminateKeys.has(mappedKey);
  }

  private applyAutoSelection(selectedKeys: Set<Key>, result: Set<Key>) {
    selectedKeys.forEach(key => {
      for (let child of getDescendants(this.collection, key)) {
        if (this.canSelectItem(child.key)) {
          result.add(child.key);
        }
      }
    });

    selectedKeys.forEach(key => {
      for (let parent of getAncestors(this.collection, key)) {
        if (!this.canSelectItem(parent.key)) {
          break;
        }

        let hasUnselectedItem = [...getChildren(this.collection, parent.key)].some(child => !result.has(child.key));
        if (hasUnselectedItem) {
          break;
        }
        result.add(parent.key);
      }
    });
  }

  private filter(selectedKeys: Set<Key>) {
    if (this.whatToShow === 'all' || selectedKeys.size <= 1) {
      return selectedKeys;
    }

    let keys = selectedKeys instanceof Selection ? new Selection([], selectedKeys.anchorKey, selectedKeys.currentKey) : new Set<Key>();
    if (this.whatToShow === 'parent') {
      for (let currentKey of selectedKeys) {
        let isChild = false;
        for (let parent of getAncestors(this.collection, currentKey)) {
          if (selectedKeys.has(parent.key)) {
            isChild = true;
            break;
          }
        }

        if (!isChild) {
          keys.add(currentKey);
        }
      }
    } else {
      for (let currentKey of selectedKeys) {
        let isParent = false;
        for (let child of getChildren(this.collection, currentKey)) {
          if (selectedKeys.has(child.key)) {
            isParent = true;
            break;
          }
        }

        if (!isParent) {
          keys.add(currentKey);
        }
      }
    }
    return keys;
  }

  private isPartiallySelected(key: Key) {
    let queue: Node<unknown>[] = [];
    queue.push(...getChildren(this.collection, key));

    let hasSelectedItem = false;
    let hasUnselectedItem = false;
    while (queue.length) {
      let length = queue.length;
      for (let i = 0; i < length; i++) {
        let child = queue.shift()!;
        if (this.selectedKeys.has(child.key)) {
          hasSelectedItem = true;
        } else {
          hasUnselectedItem = true;
        }

        if (hasSelectedItem && hasUnselectedItem) {
          return true;
        }

        if (hasUnselectedItem) {
          queue.push(...getChildren(this.collection, child.key));
        }
      }
    }
    return false;
  }

  private propagateSelection(newSelectedKeys: Set<Key>, oldSelectedKeys: Set<Key> = new Set()): void {
    let addedKeys = diffSelection(newSelectedKeys, oldSelectedKeys);
    let removedKeys = diffSelection(oldSelectedKeys, newSelectedKeys);
    if (addedKeys.size === 0 && removedKeys.size === 0) {
      return;
    }

    let selectedKeys = new Set(newSelectedKeys);
    if (this.isAutoTristate) {
      this.applyAutoSelection(addedKeys, selectedKeys);

      removedKeys.forEach(key => {
        for (let child of getDescendants(this.collection, key)) {
          selectedKeys.delete(child.key);
        }
      });

      removedKeys.forEach(key => {
        for (let parent of getAncestors(this.collection, key)) {
          selectedKeys.delete(parent.key);
        }
      });
    }

    // @ts-ignore
    let selection = new Selection(this.filter(selectedKeys), newSelectedKeys.anchorKey, newSelectedKeys.currentKey);
    this.state.setSelectedKeys(selection);
  }
}

function* getAncestors<T>(collection: Collection<Node<T>>, key: Key) {
  let item = collection.getItem(key);
  while (item?.parentKey != null) {
    item = collection.getItem(item.parentKey);
    if (item?.type === 'item') {
      yield item;
    }
  }
}

function* getChildren<T>(collection: Collection<Node<T>>, key: Key) {
  let item = collection.getItem(key);
  if (item?.type === 'item') {
    for (let child of getChildNodes(item, collection)) {
      if (child?.type === 'item') {
        yield child;
      }
    }
  }
}

function* getDescendants<T>(collection: Collection<Node<T>>, key: Key) {
  for (let child of getChildren(collection, key)) {
    yield child;
    yield* getDescendants(collection, child.key);
  }
}

function diffSelection(a: ISelection, b: ISelection): Set<Key> {
  let res = new Set<Key>();
  if (a === 'all' || b === 'all') {
    return res;
  }

  for (let key of a.keys()) {
    if (!b.has(key)) {
      res.add(key);
    }
  }

  return res;
}
