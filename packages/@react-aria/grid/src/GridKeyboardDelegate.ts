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

import {Direction, DisabledBehavior, Key, KeyboardDelegate, LayoutDelegate, Node, Rect, RefObject, Size} from '@react-types/shared';
import {DOMLayoutDelegate} from '@react-aria/selection';
import {getChildNodes, getFirstItem, getLastItem, getNthItem} from '@react-stately/collections';
import {GridCollection} from '@react-types/grid';

export interface GridKeyboardDelegateOptions<C> {
  collection: C,
  disabledKeys: Set<Key>,
  disabledBehavior?: DisabledBehavior,
  ref?: RefObject<HTMLElement | null>,
  direction: Direction,
  collator?: Intl.Collator,
  layoutDelegate?: LayoutDelegate,
  /** @deprecated - Use layoutDelegate instead. */
  layout?: DeprecatedLayout,
  focusMode?: 'row' | 'cell'
}

export class GridKeyboardDelegate<T, C extends GridCollection<T>> implements KeyboardDelegate {
  collection: C;
  protected disabledKeys: Set<Key>;
  protected disabledBehavior: DisabledBehavior;
  protected direction: Direction;
  protected collator: Intl.Collator;
  protected layoutDelegate: LayoutDelegate;
  protected focusMode;

  constructor(options: GridKeyboardDelegateOptions<C>) {
    this.collection = options.collection;
    this.disabledKeys = options.disabledKeys;
    this.disabledBehavior = options.disabledBehavior || 'all';
    this.direction = options.direction;
    this.collator = options.collator;
    this.layoutDelegate = options.layoutDelegate || (options.layout ? new DeprecatedLayoutDelegate(options.layout) : new DOMLayoutDelegate(options.ref));
    this.focusMode = options.focusMode || 'row';
  }

  protected isCell(node: Node<T>) {
    return node.type === 'cell';
  }

  protected isRow(node: Node<T>) {
    return node.type === 'row' || node.type === 'item';
  }

  private isDisabled(item: Node<unknown>) {
    return this.disabledBehavior === 'all' && (item.props?.isDisabled || this.disabledKeys.has(item.key));
  }

  protected findPreviousKey(fromKey?: Key, pred?: (item: Node<T>) => boolean) {
    let key = fromKey != null
      ? this.collection.getKeyBefore(fromKey)
      : this.collection.getLastKey();

    while (key != null) {
      let item = this.collection.getItem(key);
      if (!this.isDisabled(item) && (!pred || pred(item))) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }
  }

  protected findNextKey(fromKey?: Key, pred?: (item: Node<T>) => boolean) {
    let key = fromKey != null
      ? this.collection.getKeyAfter(fromKey)
      : this.collection.getFirstKey();

    while (key != null) {
      let item = this.collection.getItem(key);
      if (!this.isDisabled(item) && (!pred || pred(item))) {
        return key;
      }

      key = this.collection.getKeyAfter(key);
    }
  }

  getKeyBelow(key: Key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) {
      return;
    }

    // If focus was on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }

