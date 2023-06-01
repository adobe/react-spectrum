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
import {GridCollection} from '@react-stately/grid';
import {GridNode} from '@react-types/grid';
import {TableCollection as ITableCollection} from '@react-types/table';
import {Key} from 'react';


// TODO: extend from GridCollectionOptions from TableCollection? For now this is a straight copy
interface TreebleCollectionOptions {
  showSelectionCheckboxes?: boolean,
  showDragButtons?: boolean,
  expandedKeys: Set<Key>
}

// TODO: Copied from TableCollection
const ROW_HEADER_COLUMN_KEY = 'row-header-column-' + Math.random().toString(36).slice(2);
let ROW_HEADER_COLUMN_KEY_DRAG = 'row-header-column-' + Math.random().toString(36).slice(2);
while (ROW_HEADER_COLUMN_KEY === ROW_HEADER_COLUMN_KEY_DRAG) {
  ROW_HEADER_COLUMN_KEY_DRAG = 'row-header-column-' + Math.random().toString(36).slice(2);
}

// TODO: can I extend from TableCollection and just modify the class methods? Don't think so since
// there is expandedKeys logic now in the visit (only add rows whos parent is expanded to the collection), and we need to make the
// Discuss if we should just modify TableCollection/GridCollection to have that expandedkeys logic as well
export class TreebleCollection<T> implements ITableCollection<T> {
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
  body: GridNode<T>;
  _size: number = 0;

  // TODO: bring in changes from Sections PR made on GridCollection
  constructor(nodes: Iterable<GridNode<T>>, opts?: TreebleCollectionOptions) {
    let {
      expandedKeys = {}
    } = opts;
    let rowHeaderColumnKeys: Set<Key> = new Set();
    let body: GridNode<T>;
    let columns: GridNode<T>[] = [];

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
    let rows = [];
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
          console.log('row node', {...node}, [...node.childNodes])
          rows.push(node);
          // TODO: removing this return will mean we can properly extract the child rows and add them to the rows array (static case for now)
          // Will need to update the information contained by each node reflect a flattened structure
          // return; // do not go into childNodes
      }
      for (let child of node.childNodes) {
        visit(child);
      }
    };

    for (let node of nodes) {
      visit(node);
    }

    let headerRows = buildHeaderRows(columnKeyMap, columns) as GridNode<T>[];
    headerRows.forEach((row, i) => rows.splice(i, 0, row));

    console.log('rows before', rows);

    // TODO This GridCollection call returns our keymap and column count + getChildren
    // Collection end result should have nodes as follows:
    // - collection should only have rows that are "available", aka nested rows should only be in the collection if their parent is expanded
    // - the nested row shouldn't have a column value (at least in the rows array, looks like the keymap node)
    // - the index of each row should be scoped by the level. Note that the index value should be set such that the
    // hooks will calculate the same aria-posinset regardless if we are in a table with or without rows.
    // - parentkey of a nested row should be the parent row
    // - prev/nextkey of top row should be what? check base table
    // - prev/nextkey of nested row should be what? should it be like a cell (aka scoped within the row)? or should it point to the next/prev row as if it was a
    // flat table

    // super({
    //   columnCount: columns.length,
    //   items: rows,
    //   visitNode: node => {
    //     node.column = columns[node.index];
    //     return node;
    //   }
    // });
    this.columns = columns;
    this.rowHeaderColumnKeys = rowHeaderColumnKeys;
    this.body = body;
    this.headerRows = headerRows;
    this._size = [...body.childNodes].length;

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
  }


  // TODO: the below funcs will need to change. body.childNodes isn't going to return the nested rows, just top level.
  // Just yield ...this.rows.
  *[Symbol.iterator]() {
    yield* this.body.childNodes;
  }

  get size() {
    return this._size;
  }

  getKeys() {
    return this.keyMap.keys();
  }

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
