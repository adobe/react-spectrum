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

import {CollectionBuilderContext} from './useGridState';
import {PartialNode} from '@react-stately/collections';
import React, {ReactElement} from 'react';
import {RowProps} from '@react-types/table';

function Row<T>(props: RowProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Row.getCollectionNode = function* <T> (props: RowProps<T>, context: CollectionBuilderContext<T>): Generator<PartialNode<T>> {
  let {childItems, children, textValue} = props;

  yield {
    type: 'item',
    props: props,
    textValue,
    'aria-label': props['aria-label'],
    hasChildNodes: true,
    *childNodes() {
      // Process cells first
      let index = 0;

      if (context.showSelectionCheckboxes && context.selectionMode !== 'none') {
        yield {
          type: 'rowheader',
          key: 'header', // this is combined with the row key by CollectionBuilder
          index: index++
        };
      }

      if (typeof children === 'function') {
        for (let column of context.columns) {
          yield {
            type: 'cell',
            element: children(column.key),
            key: column.key, // this is combined with the row key by CollectionBuilder
            index: index++
          };
        }
      } else {
        let cells = React.Children.toArray(children);
        for (let cell of cells) {
          yield {
            type: 'cell',
            element: cell,
            index: index++
          };
        }
      }

      // Then process child rows (e.g. treeble)
      if (childItems) {
        for (let child of childItems) {
          yield {
            type: 'item',
            value: child
          };
        }
      }
    }
  };
};

// We don't want getCollectionNode to show up in the type definition
let _Row = Row as <T>(props: RowProps<T>) => JSX.Element;
export {_Row as Row};
