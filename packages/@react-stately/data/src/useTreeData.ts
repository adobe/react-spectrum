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

import {Key} from '@react-types/shared';
import {useMemo, useState} from 'react';

export interface TreeOptions<T extends object> {
  /** Initial root items in the tree. */
  initialItems?: T[],
  /** The keys for the initially selected items. */
  initialSelectedKeys?: Iterable<Key>,
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key,
  /** A function that returns the children for an item object. */
  getChildren?: (item: T) => T[]
}

interface TreeNode<T extends object> {
  /** A unique key for the tree node. */
  key: Key,
  /** The key of the parent node. */
  parentKey: Key,
  /** The value object for the tree node. */
  value: T,
  /** Children of the tree node. */
  children: TreeNode<T>[]
}

export interface TreeData<T extends object> {
  /** The root nodes in the tree. */
  items: TreeNode<T>[],

  /** The keys of the currently selected items in the tree. */
  selectedKeys: Set<Key>,

  /** Sets the selected keys. */
  setSelectedKeys(keys: Set<Key>): void,

  /**
   * Gets a node from the tree by key.
   * @param key - The key of the item to retrieve.
   */
  getItem(key: Key): TreeNode<T>,

  /**
   * Inserts an item into a parent node as a child.
   * @param parentKey - The key of the parent item to insert into. `null` for the root.
   * @param index - The index within the parent to insert into.
   * @param value - The value to insert.
   */
  insert(parentKey: Key | null, index: number, ...values: T[]): void,

  /**
   * Inserts items into the list before the item at the given key.
   * @param key - The key of the item to insert before.
   * @param values - The values to insert.
   */
  insertBefore(key: Key, ...values: T[]): void,

  /**
   * Inserts items into the list after the item at the given key.
   * @param key - The key of the item to insert after.
   * @param values - The values to insert.
   */
  insertAfter(key: Key, ...values: T[]): void,

  /**
   * Appends an item into a parent node as a child.
   * @param parentKey - The key of the parent item to insert into. `null` for the root.
   * @param value - The value to insert.
   */
  append(parentKey: Key | null, ...values: T[]): void,

  /**
   * Prepends an item into a parent node as a child.
   * @param parentKey - The key of the parent item to insert into. `null` for the root.
   * @param value - The value to insert.
   */
  prepend(parentKey: Key | null, ...value: T[]): void,

  /**
   * Removes an item from the tree by its key.
   * @param key - The key of the item to remove.
   */
  remove(...keys: Key[]): void,

  /**
   * Removes all items from the tree that are currently
   * in the set of selected items.
   */
  removeSelectedItems(): void,

  /**
   * Moves an item within the tree.
   * @param key - The key of the item to move.
   * @param toParentKey - The key of the new parent to insert into. `null` for the root.
   * @param index - The index within the new parent to insert at.
   */
  move(key: Key, toParentKey: Key | null, index: number): void,

  /**
   * Updates an item in the tree.
   * @param key - The key of the item to update.
   * @param newValue - The new value for the item.
   */
  update(key: Key, newValue: T): void
}

/**
 * Manages state for an immutable tree data structure, and provides convenience methods to
 * update the data over time.
 */
