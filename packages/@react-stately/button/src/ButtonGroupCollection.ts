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
import {Key, ReactElement} from 'react';

export class ButtonGroupCollection<T extends ReactElement> implements Collection<T> {
  public items: T[];
  private keys: Key[];

  constructor(items: T[], flipKeyOrder: boolean) {
    this.items = items;
    this.keys = items.filter(item => !item.props.isDisabled).map(child => child.key);
    
    if (flipKeyOrder) {
      this.keys.reverse();
    }
  }

  getKeys() {
    return this.keys;
  }

  getKeyBefore(key: Key) {
    let index = this.keys.indexOf(key);
    let itemBefore = this.keys[--index];
    return itemBefore || this.getLastKey();
  }

  getKeyAfter(key: Key) {
    let index = this.keys.indexOf(key);
    let itemAfter = this.keys[++index];
    return itemAfter || this.getFirstKey();
  }

  getFirstKey() {
    return this.keys[0];
  }

  getLastKey() {
    return this.keys[this.keys.length - 1];
  }
  
  getItem(key: Key) {
    return this.items.find(child => child.key === key);
  }
}
