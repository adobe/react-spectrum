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
import {useState} from 'react';

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
  parentKey?: Key | null,
  /** The value object for the tree node. */
  value: T,
  /** Children of the tree node. */
  children: TreeNode<T>[] | null
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
  getItem(key: Key): TreeNode<T> | undefined,

  getDescendantKeys(node?: TreeNode<T>): Key[],
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
   * Moves one or more items before a given key.
   * @param key - The key of the item to move the items before.
   * @param keys - The keys of the items to move.
   */
  moveBefore(key: Key, keys: Iterable<Key>): void,

  /**
   * Moves one or more items after a given key.
   * @param key - The key of the item to move the items after.
   * @param keys - The keys of the items to move.
   */
  moveAfter(key: Key, keys: Iterable<Key>): void,

  /**
   * Updates an item in the tree.
   * @param key - The key of the item to update.
   * @param newValue - The new value for the item.
   */
  update(key: Key, newValue: T): void
}

interface TreeDataState<T extends object> {
    items: TreeNode<T>[],
    nodeMap: Map<Key, TreeNode<T>>
}

/**
 * Manages state for an immutable tree data structure, and provides convenience methods to
 * update the data over time.
 */
export function useTreeData<T extends object>(options: TreeOptions<T>): TreeData<T> {
  let {
    initialItems = [],
    initialSelectedKeys,
    getKey = (item: any) => item.id ?? item.key,
    getChildren = (item: any) => item.children
  } = options;

  // We only want to compute this on initial render.
  let [tree, setItems] = useState<TreeDataState<T>>(() => buildTree(initialItems, new Map()));
  let {items, nodeMap} = tree;

  let [selectedKeys, setSelectedKeys] = useState(new Set<Key>(initialSelectedKeys || []));

  function buildTree(initialItems: T[] | null = [], map: Map<Key, TreeNode<T>>, parentKey?: Key | null) {
    if (initialItems == null) {
      initialItems = [];
    }
    return {
      items: initialItems.map(item => {
        let node: TreeNode<T> = {
          key: getKey(item),
          parentKey: parentKey ?? null,
          value: item,
          children: null
        };

        node.children = buildTree(getChildren(item), map, node.key).items;
        map.set(node.key, node);
        return node;
      }),
      nodeMap: map
    };
  }

  function updateTree(items: TreeNode<T>[], key: Key, update: (node: TreeNode<T>) => TreeNode<T> | null, originalMap: Map<Key, TreeNode<T>>) {
    let node = originalMap.get(key);
    if (!node) {
      return {items, nodeMap: originalMap};
    }
    let map = new Map<Key, TreeNode<T>>(originalMap);

    // Create a new node. If null, then delete the node, otherwise replace.
    let newNode = update(node);
    if (newNode == null) {
      deleteNode(node, map);
    } else {
      addNode(newNode, map);
    }

    // Walk up the tree and update each parent to refer to the new children.
    while (node && node.parentKey) {
      let nextParent = map.get(node.parentKey)!;
      let copy: TreeNode<T> = {
        key: nextParent.key,
        parentKey: nextParent.parentKey,
        value: nextParent.value,
        children: null
      };

      let children = nextParent.children;
      if (newNode == null && children) {
        children = children.filter(c => c !== node);
      }

      copy.children = children?.map(child => {
        if (child === node) {
          // newNode cannot be null here due to the above filter.
          return newNode!;
        }

        return child;
      }) ?? null;

      map.set(copy.key, copy);

      newNode = copy;
      node = nextParent;
    }

    if (newNode == null) {
      items = items.filter(c => c !== node);
    }

    return {
      items: items.map(item => {
        if (item === node) {
          // newNode cannot be null here due to the above filter.
          return newNode!;
        }

        return item;
      }),
      nodeMap: map
    };
  }

  function addNode(node: TreeNode<T>, map: Map<Key, TreeNode<T>>) {
    map.set(node.key, node);
    if (node.children) {
      for (let child of node.children) {
        addNode(child, map);
      }
    }
  }

  function deleteNode(node: TreeNode<T>, map: Map<Key, TreeNode<T>>) {
    map.delete(node.key);
    if (node.children) {
      for (let child of node.children) {
        deleteNode(child, map);
      }
    }
  }

  function getDescendantKeys(node: TreeNode<T>): Key[] {
    let descendantKeys: Key[] = [];
    if (!node) {
      return descendantKeys;
    }
    function recurse(currentNode: TreeNode<T>) {
      if (currentNode.children) {
        for (let child of currentNode.children) {
          descendantKeys.push(child.key);
          recurse(child);
        }
      }
    }
  
    recurse(node);
    return descendantKeys;
  }
  
  function _internalMoveRelative(
    state: TreeDataState<T>,
    targetKey: Key,
    keysToMove: Iterable<Key>,
    position: 'before' | 'after'
  ): TreeDataState<T> {
    let {items: currentItems, nodeMap: currentMap} = state;
    let indexOffset = position === 'before' ? 0 : 1;

    let currentTargetNode = currentMap.get(targetKey);
    if (!currentTargetNode) {
      // Target node might have been removed in a concurrent update, return original state.
      return state;
    }

    let keysArray = Array.from(keysToMove);
    if (keysArray.length === 0) {
      return state;
    }

    let currentTargetParentKey = currentTargetNode.parentKey;
    let currentTargetIndex: number;

    if (currentTargetParentKey == null) {
      currentTargetIndex = currentItems.findIndex(item => item.key === targetKey);
    } else {
      let parentNode = currentMap.get(currentTargetParentKey);
      currentTargetIndex = parentNode?.children?.findIndex(child => child.key === targetKey) ?? -1;
    }

    if (currentTargetIndex === -1) {
      // Shouldn't happen if targetNode exists, but safeguard anyway
      console.error(`${targetKey} not found`);
      return state;
    }

    let tempInsertionIndex = currentTargetIndex + indexOffset;

    let nodesToMoveDetails: Array<{ node: TreeNode<T>, originalParentKey: Key | null | undefined }> = [];
    for (let k of keysArray) {
      let node = currentMap.get(k);
      if (node) {
        if (k === targetKey) {
          throw new Error(`Cannot move an item relative to itself (key: ${k}).`);
        }
        if (getDescendantKeys(node).includes(targetKey)) {
          throw new Error(`Cannot move item ${k} relative to ${targetKey} because it is a descendant.`);
        }
        nodesToMoveDetails.push({node, originalParentKey: node.parentKey});
      } else {
        throw new Error(`Key ${k} not found.`);
      }
    }


    // Remove nodes
    let stateAfterRemoval = {items: currentItems, nodeMap: currentMap};
    for (const {node} of nodesToMoveDetails) {
      let movingNode = stateAfterRemoval.nodeMap.get(node.key);
      if (!movingNode) {
        // Might have been removed as part of a parent move
        continue;
      }

      let originalParentKey = movingNode.parentKey;

      if (originalParentKey == null) {
        // Remove from root
        let newItems = stateAfterRemoval.items.filter(i => i.key !== node.key);
        let newMap = new Map(stateAfterRemoval.nodeMap);
        deleteNode(movingNode, newMap);
        stateAfterRemoval = {items: newItems, nodeMap: newMap};
      } else {
        // Remove from parent node, check if parent still exists
        if (stateAfterRemoval.nodeMap.has(originalParentKey)) {
          stateAfterRemoval = updateTree(stateAfterRemoval.items, originalParentKey, p => ({
            ...p,
            children: p.children!.filter(c => c.key !== node.key)
          }), stateAfterRemoval.nodeMap);
        } else {
          // Parent was already removed
          let newMap = new Map(stateAfterRemoval.nodeMap);
          deleteNode(movingNode, newMap);
          stateAfterRemoval = {items: stateAfterRemoval.items, nodeMap: newMap};
        }
      }
    }

    // Insert nodes
    let finalItems = stateAfterRemoval.items;
    let finalMap = stateAfterRemoval.nodeMap;

    // Re-find target node in the state after removals since index might have changed
    currentTargetNode = finalMap.get(targetKey);
    if (!currentTargetNode) {
      // Target node might have been removed in a concurrent update, return original state.
      return stateAfterRemoval;
    }
    currentTargetParentKey = currentTargetNode.parentKey;

    if (currentTargetParentKey == null) {
      currentTargetIndex = finalItems.findIndex(item => item.key === targetKey);
    } else {
      let parentNode = finalMap.get(currentTargetParentKey);
      // Parent could theoretically be gone if targetKey was moved to root during removal
      currentTargetIndex = parentNode?.children?.findIndex(child => child.key === targetKey) ?? -1;
    }

    if (currentTargetIndex === -1) {
      console.error(`Target node ${targetKey} exists but not found in parent's children after removal.`);
      return stateAfterRemoval;
    }


    // Recalculate insertion index
    tempInsertionIndex = currentTargetIndex + indexOffset;

    for (const {node: originalNodeData} of nodesToMoveDetails) {
      let nodeToInsertData = finalMap.get(originalNodeData.key) || originalNodeData;

      let nodeToInsert: TreeNode<T> = {
        ...nodeToInsertData,
        parentKey: currentTargetParentKey
      };

      if (currentTargetParentKey == null) {
        // Insert into root
        let insertAt = Math.max(0, Math.min(tempInsertionIndex, finalItems.length));
        finalItems = [
          ...finalItems.slice(0, insertAt),
          nodeToInsert,
          ...finalItems.slice(insertAt)
        ];
        addNode(nodeToInsert, finalMap);
        tempInsertionIndex++;
      } else {
        // Insert into target parent node
        addNode(nodeToInsert, finalMap);
        let newState = updateTree(finalItems, currentTargetParentKey, p => {
          let children = p.children || [];
          let insertAt = Math.max(0, Math.min(tempInsertionIndex, children.length));
          return {
            ...p,
            children: [
              ...children.slice(0, insertAt),
              nodeToInsert,
              ...children.slice(insertAt)
            ]
          };
        }, finalMap);
        finalItems = newState.items;
        finalMap = newState.nodeMap;
        tempInsertionIndex++;
      }
    }

    return {items: finalItems, nodeMap: finalMap};
  }

  return {
    items,
    selectedKeys,
    setSelectedKeys,
    getDescendantKeys,
    getItem(key: Key) {
      return nodeMap.get(key);
    },
    insert(parentKey: Key | null, index: number, ...values: T[]) {
      setItems(({items, nodeMap: originalMap}) => {
        let {items: newNodes, nodeMap: newMap} = buildTree(values, originalMap, parentKey);

        // If parentKey is null, insert into the root.
        if (parentKey == null) {
          return {
            items: [
              ...items.slice(0, index),
              ...newNodes,
              ...items.slice(index)
            ],
            nodeMap: newMap
          };
        }

        // Otherwise, update the parent node and its ancestors.
        return updateTree(items, parentKey, parentNode => ({
          key: parentNode.key,
          parentKey: parentNode.parentKey,
          value: parentNode.value,
          children: [
            ...parentNode.children!.slice(0, index),
            ...newNodes,
            ...parentNode.children!.slice(index)
          ]
        }), newMap);
      });
    },
    insertBefore(key: Key, ...values: T[]): void {
      let node = nodeMap.get(key);
      if (!node) {
        return;
      }

      let parentNode = nodeMap.get(node.parentKey!);
      let nodes = parentNode ? parentNode.children : items;
      let index = nodes!.indexOf(node);
      this.insert(parentNode?.key ?? null, index, ...values);
    },
    insertAfter(key: Key, ...values: T[]): void {
      let node = nodeMap.get(key);
      if (!node) {
        return;
      }

      let parentNode = nodeMap.get(node.parentKey!);
      let nodes = parentNode ? parentNode.children : items;
      let index = nodes!.indexOf(node);
      this.insert(parentNode?.key ?? null, index + 1, ...values);
    },
    prepend(parentKey: Key | null, ...values: T[]) {
      this.insert(parentKey, 0, ...values);
    },
    append(parentKey: Key | null, ...values: T[]) {
      if (parentKey == null) {
        this.insert(null, items.length, ...values);
      } else {
        let parentNode = nodeMap.get(parentKey);
        if (!parentNode) {
          return;
        }

        this.insert(parentKey, parentNode.children!.length, ...values);
      }
    },
    remove(...keys: Key[]) {
      if (keys.length === 0) {
        return;
      }

      let newItems = items;
      let prevMap = nodeMap;
      let newTree;
      for (let key of keys) {
        newTree = updateTree(newItems, key, () => null, prevMap);
        prevMap = newTree.nodeMap;
        newItems = newTree.items;
      }

      setItems(newTree);

      let selection = new Set(selectedKeys);
      for (let key of selectedKeys) {
        if (!newTree.nodeMap.has(key)) {
          selection.delete(key);
        }
      }

      setSelectedKeys(selection);
    },
    removeSelectedItems() {
      this.remove(...selectedKeys);
    },
    move(key: Key, toParentKey: Key | null, index: number) {
      setItems(({items, nodeMap}) => {
        let movingNode = nodeMap.get(key);
        if (!movingNode) {
          return {items, nodeMap};
        }

        // Check if moving to be a descendant of itself
        if (toParentKey != null) {
          let targetNode = nodeMap.get(toParentKey);
          if (targetNode === movingNode || getDescendantKeys(movingNode).includes(toParentKey)) {
            throw new Error('Cannot move an item to be a child of itself.');
          }
        }

        let stateAfterRemoval = {items, nodeMap};
        let originalParentKey = movingNode.parentKey;

        // Remove node from its original parent
        if (originalParentKey == null) {
          // Remove from root
          let newItems = items.filter(i => i.key !== key);
          let newMap = new Map(nodeMap);
          deleteNode(movingNode, newMap);
          stateAfterRemoval = {items: newItems, nodeMap: newMap};
        } else {
          // Remove from parent node
          stateAfterRemoval = updateTree(items, originalParentKey, p => ({
            ...p,
            children: p.children!.filter(c => c.key !== key)
          }), nodeMap);
        }

        let nodeToInsert: TreeNode<T> = {
          ...movingNode,
          parentKey: toParentKey
        };

        let currentItems = stateAfterRemoval.items;
        let currentMap = stateAfterRemoval.nodeMap;

        // Insert into the new parent
        if (toParentKey == null) {
          // Insert into root
          index = Math.max(0, Math.min(index, currentItems.length));
          let finalItems = [
            ...currentItems.slice(0, index),
            nodeToInsert,
            ...currentItems.slice(index)
          ];
          addNode(nodeToInsert, currentMap);
          return {items: finalItems, nodeMap: currentMap};
        } else {
          // Insert into target parent
          addNode(nodeToInsert, currentMap);
          return updateTree(currentItems, toParentKey, p => {
            let children = p.children || [];
            index = Math.max(0, Math.min(index, children.length));
            return {
              ...p,
              children: [
                ...children.slice(0, index),
                nodeToInsert,
                ...children.slice(index)
              ]
            };
          }, currentMap);
        }
      });
    },
    moveBefore(key: Key, keysToMove: Iterable<Key>) {
      let targetNode = nodeMap.get(key);
      if (!targetNode) {
        console.warn(`moveBefore: Target node with key ${key} not found.`);
        return;
      }
      let keysArray = Array.from(keysToMove);
      if (keysArray.length === 0) {
        return;
      }
      if (keysArray.includes(key)) {
        throw new Error('Cannot move an item before itself.');
      }

      setItems((currentState) => {
        try {
          return _internalMoveRelative(currentState, key, keysArray, 'before');
        } catch (e) {
          console.error('Error during moveBefore:', e);
          return currentState;
        }
      });
    },
    moveAfter(key: Key, keysToMove: Iterable<Key>) {
      let targetNode = nodeMap.get(key);
      if (!targetNode) {
        console.warn(`moveAfter: Target node with key ${key} not found.`);
        return;
      }
      let keysArray = Array.from(keysToMove);
      if (keysArray.length === 0) {
        return;
      }
      if (keysArray.includes(key)) {
        throw new Error('Cannot move an item after itself.');
      }

      setItems((currentState) => {
        try {
          return _internalMoveRelative(currentState, key, keysArray, 'after');
        } catch (e) {
          console.warn('Error during moveAfter:', e);
          return currentState;
        }
      });
    },
    update(oldKey: Key, newValue: T) {
      setItems(({items, nodeMap}) => {
        let nodeToUpdate = nodeMap.get(oldKey);
        if (!nodeToUpdate) {
          return {items, nodeMap};
        }

        let newKey = getKey(newValue);
        if (newKey !== oldKey && nodeMap.has(newKey)) {
          console.error(`Cannot update node with key ${oldKey} to new key ${newKey} because a node with that key already exists.`);
          return {items, nodeMap};
        }

        if (newKey === oldKey) {
          return updateTree(items, oldKey, node => ({
            ...node,
            value: newValue
          }), nodeMap);
        } else {
          // If key changed, treat as remove and insert in the same position.
          let stateAfterRemoval = {items, nodeMap};
          let originalParentKey = nodeToUpdate.parentKey;
          let originalIndex = -1;

          if (originalParentKey == null) {
            originalIndex = items.findIndex(i => i.key === oldKey);
            // Remove from root
            let newItems = items.filter(i => i.key !== oldKey);
            let newMap = new Map(nodeMap);
            deleteNode(nodeToUpdate, newMap);
            stateAfterRemoval = {items: newItems, nodeMap: newMap};
          } else {
            let parentNode = nodeMap.get(originalParentKey);
            originalIndex = parentNode?.children?.findIndex(c => c.key === oldKey) ?? -1;
            // Remove from parent node
            stateAfterRemoval = updateTree(items, originalParentKey, p => ({
              ...p,
              children: p.children!.filter(c => c.key !== oldKey)
            }), nodeMap);
          }

          if (originalIndex === -1) {
            console.error(`Could not find original index for node ${oldKey}`);
            return stateAfterRemoval;
          }


          let newNode: TreeNode<T> = {
            key: newKey,
            parentKey: originalParentKey,
            value: newValue,
            children: nodeToUpdate.children
          };

          let currentItems = stateAfterRemoval.items;
          let currentMap = stateAfterRemoval.nodeMap;

          // Insert new node at original index
          if (originalParentKey == null) {
             // Insert into root
            let insertAt = Math.max(0, Math.min(originalIndex, currentItems.length));
            let finalItems = [
              ...currentItems.slice(0, insertAt),
              newNode,
              ...currentItems.slice(insertAt)
            ];
            addNode(newNode, currentMap);
            return {items: finalItems, nodeMap: currentMap};
          } else {
             // Insert into target parent node
            addNode(newNode, currentMap);
            return updateTree(currentItems, originalParentKey, p => {
              let children = p.children || [];
              let insertAt = Math.max(0, Math.min(originalIndex, children.length));
              return {
                ...p,
                children: [
                  ...children.slice(0, insertAt),
                  newNode,
                  ...children.slice(insertAt)
                ]
              };
            }, currentMap);
          }
        }
      });
    }
  };
}
