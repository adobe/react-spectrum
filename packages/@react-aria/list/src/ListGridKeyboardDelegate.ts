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

// TODO: Open to feedback about name, ListKeyboardDelegate already exists
export class ListGridKeyboardDelegate<T> extends GridKeyboardDelegate<T, GridCollection<T>> {
  constructor(options: Omit<GridKeyboardDelegateOptions<T, GridCollection<T>>, 'focusMode'>) {
    super({...options, focusMode: 'row'});
  }

  // TODO: think about whether or not focus should be moved to the row or to the children in the cell
  // Feels kinda weird to move it to the first child in the cell when focus used to be on the last child in the
  // cell above...
  getKeyBelow(key: Key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) {
      return;
    }

    // If focus was on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }

    return this.findNextKey(key);
  }

  getKeyAbove(key: Key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) {
      return;
    }

    // If focus was on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey;
    }

    return this.findPreviousKey(key);
  }


  // TODO: double check if getLastKey needs to be overridden here as well
}
