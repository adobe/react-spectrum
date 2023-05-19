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

import {Collection, Direction, KeyboardDelegate, Node, Orientation} from '@react-types/shared';
import {isScrollable} from '@react-aria/utils';
import {Key, RefObject} from 'react';

interface ListKeyboardDelegateOptions<T> {
  collection: Collection<Node<T>>,
  ref: RefObject<HTMLElement>,
  orientation?: Orientation,
  direction?: Direction,
  disabledKeys?: Set<Key>
}

export class ListKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<Node<T>>;
  private disabledKeys: Set<Key>;
  private ref: RefObject<HTMLElement>;
  private collator: Intl.Collator;
  private orientation?: Orientation;
  private direction?: Direction;

  constructor(collection: Collection<Node<T>>, disabledKeys: Set<Key>, ref: RefObject<HTMLElement>, collator?: Intl.Collator);
  constructor(options: ListKeyboardDelegateOptions<T>);
  constructor(...args: any[]) {
    if (args.length === 1) {
      let opts = args[0] as ListKeyboardDelegateOptions<T>;
      this.collection = opts.collection;
      this.ref = opts.ref;
      this.disabledKeys = opts.disabledKeys || new Set();
      this.orientation = opts.orientation;
      this.direction = opts.direction;
    } else {
      this.collection = args[0];
      this.disabledKeys = args[1];
      this.ref = args[2];
      this.collator = args[3];
    }
  }

  getKeyBelow(key: Key) {
    key = this.collection.getKeyAfter(key);
    while (key != null) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(key)) {
        return key;
      }

      key = this.collection.getKeyAfter(key);
    }

    return null;
  }

  getKeyAbove(key: Key) {
    key = this.collection.getKeyBefore(key);
    while (key != null) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(key)) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }

    return null;
  }

  getKeyRightOf(key: Key) {
    if (this.orientation === 'horizontal') {
      return this.direction === 'rtl' ? this.getKeyAbove(key) : this.getKeyBelow(key);
    }

    return null;
  }

  getKeyLeftOf(key: Key) {
    if (this.orientation === 'horizontal') {
      return this.direction === 'rtl' ? this.getKeyBelow(key) : this.getKeyAbove(key);
    }

    return null;
  }

  getFirstKey() {
    let key = this.collection.getFirstKey();
    while (key != null) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(key)) {
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
      if (item.type === 'item' && !this.disabledKeys.has(key)) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }

    return null;
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
