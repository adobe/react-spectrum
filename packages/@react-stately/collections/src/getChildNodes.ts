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

import type {Collection, Node} from '@react-types/shared';

export function getChildNodes<T>(node: Node<T>, collection: Collection<Node<T>>): Iterable<Node<T>> {
  // New API: call collection.getChildren with the node key.
  if (typeof collection.getChildren === 'function') {
    return collection.getChildren(node.key);
  }

  // Old API: access childNodes directly.
  return node.childNodes;
}

export function getFirstItem<T>(iterable: Iterable<T>): T | undefined {
  return getNthItem(iterable, 0);
}

export function getNthItem<T>(iterable: Iterable<T>, index: number): T | undefined {
  if (index < 0) {
    return undefined;
  }

  let i = 0;
  for (let item of iterable) {
    if (i === index) {
      return item;
    }

    i++;
  }
}

export function getLastItem<T>(iterable: Iterable<T>): T | undefined {
  let lastItem = undefined;
  for (let value of iterable) {
    lastItem = value;
  }

  return lastItem;
}
