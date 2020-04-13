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

import {ColumnProps} from '@react-types/table';
import {PartialNode, Node} from '@react-stately/collections';
import React, {ReactElement} from 'react';
import { CollectionBuilderContext } from './useGridState';

function Column<T>(props: ColumnProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Column.getCollectionNode = function* <T>(props: ColumnProps<T>, context: CollectionBuilderContext<T>): Generator<PartialNode<T>, void, Node<T>[]> {
  let {title, children, childColumns} = props;
  let fullNodes = yield {
    type: 'column',
    hasChildNodes: !!childColumns || (title && React.Children.count(children) > 0),
    rendered: title || children,
    *childNodes() {
      if (childColumns) {
        for (let child of childColumns) {
          yield {
            type: 'column',
            value: child
          };
        }
      } else if (title) {
        let childColumns = React.Children.toArray(children) as ReactElement<ColumnProps<T>>[];
        for (let child of childColumns) {
          yield {
            type: 'column',
            element: child
          };
        }
      }
    }
  };

  // register leaf columns on the context so that <Row> can access them
  for (let node of fullNodes) {
    if (!node.hasChildNodes) {
      context.columns.push(node);
    }
  }
};

// We don't want getCollectionNode to show up in the type definition
let _Column = Column as <T>(props: ColumnProps<T>) => JSX.Element;
export {_Column as Column};
