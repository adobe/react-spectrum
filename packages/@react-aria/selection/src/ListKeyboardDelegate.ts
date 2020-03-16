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
import {Key, RefObject} from 'react';
import {KeyboardDelegate} from '@react-types/shared';

export class ListKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<Node<T>>;
  private ref: RefObject<HTMLElement>;
  private collator: Intl.Collator;

  constructor(collection: Collection<Node<T>>, ref: RefObject<HTMLElement>, collator?: Intl.Collator) {
    this.collection = collection;
    this.ref = ref;
    this.collator = collator;
  }

  getKeyBelow(key: Key) {
    key = this.collection.getKeyAfter(key);
    while (key) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !item.isDisabled) {
        return key;
      }

      key = this.collection.getKeyAfter(key);
    }
  }

  getKeyAbove(key: Key) {
    key = this.collection.getKeyBefore(key);
    while (key) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !item.isDisabled) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }
  }

  getFirstKey() {
    let key = this.collection.getFirstKey();
    while (key) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !item.isDisabled) {
        return key;
      }

      key = this.collection.getKeyAfter(key);
    }
  }

  getLastKey() {
    let key = this.collection.getLastKey();
    while (key) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !item.isDisabled) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }
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
    let key = fromKey ? this.getKeyBelow(fromKey) : this.getFirstKey();
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
