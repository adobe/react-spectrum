/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CollectionBuilder} from '@react-stately/collections';
import {GridNode} from '@react-types/grid';
import {Key} from '@react-types/shared';
import {ReactElement, useMemo} from 'react';
import {TableCollection} from './TableCollection';
import {tableNestedRows} from '@react-stately/flags';
import {TableState, TableStateProps, useTableState} from './useTableState';
import {useControlledState} from '@react-stately/utils';

export interface TreeGridState<T> extends TableState<T> {
  /** A set of keys for items that are expanded. */
  expandedKeys: 'all' | Set<Key>,
  /** Toggles the expanded state for a row by its key. */
  toggleKey(key: Key): void,
  /** The key map containing nodes representing the collection's tree grid structure. */
  keyMap: Map<Key, GridNode<T>>,
  /** The number of leaf columns provided by the user. */
  userColumnCount: number
}

export interface TreeGridStateProps<T> extends Omit<TableStateProps<T>, 'collection'> {
  /** The currently expanded keys in the collection (controlled). */
  UNSTABLE_expandedKeys?: 'all' | Iterable<Key>,
  /** The initial expanded keys in the collection (uncontrolled). */
  UNSTABLE_defaultExpandedKeys?: 'all' | Iterable<Key>,
  /** Handler that is called when items are expanded or collapsed. */
  UNSTABLE_onExpandedChange?: (keys: Set<Key>) => any
}

/**
 * Provides state management for a tree grid component. Handles building a collection
 * of columns and rows from props. In addition, it tracks and manages expanded rows, row selection, and sort order changes.
 */
