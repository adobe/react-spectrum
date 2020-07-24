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

import {Collection, KeyboardDelegate, Node} from '@react-types/shared';
import {Key} from 'react';

interface TabsKeyboardDelegateOptions<T> {
  collection: Collection<Node<T>>,
  disabledKeys: Set<Key>,
  orientation: 'horizontal' | 'vertical'
}


export class TabsKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<Node<T>>;
  private disabledKeys: Set<Key>;
  private orientation: 'horizontal' | 'vertical'

  constructor(options: TabsKeyboardDelegateOptions<T>) {
    this.collection = options.collection;
    this.disabledKeys = options.disabledKeys;
    this.orientation = options.orientation;
  }

  getKeyLeftOf(key: Key) {
    if (this.orientation === 'horizontal') {
      key = this.collection.getKeyBefore(key);
      while (key) {
        let item = this.collection.getItem(key);
        if (item.type === 'item' && !this.disabledKeys.has(key)) {
          return key;
        }

        key = this.collection.getKeyBefore(key);
      }
    }
    return null;
  }

  getKeyRightOf(key: Key) {
    if (this.orientation === 'horizontal') {
      key = this.collection.getKeyAfter(key);
      while (key) {
        let item = this.collection.getItem(key);
        if (item.type === 'item' && !this.disabledKeys.has(key)) {
          return key;
        }

        key = this.collection.getKeyAfter(key);
      }
    }
    return null;
  }

  getKeyBelow(key: Key) {
    if (this.orientation === 'vertical') {
      key = this.collection.getKeyAfter(key);
      while (key) {
        let item = this.collection.getItem(key);
        if (item.type === 'item' && !this.disabledKeys.has(key)) {
          return key;
        }
    
        key = this.collection.getKeyAfter(key);
      }
    }
    return null;
  }

  getKeyAbove(key: Key) {
    if (this.orientation === 'vertical') {
      key = this.collection.getKeyBefore(key);
      while (key) {
        let item = this.collection.getItem(key);
        if (item.type === 'item' && !this.disabledKeys.has(key)) {
          return key;
        }

        key = this.collection.getKeyBefore(key);
      }
    }
    return null;
  }

  getFirstKey() {
    let key = this.collection.getFirstKey();
    while (key) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(key)) {
        return key;
      }

      key = this.collection.getKeyAfter(key);
    }
  }

  getLastKey() {
    let key = this.collection.getLastKey();
    while (key) {
      let item = this.collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(key)) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }
  }
}
