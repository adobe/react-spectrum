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

export function compareNodeOrder<T>(collection: Collection<Node<T>>, a: Node<T>, b: Node<T>) {
  // If the two nodes have the same parent, compare their indices.
  if (a.parentKey === b.parentKey) {
    return a.index - b.index;
  }

  // Otherwise, collect all of the ancestors from each node, and find the first one that doesn't match starting from the root.
  let aAncestors = getAncestors(collection, a);
  let bAncestors = getAncestors(collection, b);
  let firstNonMatchingAncestor = aAncestors.slice(0, bAncestors.length).findIndex((a, i) => a !== bAncestors[i]);

  if (firstNonMatchingAncestor !== -1) {
    // Compare the indices of two children within the common ancestor.
    a = aAncestors[firstNonMatchingAncestor];
    b = bAncestors[firstNonMatchingAncestor];
    return a.index - b.index;
  }

  // 🤷
  return -1;
}

function getAncestors<T>(collection: Collection<Node<T>>, node: Node<T>): Node<T>[] {
  let parents = [];

  while (node?.parentKey != null) {
    node = collection.getItem(node.parentKey);
    parents.unshift(node);
  }

  return parents;
}
