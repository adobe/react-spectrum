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

import {buildHeaderRows} from './TableCollection';
import {getFirstItem, getLastItem} from '@react-stately/collections';
import {GridNode} from '@react-types/grid';
import {TableCollection as ITableCollection} from '@react-types/table';
import {Key} from 'react';


// TODO: extend from GridCollectionOptions from TableCollection? For now this is a straight copy
interface TreebleCollectionOptions {
  showSelectionCheckboxes?: boolean,
  showDragButtons?: boolean,
  // TODO: grab from types
  expandedKeys: 'all' | Set<Key>
}

// TODO: Copied from TableCollection
const ROW_HEADER_COLUMN_KEY = 'row-header-column-' + Math.random().toString(36).slice(2);
let ROW_HEADER_COLUMN_KEY_DRAG = 'row-header-column-' + Math.random().toString(36).slice(2);
while (ROW_HEADER_COLUMN_KEY === ROW_HEADER_COLUMN_KEY_DRAG) {
  ROW_HEADER_COLUMN_KEY_DRAG = 'row-header-column-' + Math.random().toString(36).slice(2);
}

// TODO: can I extend from TableCollection and just modify the class methods? Don't think so since
// there is expandedKeys logic now in the visit (only add rows whos parent is expanded to the collection), and we need to make the index values
// set at a individual level basis instead.
// Discuss if we should just modify TableCollection/GridCollection to have that expandedkeys logic as well
export class TreebleCollection<T> implements ITableCollection<T> {
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
  body: GridNode<T>;

  // TODO: GridCollection stuff, figure out later if we can extend from GridCollection
  // Don't really need columnCount here at the moment if we don't extend from GridCollection, but keeping it for now for parity
  // since it is in the ITableCollection interface
  keyMap: Map<Key, GridNode<T>> = new Map();
  columnCount: number;
  rows: GridNode<T>[];

  // TODO: bring in changes from Sections PR made on GridCollection?
  constructor(nodes: Iterable<GridNode<T>>, opts?: TreebleCollectionOptions) {
    let {
      expandedKeys = new Set()
    } = opts;
    let rowHeaderColumnKeys: Set<Key> = new Set();
    let body: GridNode<T>;
    let columns: GridNode<T>[] = [];
    this.rows = [];

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
    let columnKeyMap = new Map();
    let visit = (node: GridNode<T>) => {
      switch (node.type) {
        case 'body':
          body = node;
          break;
        case 'column':
          columnKeyMap.set(node.key, node);
          if (!node.hasChildNodes) {
            columns.push(node);

            if (node.props.isRowHeader) {
              rowHeaderColumnKeys.add(node.key);
            }
          }
          break;
        case 'item':
          // console.log('row node', {...node}, [...node.childNodes])
          topLevelRows.push(node);
          return;
      }

      for (let child of node.childNodes) {
        visit(child);
      }
    };
    console.log('nodes top level', [...nodes]);
    for (let node of nodes) {
      visit(node);
    }

    let headerRows = buildHeaderRows(columnKeyMap, columns) as GridNode<T>[];
    headerRows.forEach((row, i) => topLevelRows.splice(i, 0, row));

    console.log('rows before', topLevelRows);

    this.columnCount = columns.length;
    this.columns = columns;
    this.rowHeaderColumnKeys = rowHeaderColumnKeys;
    this.body = body;
    this.headerRows = headerRows;

    // Default row header column to the first one.
    if (this.rowHeaderColumnKeys.size === 0) {
      if (opts?.showSelectionCheckboxes) {
        if (opts?.showDragButtons) {
          this.rowHeaderColumnKeys.add(this.columns[2].key);
        } else {
          this.rowHeaderColumnKeys.add(this.columns[1].key);
        }
      } else {
        this.rowHeaderColumnKeys.add(this.columns[0].key);
      }
    }

    // TODO This GridCollection call returns our keymap and column count + getChildren
    // Collection end result should have nodes as follows:
    // - collection should only have rows that are "available", aka nested rows should only be in the collection if their parent is expanded
    // - the nested row shouldn't have a column value (at least in the rows array, looks like the keymap node)
    // - the index of each row should be scoped by the level. Note that the index value should be set such that the
    // hooks will calculate the same aria-posinset regardless if we are in a table with or without rows. For now try and make index directly equal to desired aria-posinset
    // - parentkey of a nested row should be the parent row
    // - prev/nextkey of top level row should point to other top level rows. Will have to update keyboardelegate/layout so it we properly look
    // at child rows before moving to the next top level row
    // - prev/nextkey of nested row should be scoped to the parent row. this means it
    // TODO: refactor later, the below is basically taken from GridCollection but modified. Also borrows from some
    // work done from Sections table work

    let blah = (node: GridNode<T>, i?: number) => {
      // TODO: got rid of childKeys and the remove deleted nodes logic, not sure when that actually ever triggered
      // TODO: this is the opts.visitNode part, add columns data for cells, maybe add a wrapping if to check that and only do
      node.column = columns[node.index];

      // TODO: double check the node values from this
      if (node.type === 'headerrow' || node.type === 'item' || node.type === 'header') {
        let defaultProps = {
          level: 0,
          key: 'row-' + i,
          type: 'row',
          value: undefined,
          hasChildNodes: true,
          childNodes: [...node.childNodes],
          rendered: undefined,
          textValue: undefined
        };

        let newProps = {
          index: i
        };

        // Use Object.assign instead of spread to preserve object reference for keyMap. Also ensures retrieving nodes
        // via .childNodes returns the same object as well
        Object.assign(node, defaultProps, {...node}, newProps);
      }

      if (node.type === 'item') {
        this.rows.push(node);
      }

      this.keyMap.set(node.key, node);

      let lastNode: GridNode<T>;
      // Index for any non child row element
      let index = 0;
      // Index for nested rows, should be counted separately from adjacent cells. TODO: maybe store these values separately in node.index and into node.posinset maybe?
      let rowIndex = 1;
      for (let child of node.childNodes) {
        // console.log('child', child, expandedKeys);
        // debugger
        // TODO: Right now this means if the parent key is not included in expandedKeys but a childKey is, we will ignore it completely since the parent hasn't been expanded
        // TODO: debug why it isn't showing the proper level of rows when only the top most row is displayed
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
            blah(child, rowIndex++);
          } else {
            blah(child, index++);
          }

          lastNode = child;
        }
      }

