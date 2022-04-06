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

import {GridCollection} from '@react-types/grid';
import {GridKeyboardDelegate} from '@react-aria/grid';
import {Key} from 'react';

export class TagKeyboardDelegate<T> extends GridKeyboardDelegate<T, GridCollection<T>> {
  getKeyRightOf(key: Key) {
    return this.direction === 'rtl' ? this.getKeyAbove(key) : this.getKeyBelow(key);
  }

  getKeyLeftOf(key: Key) {
    return this.direction === 'rtl' ? this.getKeyBelow(key) : this.getKeyAbove(key);
  }

  getKeyBelow(key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) {
      return;
    }

    // If focus was on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }

    // Find the next item
    key = this.findNextKey(key);
    if (key != null) {
      // If focus was on a cell, focus the cell with the same index in the next row.
      if (this.isCell(startItem)) {
        let item = this.collection.getItem(key);
        let newKey = [...item.childNodes][startItem.index].key;

        // Ignore disabled tags
        if (this.disabledKeys.has(newKey)) {
          return this.getKeyBelow(newKey);
        }
        return newKey;
      }

      // Otherwise, focus the next row
      if (this.focusMode === 'row') {
        return key;
      }
    }
  }

  getKeyAbove(key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) {
      return;
    }

    // If focus is on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }

    // Find the previous item
    key = this.findPreviousKey(key);
    if (key != null) {
      // If focus was on a cell, focus the cell with the same index in the previous row.
      if (this.isCell(startItem)) {
        let item = this.collection.getItem(key);
        let newKey = [...item.childNodes][startItem.index].key;

        // ignore disabled tags
        if (this.disabledKeys.has(newKey)) {
          return this.getKeyAbove(newKey);
        }
        return newKey;
      }

      // Otherwise, focus the previous row
      if (this.focusMode === 'row') {
        return key;
      }
    }
  }
}