    // Find the next item
    key = this.findNextKey(key, (item => item.type === 'item'));
    if (key != null) {
      // If focus was on a cell, focus the cell with the same index in the next row.
      if (this.isCell(startItem)) {
        let item = this.collection.getItem(key);
        return getNthItem(getChildNodes(item, this.collection), startItem.index).key;
      }

      // Otherwise, focus the next row
      if (this.focusMode === 'row') {
        return key;
      }
    }
  }

  getKeyAbove(key: Key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) {
      return;
    }

    // If focus is on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }

    // Find the previous item
    key = this.findPreviousKey(key, item => item.type === 'item');
    if (key != null) {
      // If focus was on a cell, focus the cell with the same index in the previous row.
      if (this.isCell(startItem)) {
        let item = this.collection.getItem(key);
        return getNthItem(getChildNodes(item, this.collection), startItem.index).key;
      }

      // Otherwise, focus the previous row
      if (this.focusMode === 'row') {
        return key;
      }
    }
  }

  getKeyRightOf(key: Key) {
    let item = this.collection.getItem(key);
    if (!item) {
      return;
    }

    // If focus is on a row, focus the first child cell.
    if (this.isRow(item)) {
      let children = getChildNodes(item, this.collection);
      return this.direction === 'rtl'
        ? getLastItem(children).key
        : getFirstItem(children).key;
    }

    // If focus is on a cell, focus the next cell if any,
    // otherwise focus the parent row.
    if (this.isCell(item)) {
      let parent = this.collection.getItem(item.parentKey);
      let children = getChildNodes(parent, this.collection);
      let next = this.direction === 'rtl'
        ? getNthItem(children, item.index - 1)
        : getNthItem(children, item.index + 1);

      if (next) {
        return next.key;
      }

      // focus row only if focusMode is set to row
      if (this.focusMode === 'row') {
        return item.parentKey;
      }

      return this.direction === 'rtl' ? this.getFirstKey(key) : this.getLastKey(key);
    }
  }

  getKeyLeftOf(key: Key) {
    let item = this.collection.getItem(key);
    if (!item) {
      return;
    }

    // If focus is on a row, focus the last child cell.
    if (this.isRow(item)) {
      let children = getChildNodes(item, this.collection);
      return this.direction === 'rtl'
        ? getFirstItem(children).key
        : getLastItem(children).key;
    }

    // If focus is on a cell, focus the previous cell if any,
    // otherwise focus the parent row.
    if (this.isCell(item)) {
      let parent = this.collection.getItem(item.parentKey);
      let children = getChildNodes(parent, this.collection);
      let prev = this.direction === 'rtl'
        ? getNthItem(children, item.index + 1)
        : getNthItem(children, item.index - 1);

      if (prev) {
        return prev.key;
      }

      // focus row only if focusMode is set to row
      if (this.focusMode === 'row') {
        return item.parentKey;
      }

      return this.direction === 'rtl' ? this.getLastKey(key) : this.getFirstKey(key);
    }
  }

  getFirstKey(key?: Key, global?: boolean) {
    let item: Node<T>;
    if (key != null) {
      item = this.collection.getItem(key);
      if (!item) {
        return;
      }

      // If global flag is not set, and a cell is currently focused,
      // move focus to the first cell in the parent row.
      if (this.isCell(item) && !global) {
        let parent = this.collection.getItem(item.parentKey);
        return getFirstItem(getChildNodes(parent, this.collection)).key;
      }
    }

    // Find the first row
    key = this.findNextKey(null, item => item.type === 'item');

    // If global flag is set (or if focus mode is cell), focus the first cell in the first row.
    if ((key != null && item && this.isCell(item) && global) || this.focusMode === 'cell') {
      let item = this.collection.getItem(key);
      key = getFirstItem(getChildNodes(item, this.collection)).key;
    }

    // Otherwise, focus the row itself.
    return key;
  }

  getLastKey(key?: Key, global?: boolean) {
    let item: Node<T>;
    if (key != null) {
      item = this.collection.getItem(key);
      if (!item) {
        return;
      }

      // If global flag is not set, and a cell is currently focused,
      // move focus to the last cell in the parent row.
      if (this.isCell(item) && !global) {
        let parent = this.collection.getItem(item.parentKey);
        let children = getChildNodes(parent, this.collection);
        return getLastItem(children).key;
      }
    }

    // Find the last row
    key = this.findPreviousKey(null, item => item.type === 'item');

    // If global flag is set (or if focus mode is cell), focus the last cell in the last row.
    if ((key != null && item && this.isCell(item) && global) || this.focusMode === 'cell') {
      let item = this.collection.getItem(key);
      let children = getChildNodes(item, this.collection);
      key = getLastItem(children).key;
    }

    // Otherwise, focus the row itself.
    return key;
  }

  getKeyPageAbove(key: Key) {
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    let pageY = Math.max(0, itemRect.y + itemRect.height - this.layoutDelegate.getVisibleRect().height);

    while (itemRect && itemRect.y > pageY) {
      key = this.getKeyAbove(key);
      itemRect = this.layoutDelegate.getItemRect(key);
    }

    return key;
  }

  getKeyPageBelow(key: Key) {
    let itemRect = this.layoutDelegate.getItemRect(key);

    if (!itemRect) {
      return null;
    }

    let pageHeight = this.layoutDelegate.getVisibleRect().height;
    let pageY = Math.min(this.layoutDelegate.getContentSize().height, itemRect.y + pageHeight);

    while (itemRect && (itemRect.y + itemRect.height) < pageY) {
      let nextKey = this.getKeyBelow(key);
      // If nextKey is undefined, we've reached the last row already
      if (nextKey == null) {
        break;
      }

      itemRect = this.layoutDelegate.getItemRect(nextKey);
      key = nextKey;
    }

    return key;
  }

  getKeyForSearch(search: string, fromKey?: Key) {
    if (!this.collator) {
      return null;
    }

    let collection = this.collection;
    let key = fromKey ?? this.getFirstKey();

    // If the starting key is a cell, search from its parent row.
    let startItem = collection.getItem(key);
    if (startItem.type === 'cell') {
      key = startItem.parentKey;
    }

    let hasWrapped = false;
    while (key != null) {
      let item = collection.getItem(key);

      // check row text value for match
      if (item.textValue) {
        let substring = item.textValue.slice(0, search.length);
        if (this.collator.compare(substring, search) === 0) {
          if (this.isRow(item) && this.focusMode === 'cell') {
            return getFirstItem(getChildNodes(item, this.collection)).key;
          }

          return item.key;
        }
      }

      key = this.findNextKey(key, item => item.type === 'item');

      // Wrap around when reaching the end of the collection
      if (key == null && !hasWrapped) {
        key = this.getFirstKey();
        hasWrapped = true;
      }
    }

    return null;
  }
}

/* Backward compatibility for old Virtualizer Layout interface. */
interface DeprecatedLayout {
  getLayoutInfo(key: Key): DeprecatedLayoutInfo,
  getContentSize(): Size,
  virtualizer: DeprecatedVirtualizer
}

interface DeprecatedLayoutInfo {
  rect: Rect
}

interface DeprecatedVirtualizer {
  visibleRect: Rect
}

class DeprecatedLayoutDelegate implements LayoutDelegate {
  layout: DeprecatedLayout;

  constructor(layout: DeprecatedLayout) {
    this.layout = layout;
  }

  getContentSize(): Size {
    return this.layout.getContentSize();
  }

  getItemRect(key: Key): Rect | null {
    return this.layout.getLayoutInfo(key)?.rect || null;
  }

  getVisibleRect(): Rect {
    return this.layout.virtualizer.visibleRect;
  }
}
