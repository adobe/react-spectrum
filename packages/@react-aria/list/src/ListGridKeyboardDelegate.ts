/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {GridKeyboardDelegate, GridKeyboardDelegateOptions} from '@react-aria/grid';
import {Key} from 'react';
import {Rect} from '@react-stately/virtualizer';

// TODO: Open to feedback about name, ListKeyboardDelegate already exists
export class ListGridKeyboardDelegate<T> extends GridKeyboardDelegate<T, GridCollection<T>> {
  constructor(options: Omit<GridKeyboardDelegateOptions<T, GridCollection<T>>, 'focusMode'>) {
    super({...options, focusMode: 'cell'});
  }

  private getRowKey(key: Key) {
    let startItem = key != null ? this.collection.getItem(key) : null;
    if (!startItem) {
      return;
    }

    // If focus was on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }

    return key;
  }

  // Return the same key since the ListView is a single column grid and focusMode is 'cell', thus we will never
  // leave the cell via left/right arrows. useGridCell will handle moving focus to any focusable children that exist as well as RTL behavior
  getKeyLeftOf(key: Key) {
    return key;
  }

  getKeyRightOf(key: Key) {
    return key;
  }

  getFirstKey() {
    return this.collection.getFirstKey();
  }

  getLastKey() {
    return this.collection.getLastKey();
  }

  protected getItemRect(key: Key): Rect {
    // Get row key since the list layout will only have the row keys, not cell keys
    key = this.getRowKey(key);
    if (key == null) {
      return;
    }

    if (this.layout) {
      return this.layout.getLayoutInfo(key)?.rect;
    }

    let item = this.getItem(key);
    if (item) {
      return new Rect(item.offsetLeft, item.offsetTop, item.offsetWidth, item.offsetHeight);
    }
  }
}