export function UNSTABLE_useTreeGridState<T extends object>(props: TreeGridStateProps<T>): TreeGridState<T> {
  let {
    selectionMode = 'none',
    showSelectionCheckboxes,
    showDragButtons,
    UNSTABLE_expandedKeys: propExpandedKeys,
    UNSTABLE_defaultExpandedKeys: propDefaultExpandedKeys,
    UNSTABLE_onExpandedChange,
    children
  } = props;

  if (!tableNestedRows()) {
    throw new Error('Feature flag for table nested rows must be enabled to use useTreeGridState.');
  }

  let [expandedKeys, setExpandedKeys] = useControlledState(
    propExpandedKeys ? convertExpanded(propExpandedKeys) : undefined,
    propDefaultExpandedKeys ? convertExpanded(propDefaultExpandedKeys) : new Set(),
    UNSTABLE_onExpandedChange
  );

  let context = useMemo(() => ({
    showSelectionCheckboxes: showSelectionCheckboxes && selectionMode !== 'none',
    showDragButtons: showDragButtons,
    selectionMode,
    columns: []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [children, showSelectionCheckboxes, selectionMode, showDragButtons]);

  let builder = useMemo(() => new CollectionBuilder<T>(), []);
  let nodes = useMemo(() => builder.build({children: children as ReactElement<any>[]}, context), [builder, children, context]);
  let treeGridCollection = useMemo(() => {
    return generateTreeGridCollection<T>(nodes, {showSelectionCheckboxes, showDragButtons, expandedKeys});
  }, [nodes, showSelectionCheckboxes, showDragButtons, expandedKeys]);

  let onToggle = (key: Key) => {
    setExpandedKeys(toggleKey(expandedKeys, key, treeGridCollection));
  };

  let collection = useMemo(() => {
    return new TableCollection(treeGridCollection.tableNodes, null, context);
  }, [context, treeGridCollection.tableNodes]);

  let tableState = useTableState({...props, collection});
  return {
    ...tableState,
    keyMap: treeGridCollection.keyMap,
    userColumnCount: treeGridCollection.userColumnCount,
    expandedKeys,
    toggleKey: onToggle
  };
}

function toggleKey<T>(currentExpandedKeys: 'all' | Set<Key>, key: Key, collection: TreeGridCollection<T>): Set<Key> {
  let updatedExpandedKeys: Set<Key>;
  if (currentExpandedKeys === 'all') {
    updatedExpandedKeys = new Set(collection.flattenedRows.filter(row => row.props.UNSTABLE_childItems || row.props.children.length > collection.userColumnCount).map(row => row.key));
    updatedExpandedKeys.delete(key);
  } else {
    updatedExpandedKeys = new Set(currentExpandedKeys);
    if (updatedExpandedKeys.has(key)) {
      updatedExpandedKeys.delete(key);
    } else {
      updatedExpandedKeys.add(key);
    }
  }

  return updatedExpandedKeys;
}

function convertExpanded(expanded: 'all' | Iterable<Key>): 'all' | Set<Key> {
  if (!expanded) {
    return new Set<Key>();
  }

  return expanded === 'all'
    ? 'all'
    : new Set(expanded);
}

interface TreeGridCollectionOptions {
  showSelectionCheckboxes?: boolean,
  showDragButtons?: boolean,
  expandedKeys: 'all' | Set<Key>
}

interface TreeGridCollection<T> {
  keyMap: Map<Key, GridNode<T>>,
  tableNodes: GridNode<T>[],
  flattenedRows: GridNode<T>[],
  userColumnCount: number
}
function generateTreeGridCollection<T>(nodes, opts: TreeGridCollectionOptions): TreeGridCollection<T> {
  let {
    expandedKeys = new Set()
  } = opts;

  let body: GridNode<T> | null = null;
  let flattenedRows: GridNode<T>[] = [];
  let columnCount = 0;
  let userColumnCount = 0;
  let originalColumns: GridNode<T>[] = [];
  let keyMap = new Map();

  if (opts?.showSelectionCheckboxes) {
    columnCount++;
  }

  if (opts?.showDragButtons) {
    columnCount++;
  }

  let topLevelRows: GridNode<T>[] = [];
  let visit = (node: GridNode<T>) => {
    switch (node.type) {
      case 'body':
        body = node;
        keyMap.set(body.key, body);
        break;
      case 'column':
        if (!node.hasChildNodes) {
          userColumnCount++;
        }
        break;
      case 'item':
        topLevelRows.push(node);
        return;
    }

    for (let child of node.childNodes) {
      visit(child);
    }
  };

  for (let node of nodes) {
    if (node.type === 'column') {
      originalColumns.push(node);
    }
    visit(node);
  }

  columnCount += userColumnCount;

  // Update each grid node in the treegrid table with values specific to a treegrid structure. Also store a set of flattened row nodes for TableCollection to consume
  let globalRowCount = 0;
  let visitNode = (node: GridNode<T>, i?: number) => {
    // Clone row node and its children so modifications to the node for treegrid specific values aren't applied on the nodes provided
    // to TableCollection. Index, level, and parent keys are all changed to reflect a flattened row structure rather than the treegrid structure
    // values automatically calculated via CollectionBuilder
    if (node.type === 'item') {
      let childNodes: GridNode<T>[] = [];
      for (let child of node.childNodes) {
        if (child.type === 'cell') {
          let cellClone = {...child};
          if (cellClone.index + 1 === columnCount) {
            cellClone.nextKey = null;
          }
          childNodes.push({...cellClone});
        }
      }
      let clone: GridNode<T> = {...node, childNodes: childNodes, parentKey: body!.key, level: 1, index: globalRowCount++};
      flattenedRows.push(clone);
    }

    let newProps = {};

    // Assign indexOfType to cells and rows for aria-posinset
    if (node.type !== 'placeholder' && node.type !== 'column') {
      newProps['indexOfType'] = i;
    }

    // Use Object.assign instead of spread to preserve object reference for keyMap. Also ensures retrieving nodes
    // via .childNodes returns the same object as the one found via keyMap look up
    Object.assign(node, newProps);
    keyMap.set(node.key, node);

    let lastNode: GridNode<T> | null = null;
    let rowIndex = 0;
    for (let child of node.childNodes) {
      if (!(child.type === 'item' && expandedKeys !== 'all' && !expandedKeys.has(node.key))) {
        if (child.parentKey == null) {
          // if child is a cell/expanded row/column and the parent key isn't already established by the collection, match child node to parent row
          child.parentKey = node.key;
        }

        if (lastNode) {
          lastNode.nextKey = child.key;
          child.prevKey = lastNode.key;
        } else {
          child.prevKey = null;
        }

        if (child.type === 'item') {
          visitNode(child, rowIndex++);
        } else {
          // We enforce that the cells come before rows so can just reuse cell index
          visitNode(child, child.index);
        }

        lastNode = child;
      }
    }

    if (lastNode) {
      lastNode.nextKey = null;
    }
  };

  let last: GridNode<T> | null = null;
  for (let [i, node] of topLevelRows.entries()) {
    visitNode(node as GridNode<T>, i);

    if (last) {
      last.nextKey = node.key;
      node.prevKey = last.key;
    } else {
      node.prevKey = null;
    }

    last = node;
  }

  if (last) {
    last.nextKey = null;
  }

  return {
    keyMap,
    userColumnCount,
    flattenedRows,
    tableNodes: [...originalColumns, {...body!, childNodes: flattenedRows}]
  };
}
