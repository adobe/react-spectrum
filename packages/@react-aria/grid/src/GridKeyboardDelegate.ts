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

import {Direction, KeyboardDelegate} from '@react-types/shared';
import {GridCollection} from '@react-stately/grid';
import {Key, RefObject} from 'react';
import {Node} from '@react-stately/collections';

export class GridKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: GridCollection<T>;
  private ref: RefObject<HTMLElement>;
  private direction: Direction;
  private collator: Intl.Collator;

  constructor(collection: GridCollection<T>, ref: RefObject<HTMLElement>, direction: Direction, collator?: Intl.Collator) {
    this.collection = collection;
    this.ref = ref;
    this.direction = direction;
    this.collator = collator;
  }

  private isCell(node: Node<T>) {
    return node.type === 'cell' || node.type === 'rowheader';
  }

  private findPreviousKey(pred: (item: Node<T>) => boolean, fromKey?: Key) {
    let key = fromKey != null 
      ? this.collection.getKeyBefore(fromKey) 
      : this.collection.getLastKey();

    while (key != null) {
      let item = this.collection.getItem(key);
      if (pred(item)) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }
  }

  private findNextKey(pred: (item: Node<T>) => boolean, fromKey?: Key) {
    let key = fromKey != null 
      ? this.collection.getKeyAfter(fromKey)
      : this.collection.getFirstKey();

    while (key != null) {
      let item = this.collection.getItem(key);
      if (pred(item)) {
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

    // If focus was on a column, then focus the first child column if any,
    // or find the corresponding cell in the first row.
    if (startItem.type === 'column') {
      let child = [...startItem.childNodes][0];
      if (child) {
        return child.key;
      }

      return this.findNextKey(item => 
        this.isCell(item) && item.index === startItem.index
      );
    }

    // If focus was on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }
    
    // Find the next enabled item
    key = this.findNextKey(item => item.type === 'item' && !item.isDisabled, key);
    if (key != null) {
      // If focus was on a cell, focus the cell with the same index in the next row.
      if (this.isCell(startItem)) {
        let item = this.collection.getItem(key);
        return [...item.childNodes][startItem.index].key;
      }

      // Otherwise, focus the next row
      return key;
    }
  }

  getKeyAbove(key: Key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) {
      return;
    }

    // If focus was on a column, focus the parent column if any
    if (startItem.type === 'column') {
      let parent = this.collection.getItem(startItem.parentKey);
      if (parent && parent.type === 'column') {
        return parent.key;
      }

      return;
    }

    // If focus is on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }

    // Find the previous enabled item
    key = this.findPreviousKey(item => item.type === 'item' && !item.isDisabled, key);
    if (key != null) {
      // If focus was on a cell, focus the cell with the same index in the previous row.
      if (this.isCell(startItem)) {
        let item = this.collection.getItem(key);
        return [...item.childNodes][startItem.index].key;
      }

      // Otherwise, focus the previous row
      return key;
    }

    // If no item was found, and focus was on a cell, then focus the
    // corresponding column header.
    if (this.isCell(startItem)) {
      return this.collection.columns[startItem.index].key;
    }

    // If focus was on a row, then focus the first column header.
    return this.collection.columns[0].key;
  }

  private findNextColumnKey(column: Node<T>) {
    let row = this.collection.headerRows[column.level];

    // Search following columns
    for (let i = column.index + 1; i < row.length; i++) {
      let item = row[i];
      if (item.type === 'column') {
        return item.key;
      }
    }

    // Wrap around to the first column
    for (let i = 0; i < column.index; i++) {
      let item = row[i];
      if (item.type === 'column') {
        return item.key;
      }
    }
  }

  private findPreviousColumnKey(column: Node<T>) {
    let row = this.collection.headerRows[column.level];

    // Search previous columns
    for (let i = column.index - 1; i >= 0; i--) {
      let item = row[i];
      if (item.type === 'column') {
        return item.key;
      }
    }

    // Wrap around to the last column
    for (let i = row.length - 1; i > column.index; i--) {
      let item = row[i];
      if (item.type === 'column') {
        return item.key;
      }
    }
  }

  getKeyRightOf(key: Key) {
    let item = this.collection.getItem(key);
    if (!item) {
      return;
    }

    // If focus was on a column, then focus the next column
    if (item.type === 'column') {
      return this.direction === 'rtl'
        ? this.findPreviousColumnKey(item)
        : this.findNextColumnKey(item);
    }

    // If focus is on a row, focus the first child cell.
    if (item.type === 'item') {
      let children = [...item.childNodes];
      return this.direction === 'rtl'
        ? children[children.length - 1].key
        : children[0].key;
    }

    // If focus is on a cell, focus the next cell if any,
    // otherwise focus the parent row.
    if (this.isCell(item)) {
      let parent = this.collection.getItem(item.parentKey);
      let children = [...parent.childNodes];
      let next = this.direction === 'rtl'
        ? children[item.index - 1]
        : children[item.index + 1];

      if (next) {
        return next.key;
      }

      return item.parentKey;
    }
  }

  getKeyLeftOf(key: Key) {
    let item = this.collection.getItem(key);
    if (!item) {
      return;
    }

    // If focus was on a column, then focus the previous column
    if (item.type === 'column') {
      return this.direction === 'rtl'
        ? this.findNextColumnKey(item)
        : this.findPreviousColumnKey(item);
    }

    // If focus is on a row, focus the last child cell.
    if (item.type === 'item') {
      let children = [...item.childNodes];
      return this.direction === 'rtl'
        ? children[0].key
        : children[children.length - 1].key;
    }

    // If focus is on a cell, focus the previous cell if any,
    // otherwise focus the parent row.
    if (this.isCell(item)) {
      let parent = this.collection.getItem(item.parentKey);
      let children = [...parent.childNodes];
      let prev = this.direction === 'rtl'
        ? children[item.index + 1]
        : children[item.index - 1];

      if (prev) {
        return prev.key;
      }

      return parent.key;
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
        return [...parent.childNodes][0].key;
      }
    }

    // Find the first enabled row
    key = this.findNextKey(item => item.type === 'item' && !item.isDisabled);

    // If global flag is set, focus the first cell in the first row.
    if (key != null && item && this.isCell(item) && global) {
      let item = this.collection.getItem(key);
      key = [...item.childNodes][0].key;
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
        let children = [...parent.childNodes];
        return children[children.length - 1].key;
      }
    }

    // Find the last enabled row
    key = this.findPreviousKey(item => item.type === 'item' && !item.isDisabled);

    // If global flag is set, focus the last cell in the last row.
    if (key != null && item && this.isCell(item) && global) {
      let item = this.collection.getItem(key);
      let children = [...item.childNodes];
      key = children[children.length - 1].key;
    }

    // Otherwise, focus the row itself.
    return key;
  }

  private getItem(key: Key): HTMLElement {
    return this.ref.current.querySelector(`[data-key="${key}"]`);
  }

  getKeyPageAbove(key: Key) {
    let menu = this.ref.current;
    let item = this.getItem(key);
    if (!item) {
      return null;
    }

    let pageY = Math.max(0, item.offsetTop + item.offsetHeight - menu.offsetHeight);
    
    while (item && item.offsetTop > pageY) {
      key = this.getKeyAbove(key);
      item = this.getItem(key);
    }

    return key;
  }

  getKeyPageBelow(key: Key) {
    let menu = this.ref.current;
    let item = this.getItem(key);
    if (!item) {
      return null;
    }

    let pageY = Math.min(menu.scrollHeight, item.offsetTop - item.offsetHeight + menu.offsetHeight);

    while (item && item.offsetTop < pageY) {
      key = this.getKeyBelow(key);
      item = this.getItem(key);
    }

    return key;
  }

  getKeyForSearch(search: string, fromKey?: Key) {
    if (!this.collator) {
      return null;
    }

    let collection = this.collection;
    let key = fromKey ? this.getKeyBelow(fromKey) : this.getFirstKey(fromKey);
    while (key) {
      let item = collection.getItem(key);
      let substring = item.textValue.slice(0, search.length);
      if (item.textValue && this.collator.compare(substring, search) === 0) {
        return key;
      }

      key = this.getKeyBelow(key);
    }

    return null;
  }
}
