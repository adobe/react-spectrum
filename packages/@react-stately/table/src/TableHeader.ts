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
import React, {JSX, ReactElement} from 'react';
import {TableHeaderProps} from '@react-types/table';

function TableHeader<T>(props: TableHeaderProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

TableHeader.getCollectionNode = function* getCollectionNode<T>(props: TableHeaderProps<T>, context: CollectionBuilderContext<T>): Generator<PartialNode<T>, void, any> {
  let {children, columns} = props;

  // Clear columns so they aren't double added in strict mode.
  context.columns = [];

  if (typeof children === 'function') {
    if (!columns) {
      throw new Error('props.children was a function but props.columns is missing');
    }

    for (let column of columns) {
      yield {
        type: 'column',
        value: column,
        renderer: children
      };
    }
  } else {
    let columns: PartialNode<T>[] = [];
    React.Children.forEach(children, column => {
      columns.push({
        type: 'column',
        element: column
      });
    });

    yield* columns;
  }
};

/**
 * A TableHeader is a container for the Column elements in a Table. Columns can be statically defined
 * as children, or generated dynamically using a function based on the data passed to the `columns` prop.
 */
// We don't want getCollectionNode to show up in the type definition
let _TableHeader = TableHeader as <T>(props: TableHeaderProps<T>) => JSX.Element;
export {_TableHeader as TableHeader};
