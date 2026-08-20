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

import {Collection, Key, Node} from '@react-types/shared';
import {getChildNodes} from 'react-stately/private/collections/getChildNodes';

/**
 * Computes the 1-based position of an item within the whole set of items, ignoring
 * section headers. `item.index` restarts at 0 within each section, but `aria-setsize`
 * is the global item count (see getItemCount), so the position must be global too -
 * otherwise aria-posinset/aria-setsize are inconsistent for sectioned collections.
 * Items that are not inside a section keep their existing O(1) index-based position.
 */
export function getPosInSet<T>(
  collection: Collection<Node<T>>,
  key: Key,
  item: Node<T> | null
): number {
  if (item == null) {
    return NaN;
  }

  // Not inside a section: the flat index is already correct.
  if (item.parentKey == null) {
    return Number(item.index) + 1;
  }

  // Inside a section: add the item count of every preceding section, then the
  // item's position within its own section.
  let position = Number(item.index) + 1;
  for (let node of collection) {
    if (node.key === item.parentKey) {
      break;
    }
    if (node.type === 'section') {
      for (let child of getChildNodes(node, collection)) {
        if (child.type === 'item') {
          position++;
        }
      }
    }
  }

  return position;
}
