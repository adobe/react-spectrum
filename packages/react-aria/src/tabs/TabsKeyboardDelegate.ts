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

import {Collection, Direction, Key, KeyboardDelegate, Node, Orientation} from '@react-types/shared';

export class TabsKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<Node<T>>;
  private flipDirection: boolean;
  private disabledKeys: Set<Key>;
  private tabDirection: boolean;

  constructor(collection: Collection<Node<T>>, direction: Direction, orientation: Orientation, disabledKeys: Set<Key> = new Set()) {
    this.collection = collection;
    this.flipDirection = direction === 'rtl' && orientation === 'horizontal';
    this.disabledKeys = disabledKeys;
    this.tabDirection = orientation === 'horizontal';
  }

  getKeyLeftOf(key: Key): Key | null {
    if (this.flipDirection) {
      return this.getNextKey(key);
    }
    return this.getPreviousKey(key);
  }

  getKeyRightOf(key: Key): Key | null {
    if (this.flipDirection) {
      return this.getPreviousKey(key);
    }
    return this.getNextKey(key);
  }


  private isDisabled(key: Key) {
    return this.disabledKeys.has(key) || !!this.collection.getItem(key)?.props?.isDisabled;
  }

  getFirstKey(): Key | null {
    let key = this.collection.getFirstKey();
    if (key != null && this.isDisabled(key)) {
      key = this.getNextKey(key);
    }
    return key;
  }

  getLastKey(): Key | null {
    let key = this.collection.getLastKey();
    if (key != null && this.isDisabled(key)) {
      key = this.getPreviousKey(key);
    }
    return key;
  }

  getKeyAbove(key: Key): Key | null {
    if (this.tabDirection) {
      return null;
    }
    return this.getPreviousKey(key);
  }

  getKeyBelow(key: Key): Key | null {
    if (this.tabDirection) {
      return null;
    }
    return this.getNextKey(key);
  }

  getNextKey(startKey: Key): Key | null {
    let key: Key | null = startKey;
    do {
      key = this.collection.getKeyAfter(key);
      if (key == null) {
        key = this.collection.getFirstKey();
      }
    } while (key != null && this.isDisabled(key));
    return key;
  }

  getPreviousKey(startKey: Key): Key | null {
    let key: Key | null = startKey;
    do {
      key = this.collection.getKeyBefore(key);
      if (key == null) {
        key = this.collection.getLastKey();
      }
    } while (key != null && this.isDisabled(key));
    return key;
  }
}
