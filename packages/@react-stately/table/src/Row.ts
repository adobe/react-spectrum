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

import {CollectionBuilderContext} from './useTableState';
import {PartialNode} from '@react-stately/collections';
import React, {ReactElement} from 'react';
import {RowProps} from '@react-types/table';

function Row(props: RowProps): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Row.getCollectionNode = function* getCollectionNode<T>(props: RowProps, context: CollectionBuilderContext<T>): Generator<PartialNode<T>> {
  let {children, textValue, childRows} = props;

  yield {
    type: 'item',
    props: props,
    textValue,
    'aria-label': props['aria-label'],
    hasChildNodes: true,
    *childNodes() {
      // Process cells first
      if (context.showDragButtons) {
        yield {
          type: 'cell',
          key: 'header-drag', // this is combined with the row key by CollectionBuilder
          props: {
            isDragButtonCell: true
          }
        };
      }

      if (context.showSelectionCheckboxes && context.selectionMode !== 'none') {
        yield {
          type: 'cell',
          key: 'header', // this is combined with the row key by CollectionBuilder
          props: {
            isSelectionCell: true
          }
        };
      }

      if (typeof children === 'function') {
        // TODO: will have yield rows and not just cells. Use childRows props? Should Rows and Cells be differentiated or should it be childItems as a catch all instead?
        for (let column of context.columns) {
          yield {
            type: 'cell',
            element: children(column.key),
            key: column.key // this is combined with the row key by CollectionBuilder
          };
        }

        if (childRows) {
          for (let child of childRows) {
            // Note: in order to reuse he render function of TableBody, we just need to yield a type and a value here. CollectionBuilder will then look up
            // the parent renderer and use that to build the full node of this child row, using the value provided here to generate the cells
            yield {
              type: 'item',

              value: child
              // hasChildNodes: true,
              // TODO: maybe don't need value here
              // *childNodes() {

              // },
              // renderer: children,
              // TODO: would need to include more props? How would the user define a aria-label or a key for the nested row?
              // This problem exists for dynamic nested columns too I believe
              // props: {childRows: child.childRows}
            };
          }
        }
      } else {
        // TODO: this method preserves the order in which the cell and nested row elements are set by the user
        // Note that this approach currently has a rendering bug for the static case if a nested row is placed inbetween cells
        let nodes: PartialNode<T>[] = [];
        React.Children.forEach(children, node => {
          if (node.type === Row) {
            nodes.push({
              type: 'item',
              element: node
            });
          } else {
            nodes.push({
              type: 'cell',
              element: node
            });
          }
        });

        let numCells = nodes.filter(node => node.type !== 'item').length;
        if (numCells !== context.columns.length) {
          throw new Error(`Cell count must match column count. Found ${numCells} cells and ${context.columns.length} columns.`);
        }

        yield* nodes;

        // let cells: PartialNode<T>[] = [];
        // let childRows: PartialNode<T>[] = [];
        // React.Children.forEach(children, node => {
        //   if (node.type === Row) {
        //     // childRows.push({
        //     //   type: 'item',
        //     //   element: node
        //     // });
        //   } else {
        //     // cells.push({
        //     //   type: 'cell',
        //     //   element: node
        //     // });
        //   }
        // });

        // if (cells.length !== context.columns.length) {
        //   throw new Error(`Cell count must match column count. Found ${cells.length} cells and ${context.columns.length} columns.`);
        // }

        // // TODO: this makes childRows always appear at the end after all the cells
        // yield* cells;
        // yield* childRows;
      }
    },
    shouldInvalidate(newContext: CollectionBuilderContext<T>) {
      // Invalidate all rows if the columns changed.
      return newContext.columns.length !== context.columns.length ||
        newContext.columns.some((c, i) => c.key !== context.columns[i].key) ||
        newContext.showSelectionCheckboxes !== context.showSelectionCheckboxes ||
        newContext.showDragButtons !== context.showDragButtons ||
        newContext.selectionMode !== context.selectionMode;
    }
  };
};

/**
 * A Row represents a single item in a Table and contains Cell elements for each column.
 * Cells can be statically defined as children, or generated dynamically using a function
 * based on the columns defined in the TableHeader.
 */
// We don't want getCollectionNode to show up in the type definition
let _Row = Row as (props: RowProps) => JSX.Element;
export {_Row as Row};