export function useTreeData<T extends object>(options: TreeOptions<T>): TreeData<T> {
  let {
    initialItems = [],
    initialSelectedKeys,
    getKey = (item: any) => item.id || item.key,
    getChildren = (item: any) => item.children
  } = options;
  let map = useMemo(() => new Map<Key, TreeNode<T>>(), []);

  // We only want to compute this on initial render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let initialNodes = useMemo(() => buildTree(initialItems), []);
  let [items, setItems] = useState(initialNodes);
  let [selectedKeys, setSelectedKeys] = useState(new Set<Key>(initialSelectedKeys || []));

  function buildTree(initialItems: T[] = [], parentKey?: Key | null) {
    return initialItems.map(item => {
      let node: TreeNode<T> = {
        key: getKey(item),
        parentKey: parentKey,
        value: item,
        children: null
      };

      node.children = buildTree(getChildren(item), node.key);
      map.set(node.key, node);
      return node;
    });
  }

  function updateTree(items: TreeNode<T>[], key: Key, update: (node: TreeNode<T>) => TreeNode<T>) {
    let node = map.get(key);
    if (!node) {
      return items;
    }

    // Create a new node. If null, then delete the node, otherwise replace.
    let newNode = update(node);
    if (newNode == null) {
      deleteNode(node);
    } else {
      addNode(newNode);
    }

    // Walk up the tree and update each parent to refer to the new chilren.
    while (node.parentKey) {
      let nextParent = map.get(node.parentKey);
      let copy: TreeNode<T> = {
        key: nextParent.key,
        parentKey: nextParent.parentKey,
        value: nextParent.value,
        children: null
      };

      let children = nextParent.children;
      if (newNode == null) {
        children = children.filter(c => c !== node);
      }

      copy.children = children.map(child => {
        if (child === node) {
          return newNode;
        }

        return child;
      });

      map.set(copy.key, copy);

      newNode = copy;
      node = nextParent;
    }

    if (newNode == null) {
      items = items.filter(c => c !== node);
    }

    return items.map(item => {
      if (item === node) {
        return newNode;
      }

      return item;
    });
  }

  function addNode(node: TreeNode<T>) {
    map.set(node.key, node);
    for (let child of node.children) {
      addNode(child);
    }
  }

  function deleteNode(node: TreeNode<T>) {
    map.delete(node.key);
    for (let child of node.children) {
      deleteNode(child);
    }
  }

  return {
    items,
    selectedKeys,
    setSelectedKeys,
    getItem(key: Key) {
      return map.get(key);
    },
    insert(parentKey: Key | null, index: number, ...values: T[]) {
      setItems(items => {
        let nodes = buildTree(values, parentKey);

        // If parentKey is null, insert into the root.
        if (parentKey == null) {
          return [
            ...items.slice(0, index),
            ...nodes,
            ...items.slice(index)
          ];
        }

        // Otherwise, update the parent node and its ancestors.
        return updateTree(items, parentKey, parentNode => ({
          key: parentNode.key,
          parentKey: parentNode.parentKey,
          value: parentNode.value,
          children: [
            ...parentNode.children.slice(0, index),
            ...nodes,
            ...parentNode.children.slice(index)
          ]
        }));
      });
    },
    insertBefore(key: Key, ...values: T[]): void {
      let node = map.get(key);
      if (!node) {
        return;
      }

      let parentNode = map.get(node.parentKey);
      let nodes = parentNode ? parentNode.children : items;
      let index = nodes.indexOf(node);
      this.insert(parentNode?.key, index, ...values);
    },
    insertAfter(key: Key, ...values: T[]): void {
      let node = map.get(key);
      if (!node) {
        return;
      }

      let parentNode = map.get(node.parentKey);
      let nodes = parentNode ? parentNode.children : items;
      let index = nodes.indexOf(node);
      this.insert(parentNode?.key, index + 1, ...values);
    },
    prepend(parentKey: Key | null, ...values: T[]) {
      this.insert(parentKey, 0, ...values);
    },
    append(parentKey: Key | null, ...values: T[]) {
      if (parentKey == null) {
        this.insert(null, items.length, ...values);
      } else {
        let parentNode = map.get(parentKey);
        if (!parentNode) {
          return;
        }

        this.insert(parentKey, parentNode.children.length, ...values);
      }
    },
    remove(...keys: Key[]) {
      let newItems = items;
      for (let key of keys) {
        newItems = updateTree(newItems, key, () => null);
      }

      setItems(newItems);

      let selection = new Set(selectedKeys);
      for (let key of selectedKeys) {
        if (!map.has(key)) {
          selection.delete(key);
        }
      }

      setSelectedKeys(selection);
    },
    removeSelectedItems() {
      this.remove(...selectedKeys);
    },
    move(key: Key, toParentKey: Key | null, index: number) {
      setItems(items => {
        let node = map.get(key);
        if (!node) {
          return items;
        }

        items = updateTree(items, key, () => null);

        const movedNode = {
          ...node,
          parentKey: toParentKey
        };

        // If parentKey is null, insert into the root.
        if (toParentKey == null) {
          return [
            ...items.slice(0, index),
            movedNode,
            ...items.slice(index)
          ];
        }

        // Otherwise, update the parent node and its ancestors.
        return updateTree(items, toParentKey, parentNode => ({
          key: parentNode.key,
          parentKey: parentNode.parentKey,
          value: parentNode.value,
          children: [
            ...parentNode.children.slice(0, index),
            movedNode,
            ...parentNode.children.slice(index)
          ]
        }));
      });
    },
    update(oldKey: Key, newValue: T) {
      setItems(items => updateTree(items, oldKey, oldNode => {
        let node: TreeNode<T> = {
          key: oldNode.key,
          parentKey: oldNode.parentKey,
          value: newValue,
          children: null
        };

        node.children = buildTree(getChildren(newValue), node.key);
        return node;
      }));
    }
  };
}
