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

  constructor(collection: Collection<T>, direction: Direction, orientation: Orientation) {
    this.collection = collection;
    this.flipDirection = direction === 'rtl' && orientation === 'horizontal';
  }

  getKeyLeftOf(key: Key) {
    return this.flipDirection 
      ? this.collection.getKeyAfter(key) || this.getFirstKey() 
      : this.collection.getKeyBefore(key) || this.getLastKey();
  }

  getKeyRightOf(key: Key) {
    return this.flipDirection 
      ? this.collection.getKeyBefore(key) || this.getLastKey() 
      : this.collection.getKeyAfter(key) || this.getFirstKey();
  }

  getKeyAbove(key: Key) {
    return this.collection.getKeyBefore(key) || this.getLastKey();
  }

  getKeyBelow(key: Key) {
    return this.collection.getKeyAfter(key) || this.getFirstKey();
  }

  getFirstKey() {
    return this.collection.getFirstKey();
  }

  getLastKey() {
    return this.collection.getLastKey();
  }
}
