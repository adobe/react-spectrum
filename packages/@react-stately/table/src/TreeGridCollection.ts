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

import {GridNode} from '@react-types/grid';
import {TableCollection as ITableCollection} from '@react-types/table';
import {Key} from 'react';

// TODO: extend from GridCollectionOptions from TableCollection? For now this is a straight copy
interface TreeGridCollectionOptions {
  showSelectionCheckboxes?: boolean,
  showDragButtons?: boolean,
  // TODO: grab from types
  expandedKeys: 'all' | Set<Key>
}

// TODO move to types and rename to TreeGridCollection?
export interface ITreeGridCollection<T> extends ITableCollection<T> {
  /** The number of user defined columns in the grid (e.g. omits selection and drag handle columns). */
  userColumnCount: number,
  /** The original column nodes provided to the collection. Preserved so it can be passed to other collections. */
  originalColumns: GridNode<T>[]
}

// TODO: Copied from TableCollection, technically not needed since TableCollection has the correct key
const ROW_HEADER_COLUMN_KEY = 'row-header-column-checkbox-' + Math.random().toString(36).slice(2);
const ROW_HEADER_COLUMN_KEY_DRAG = 'row-header-column-drag-' + Math.random().toString(36).slice(2);

// TODO refactor this even further, get rid of this collection since we don't really need that much (no need for key getters)
export class TreeGridCollection<T> implements ITreeGridCollection<T> {
  // TODO: columns doesn't need to be exposed, but needed internally for determining cell index + column association
  columns: GridNode<T>[];
  // TODO: needed as passthrough to TableCollection. Preserves the body node from useCollection's CollectionBuilder call
  body: GridNode<T>;
  // TODO: need originalColumns because the column nodes comes from useCollection's call of CollectionBuilder which we want to pass through to TableCollection intact
  // along with the body with flattened rows. This approach simulates the nodes BaseTableView would provide to TableCollection normally
  originalColumns: GridNode<T>[];
  // TODO: Needed. Should be exposed and accessed by table hooks for aria-posinset and other aria properties. Filled with nodes with values reflecting the treegrid structure of the nodes
  // Doesn't have the columns in it since TableCollection handles that
  keyMap: Map<Key, GridNode<T>> = new Map();
  // TODO: not really needed but is part of TableCollection
  columnCount: number;
  // TODO: needed so we can easily determine the amount of columns excluding the selection and drag handle columns. Used by the useTableRow hook and the TreeGridTableView
  // to determine if a row has child rows, specifically the static row case. The useTableRow hook can't handle this logic since that hook doesn't know about DnD
  userColumnCount: number;
  // TODO: Needed. Specifically used to store a flattened array of row nodes for TableCollection to consume
  rows: GridNode<T>[];

  constructor(nodes: Iterable<GridNode<T>>, opts?: TreeGridCollectionOptions) {
    let {
      expandedKeys = new Set()
    } = opts;
    let body: GridNode<T>;
    let columns: GridNode<T>[] = [];
    this.rows = [];
    this.userColumnCount = 0;
    this.originalColumns = [];

    // Add cell for selection checkboxes if needed.
    if (opts?.showSelectionCheckboxes) {
      let rowHeaderColumn: GridNode<T> = {
        type: 'column',
        key: ROW_HEADER_COLUMN_KEY,
        value: null,
        textValue: '',
        level: 0,
        index: opts?.showDragButtons ? 1 : 0,
        hasChildNodes: false,
        rendered: null,
        childNodes: [],
        props: {
          isSelectionCell: true
        }
      };

      columns.unshift(rowHeaderColumn);
    }

    // Add cell for drag buttons if needed.
    if (opts?.showDragButtons) {
      let rowHeaderColumn: GridNode<T> = {
        type: 'column',
        key: ROW_HEADER_COLUMN_KEY_DRAG,
        value: null,
        textValue: '',
        level: 0,
        index: 0,
        hasChildNodes: false,
        rendered: null,
        childNodes: [],
        props: {
          isDragButtonCell: true
        }
      };

      columns.unshift(rowHeaderColumn);
    }

    // TODO: highlevel, we will loop through each row and its children, pushing the child rows only if the current row is expanded
    // TODO: note change from TableCollection, only grabbing body top level nodes, will dive into the children later
    let topLevelRows = [];
    let visit = (node: GridNode<T>) => {
      switch (node.type) {
        case 'body':
          body = node;
          break;
        case 'column':
          if (!node.hasChildNodes) {
            columns.push(node);
            this.userColumnCount++;
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
        this.originalColumns.push(node);
      }
      visit(node);
    }

    this.columnCount = columns.length;
    this.columns = columns;
    this.body = body;

    // Update each grid node in the treegrid table with values specific to a treegrid structure. Also store a set of flattened row nodes for TableCollection to consume
    let globalRowCount = 0;
    let visitNode = (node: GridNode<T>, i?: number) => {
      // Clone row node and its children so modifications to the node for treegrid specific values aren't applied on the nodes provided
      // to TableCollection. Index, level, and parent keys are all changed to reflect a flattened row structure rather than the treegrid structure
      // values automatically calculated via CollectionBuilder
      if (node.type === 'item') {
        let childNodes = [];
        for (let child of node.childNodes) {
          if (child.type === 'cell') {
            let cellClone = {...child};
            if (cellClone.index + 1 === columns.length) {
              cellClone.nextKey = null;
            }
            childNodes.push({...cellClone});
          }
        }
        let clone = {...node, childNodes: childNodes, parentKey: this.body.key, level: 1, index: globalRowCount++};
        this.rows.push(clone);
      }

      let newProps = {};
      // Associate the parent column node to the cell/column cell.
      if (node.type === 'cell' || node.type === 'column') {
        newProps['column'] = columns[i];
      }

      // Assign indexOfType to cells and rows for aria-posinset
      if (node.type !== 'placeholder' && node.type !== 'column') {
        newProps['indexOfType'] = i;
      }

      // Use Object.assign instead of spread to preserve object reference for keyMap. Also ensures retrieving nodes
      // via .childNodes returns the same object as the one found via keyMap look up
      Object.assign(node, newProps);
      this.keyMap.set(node.key, node);

      let lastNode: GridNode<T>;
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

    this.keyMap = new Map();
    let last: GridNode<T>;
    topLevelRows.forEach((node: GridNode<T>, i) => {
      visitNode(node as GridNode<T>, i);

      if (last) {
        last.nextKey = node.key;
        node.prevKey = last.key;
      } else {
        node.prevKey = null;
      }

      last = node;
    });

    if (last) {
      last.nextKey = null;
    }
  }

  getItem(key: Key) {
    return this.keyMap.get(key);
  }
}
