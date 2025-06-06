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

import {Collection, Node} from '@react-types/shared';
import {getChildNodes} from './getChildNodes';

const cache = new WeakMap<Iterable<unknown>, number>();

export function getItemCount<T>(collection: Collection<Node<T>>, isValidItem: ((node: Node<T>) => boolean) = (node) => node.type === 'item' || node.type === 'loader'): number {
  let count = cache.get(collection);
  if (count != null) {
    return count;
  }

  // TS isn't smart enough to know we've ensured count is a number, so use a new variable
  let counter = 0;
  let countItems = (items: Iterable<Node<T>>) => {
    for (let item of items) {
      if (isValidItem(item)) {
        counter++;
      }

      // TODO: New collections vs old collection is different here. New collections for table will only return
      // the header and body when the collection is iterated on, but old collections will return the body rows...
      // I could forgo using getItemCount, but the collection.rows is different between old and new collection too... (old includes header row)
      if (item.type === 'section' || item.type === 'tablebody') {
        countItems(getChildNodes(item, collection));
      }
    }
  };

  countItems(collection);
  cache.set(collection, counter);
  return counter;
}
