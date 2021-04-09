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

import {Collection, Direction, KeyboardDelegate, Orientation} from '@react-types/shared';
import {Key} from 'react';

export class TabsKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<T>;
  private flipDirection: boolean;
  private disabledKeys: Set<Key>;
  private orientation: Orientation;

  constructor(collection: Collection<T>, direction: Direction, orientation: Orientation, disabledKeys: Set<Key> = new Set()) {
    this.collection = collection;
    this.flipDirection = direction === 'rtl' && orientation === 'horizontal';
    this.orientation = orientation;
    this.disabledKeys = disabledKeys;
  }

  getKeyLeftOf(key: Key) {
    if (this.flipDirection) {
      return this.getNextKey(key);
    } else {
      if (this.orientation === 'horizontal') {
        return this.getPreviousKey(key);
      }
      return null;
    }
  }

  getKeyRightOf(key: Key) {
    if (this.flipDirection) {
      return this.getPreviousKey(key);
    } else {
      if (this.orientation === 'horizontal') {
        return this.getNextKey(key);
      }
      return null;
    }
  }

  getKeyAbove(key: Key) {
    if (this.orientation === 'vertical') {
      return this.getPreviousKey(key);
    }
    return null;
  }

  getKeyBelow(key: Key) {
    if (this.orientation === 'vertical') {
      return this.getNextKey(key);
    }
    return null;
  }

  getFirstKey() {
    let key = this.collection.getFirstKey();
    if (this.disabledKeys.has(key)) {
      key = this.getNextKey(key);
    }
    return key;
  }

  getLastKey() {
    let key = this.collection.getLastKey();
    if (this.disabledKeys.has(key)) {
      key = this.getPreviousKey(key);
    }
    return key;
  }

  getNextKey(key) {
    do {
      key = this.collection.getKeyAfter(key);
      if (key == null) {
        key = this.collection.getFirstKey();
      }
    } while (this.disabledKeys.has(key));
    return key;
  }

  getPreviousKey(key) {
    do {
      key = this.collection.getKeyBefore(key);
      if (key == null) {
        key = this.collection.getLastKey();
      }
    } while (this.disabledKeys.has(key));
    return key;
  }
}
