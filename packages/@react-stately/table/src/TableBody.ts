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

import {AsyncLoadable, LoadingState} from '@react-types/shared';
import {PartialNode} from '@react-stately/collections';
import React, {JSX, ReactElement} from 'react';
import {RowElement} from './Row';

export interface TableBodyProps<T> extends Omit<AsyncLoadable, 'isLoading'> {
  /** The contents of the table body. Supports static items or a function for dynamic rendering. */
  children: RowElement<T> | RowElement<T>[] | ((item: T) => RowElement<T>),
  /** A list of row objects in the table body used when dynamically rendering rows. */
  items?: Iterable<T>,
  /** The current loading state of the table. */
  loadingState?: LoadingState
}

function TableBody<T>(props: TableBodyProps<T>): ReactElement | null { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

TableBody.getCollectionNode = function* getCollectionNode<T>(props: TableBodyProps<T>): Generator<PartialNode<T>> {
  let {children, items} = props;
  yield {
    type: 'body',
    hasChildNodes: true,
    props,
    *childNodes() {
      if (typeof children === 'function') {
        if (!items) {
          throw new Error('props.children was a function but props.items is missing');
        }

        for (let item of items) {
          yield {
            type: 'item',
            value: item,
            renderer: children
          };
        }
      } else {
        let items: PartialNode<T>[] = [];
        React.Children.forEach(children, item => {
          items.push({
            type: 'item',
            element: item
          });
        });

        yield* items;
      }
    }
  };
};

/**
 * A TableBody is a container for the Row elements of a Table. Rows can be statically defined
 * as children, or generated dynamically using a function based on the data passed to the `items` prop.
 */
// We don't want getCollectionNode to show up in the type definition
let _TableBody = TableBody as <T>(props: TableBodyProps<T>) => JSX.Element;
export {_TableBody as TableBody};
