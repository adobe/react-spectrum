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

import {Collection, Direction, DisabledBehavior, Key, KeyboardDelegate, Node, Orientation} from '@react-types/shared';
import {isScrollable} from '@react-aria/utils';
import {RefObject} from 'react';

interface ListKeyboardDelegateOptions<T> {
  collection: Collection<Node<T>>,
  ref: RefObject<HTMLElement>,
  collator?: Intl.Collator,
  layout?: 'stack' | 'grid',
  orientation?: Orientation,
  direction?: Direction,
  disabledKeys?: Set<Key>,
  disabledBehavior?: DisabledBehavior
}

export class ListKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<Node<T>>;
  private disabledKeys: Set<Key>;
  private disabledBehavior: DisabledBehavior;
  private ref: RefObject<HTMLElement>;
  private collator: Intl.Collator | undefined;
  private layout: 'stack' | 'grid';
  private orientation?: Orientation;
  private direction?: Direction;

  constructor(collection: Collection<Node<T>>, disabledKeys: Set<Key>, ref: RefObject<HTMLElement>, collator?: Intl.Collator);
  constructor(options: ListKeyboardDelegateOptions<T>);
  constructor(...args: any[]) {
    if (args.length === 1) {
      let opts = args[0] as ListKeyboardDelegateOptions<T>;
      this.collection = opts.collection;
      this.ref = opts.ref;
      this.collator = opts.collator;
      this.disabledKeys = opts.disabledKeys || new Set();
      this.disabledBehavior = opts.disabledBehavior || 'all';
      this.orientation = opts.orientation;
      this.direction = opts.direction;
      this.layout = opts.layout || 'stack';
    } else {
      this.collection = args[0];
      this.disabledKeys = args[1];
      this.ref = args[2];
      this.collator = args[3];
      this.layout = 'stack';
      this.orientation = 'vertical';
      this.disabledBehavior = 'all';
    }

    // If this is a vertical stack, remove the left/right methods completely
    // so they aren't called by useDroppableCollection.
    if (this.layout === 'stack' && this.orientation === 'vertical') {
      this.getKeyLeftOf = undefined;
      this.getKeyRightOf = undefined;
    }
  }

  private isDisabled(item: Node<unknown>) {
    return this.disabledBehavior === 'all' && (item.props?.isDisabled || this.disabledKeys.has(item.key));
  }

  getNextKey(key: Key) {
    key = this.collection.getKeyAfter(key);
    while (key != null) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !this.isDisabled(item)) {
        return key;
      }

      key = this.collection.getKeyAfter(key);
    }

    return null;
  }

  getPreviousKey(key: Key) {
    key = this.collection.getKeyBefore(key);
    while (key != null) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !this.isDisabled(item)) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }

    return null;
  }

  private findKey(
    key: Key,
    nextKey: (key: Key) => Key,
    shouldSkip: (prevRect: DOMRect, itemRect: DOMRect) => boolean
  ) {
    let item = this.getItem(key);
    if (!item) {
      return null;
    }

    // Find the item above or below in the same column.
    let prevRect = item.getBoundingClientRect();
    do {
      key = nextKey(key);
      item = this.getItem(key);
    } while (item && shouldSkip(prevRect, item.getBoundingClientRect()));

    return key;
  }

  private isSameRow(prevRect: DOMRect, itemRect: DOMRect) {
    return prevRect.top === itemRect.top || prevRect.left !== itemRect.left;
  }

  private isSameColumn(prevRect: DOMRect, itemRect: DOMRect) {
    return prevRect.left === itemRect.left || prevRect.top !== itemRect.top;
  }

  getKeyBelow(key: Key) {
    if (this.layout === 'grid' && this.orientation === 'vertical') {
      return this.findKey(key, (key) => this.getNextKey(key), this.isSameRow);
    } else {
      return this.getNextKey(key);
    }
  }

  getKeyAbove(key: Key) {
    if (this.layout === 'grid' && this.orientation === 'vertical') {
      return this.findKey(key, (key) => this.getPreviousKey(key), this.isSameRow);
    } else {
      return this.getPreviousKey(key);
    }
  }

  private getNextColumn(key: Key, right: boolean) {
    return right ? this.getPreviousKey(key) : this.getNextKey(key);
  }

  getKeyRightOf(key: Key) {
    if (this.layout === 'grid') {
      if (this.orientation === 'vertical') {
        return this.getNextColumn(key, this.direction === 'rtl');
      } else {
        return this.findKey(key, (key) => this.getNextColumn(key, this.direction === 'rtl'), this.isSameColumn);
      }
    } else if (this.orientation === 'horizontal') {
      return this.getNextColumn(key, this.direction === 'rtl');
    }

    return null;
  }

  getKeyLeftOf(key: Key) {
    if (this.layout === 'grid') {
      if (this.orientation === 'vertical') {
        return this.getNextColumn(key, this.direction === 'ltr');
      } else {
        return this.findKey(key, (key) => this.getNextColumn(key, this.direction === 'ltr'), this.isSameColumn);
      }
    } else if (this.orientation === 'horizontal') {
      return this.getNextColumn(key, this.direction === 'ltr');
    }

    return null;
  }

  getFirstKey() {
    let key = this.collection.getFirstKey();
    while (key != null) {
      let item = this.collection.getItem(key);
      if (item?.type === 'item' && !this.isDisabled(item)) {
        return key;
      }

      key = this.collection.getKeyAfter(key);
    }

    return null;
  }

  getLastKey() {
    let key = this.collection.getLastKey();
    while (key != null) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !this.isDisabled(item)) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }

    return null;
  }

  private getItem(key: Key): HTMLElement {
    return key !== null ? this.ref.current.querySelector(`[data-key="${CSS.escape(key.toString())}"]`) : null;
  }

  getKeyPageAbove(key: Key) {
    let menu = this.ref.current;
    let item = this.getItem(key);
    if (!item) {
      return null;
    }

    if (!isScrollable(menu)) {
      return this.getFirstKey();
    }

    let containerRect = menu.getBoundingClientRect();
    let itemRect = item.getBoundingClientRect();
    if (this.orientation === 'horizontal') {
      let containerX = containerRect.x - menu.scrollLeft;
      let pageX = Math.max(0, (itemRect.x - containerX) + itemRect.width - containerRect.width);

      while (item && (itemRect.x - containerX) > pageX) {
        key = this.getKeyAbove(key);
        item = key == null ? null : this.getItem(key);
        itemRect = item?.getBoundingClientRect();
      }
    } else {
      let containerY = containerRect.y - menu.scrollTop;
      let pageY = Math.max(0, (itemRect.y - containerY) + itemRect.height - containerRect.height);

      while (item && (itemRect.y - containerY) > pageY) {
        key = this.getKeyAbove(key);
        item = key == null ? null : this.getItem(key);
        itemRect = item?.getBoundingClientRect();
      }
    }

    return key ?? this.getFirstKey();
  }

  getKeyPageBelow(key: Key) {
    let menu = this.ref.current;
    let item = this.getItem(key);
    if (!item) {
      return null;
    }

    if (!isScrollable(menu)) {
      return this.getLastKey();
    }

    let containerRect = menu.getBoundingClientRect();
    let itemRect = item.getBoundingClientRect();
    if (this.orientation === 'horizontal') {
      let containerX = containerRect.x - menu.scrollLeft;
      let pageX = Math.min(menu.scrollWidth, (itemRect.x - containerX) - itemRect.width + containerRect.width);

      while (item && (itemRect.x - containerX) < pageX) {
        key = this.getKeyBelow(key);
        item = key == null ? null : this.getItem(key);
        itemRect = item?.getBoundingClientRect();
      }
    } else {
      let containerY = containerRect.y - menu.scrollTop;
      let pageY = Math.min(menu.scrollHeight, (itemRect.y - containerY) - itemRect.height + containerRect.height);

      while (item && (itemRect.y - containerY) < pageY) {
        key = this.getKeyBelow(key);
        item = key == null ? null : this.getItem(key);
        itemRect = item?.getBoundingClientRect();
      }
    }

    return key ?? this.getLastKey();
  }

  getKeyForSearch(search: string, fromKey?: Key) {
    if (!this.collator) {
      return null;
    }

    let collection = this.collection;
    let key = fromKey || this.getFirstKey();
    while (key != null) {
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
