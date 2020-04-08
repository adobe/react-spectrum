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
import {PartialNode} from '@react-stately/collections';
import React, {ReactElement} from 'react';

function Column<T>(props: ColumnProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Column.getCollectionNode = function* <T>(props: ColumnProps<T>): Generator<PartialNode<T>> {
  let {title, children, childColumns} = props;
  yield {
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
};

// We don't want getCollectionNode to show up in the type definition
let _Column = Column as <T>(props: ColumnProps<T>) => JSX.Element;
export {_Column as Column};