      if (lastNode) {
        lastNode.nextKey = null;
      }
    };



    this.keyMap = new Map();
    // This is the last top level node tracker (aka header row or top level rows)
    let last: GridNode<T>;
    topLevelRows.forEach((node: GridNode<T>, i) => {
      // TODO: should the index of the top level rows be affected by the column header? don't think it should but need to test
      let index = node.type === 'column' ? i + 1 : (i - headerRows.length + 1);
      blah(node as GridNode<T>, index);

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


  // TODO: the below funcs will need to change. body.childNodes isn't going to return the nested rows, just top level.
  // Just yield ...this.rows.
  *[Symbol.iterator]() {
    yield* [...this.rows];
  }

  get size() {
    // TODO: change from TableCollection, can't use body.childNodes
    return [...this.rows].length;
  }

  getKeys() {
    return this.keyMap.keys();
  }

  // TODO these key getters will need to change most likely, really anything that
  // TODO fix keyboard interaction
  getKeyBefore(key: Key) {
    let node = this.keyMap.get(key);
    return node ? node.prevKey : null;
  }

  getKeyAfter(key: Key) {
    let node = this.keyMap.get(key);
    return node ? node.nextKey : null;
  }

  getFirstKey() {
    return getFirstItem(this.body.childNodes)?.key;
  }

  getLastKey() {
    return getLastItem(this.body.childNodes)?.key;
  }

  getItem(key: Key) {
    return this.keyMap.get(key);
  }

  at(idx: number) {
    const keys = [...this.getKeys()];
    return this.getItem(keys[idx]);
  }

  getTextValue(key: Key): string {
    let row = this.getItem(key);
    if (!row) {
      return '';
    }

    // If the row has a textValue, use that.
    if (row.textValue) {
      return row.textValue;
    }

    // Otherwise combine the text of each of the row header columns.
    let rowHeaderColumnKeys = this.rowHeaderColumnKeys;
    if (rowHeaderColumnKeys) {
      let text = [];
      for (let cell of row.childNodes) {
        let column = this.columns[cell.index];
        if (rowHeaderColumnKeys.has(column.key) && cell.textValue) {
          text.push(cell.textValue);
        }

        if (text.length === rowHeaderColumnKeys.size) {
          break;
        }
      }

      return text.join(' ');
    }

    return '';
  }
}
