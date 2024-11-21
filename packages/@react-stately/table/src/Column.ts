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
import {ColumnProps} from '@react-types/table';
import {GridNode} from '@react-types/grid';
import {PartialNode} from '@react-stately/collections';
import React, {JSX, ReactElement} from 'react';

function Column<T>(props: ColumnProps<T>): ReactElement | null { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Column.getCollectionNode = function* getCollectionNode<T>(props: ColumnProps<T>, context: CollectionBuilderContext<T>): Generator<PartialNode<T>, void, GridNode<T>[]> {
  let {title, children, childColumns} = props;

  let rendered = title || children;
  let textValue = props.textValue || (typeof rendered === 'string' ? rendered : '') || props['aria-label'];

  let fullNodes = yield {
    type: 'column',
    hasChildNodes: !!childColumns || (!!title && React.Children.count(children) > 0),
    rendered,
    textValue,
    props,
    *childNodes() {
      if (childColumns) {
        for (let child of childColumns) {
          yield {
            type: 'column',
            value: child
          };
        }
      } else if (title) {
        let childColumns: PartialNode<T>[] = [];
        React.Children.forEach(children, child => {
          childColumns.push({
            type: 'column',
            element: child as ReactElement<ColumnProps<T>>
          });
        });

        yield* childColumns;
      }
    },
    shouldInvalidate(newContext: CollectionBuilderContext<T>) {
      // This is a bit of a hack, but it works.
      // If this method is called, then there's a cached version of this node available.
      // But, we need to keep the list of columns in the new context up to date.
      updateContext(newContext);
      return false;
    }
  };

  let updateContext = (context: CollectionBuilderContext<T>) => {
    // register leaf columns on the context so that <Row> can access them
    for (let node of fullNodes) {
      if (!node.hasChildNodes) {
        context.columns.push(node);
      }
    }
  };

  updateContext(context);
};

/**
 * A Column represents a field of each item within a Table. Columns may also contain nested
 * Column elements to represent column groups. Nested columns can be statically defined as
 * children, or dynamically generated using a function based on the `childColumns` prop.
 */
// We don't want getCollectionNode to show up in the type definition
let _Column = Column as <T>(props: ColumnProps<T>) => JSX.Element;
export {_Column as Column};
