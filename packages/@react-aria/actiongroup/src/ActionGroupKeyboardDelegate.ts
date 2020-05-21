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

import {Collection} from '@react-stately/collections';
import {Direction, KeyboardDelegate, Orientation} from '@react-types/shared';
import {Key} from 'react';

export class ActionGroupKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<T>;
  private flipDirection: boolean;
  private disabledKeys: Set<Key>;

  constructor(collection: Collection<T>, direction: Direction, orientation: Orientation, disabledKeys: Set<Key> = new Set()) {
    this.collection = collection;
    this.flipDirection = direction === 'rtl' && orientation === 'horizontal';
    this.disabledKeys = disabledKeys;
  }

  getKeyLeftOf(key: Key) {
    if (this.flipDirection) {
      key = this.collection.getKeyAfter(key);
      while (key) {
        if (!this.disabledKeys.has(key)) {
          return key;
        }
        key = this.collection.getKeyAfter(key);
      }
      return key || this.getFirstKey();
    } else {
      key = this.collection.getKeyBefore(key);
      while (key) {
        if (!this.disabledKeys.has(key)) {
          return key;
        }
        key = this.collection.getKeyBefore(key);
      }
      return key || this.getLastKey();
    }
  }

  getKeyRightOf(key: Key) {
    if (this.flipDirection) {
      key = this.collection.getKeyBefore(key);
      while (key) {
        if (!this.disabledKeys.has(key)) {
          return key;
        }
        key = this.collection.getKeyBefore(key);
      }
      return key || this.getLastKey();
    } else {
      key = this.collection.getKeyAfter(key);
      while (key) {
        if (!this.disabledKeys.has(key)) {
          return key;
        }
        key = this.collection.getKeyAfter(key);
      }
      return key || this.getFirstKey();
    }
  }

  getKeyAbove(key: Key) {
    key = this.collection.getKeyBefore(key);
    while (key) {
      if (!this.disabledKeys.has(key)) {
        return key;
      }
      key = this.collection.getKeyBefore(key);
    }
    return key || this.getLastKey();
  }

  getKeyBelow(key: Key) {
    key = this.collection.getKeyAfter(key);
    while (key) {
      if (!this.disabledKeys.has(key)) {
        return key;
      }
      key = this.collection.getKeyAfter(key);
    }
    return key || this.getFirstKey();
  }

  getFirstKey() {
    let key = this.collection.getFirstKey();
    while (this.disabledKeys.has(key)) {
      key = this.collection.getKeyAfter(key);
    }
    return key;
  }

  getLastKey() {
    let key = this.collection.getLastKey();
    while (this.disabledKeys.has(key)) {
      key = this.collection.getKeyBefore(key);
    }
    return key;
  }
}
