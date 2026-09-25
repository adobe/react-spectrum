/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {BaseCollection, CollectionNode} from 'react-aria/private/collections/BaseCollection';
import {Collection, Node} from '@react-types/shared';

export class SeparatorNode extends CollectionNode<any> {
  static readonly type = 'separator';

  filter(
    collection: BaseCollection<any>,
    newCollection: BaseCollection<any>
  ): CollectionNode<any> | null {
    let prevItem = newCollection.getItem(this.prevKey!);
    if (prevItem && prevItem.type !== 'separator') {
      let clone = this.clone();
      newCollection.addDescendants(clone, collection);
      return clone;
    }

    return null;
  }
}

// given a collection check if the separator should be hidden if the next node is a loader or is end of list/menu
export function isSeparatorHidden(
  node: Node<unknown>,
  collection: Collection<Node<unknown>>
): boolean {
  let nextNode = node.nextKey != null && collection.getItem(node.nextKey);
  return (
    node.prevKey == null ||
    !nextNode ||
    nextNode.type === 'separator' ||
    (nextNode.type === 'loader' && nextNode.nextKey == null)
  );
}
