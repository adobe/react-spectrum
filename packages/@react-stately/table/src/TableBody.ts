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

import {PartialNode} from '@react-stately/collections';
import React, {ReactElement} from 'react';
import {TableBodyProps} from '@react-types/table';

function TableBody<T>(props: TableBodyProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
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
          // TODO: is a title a hard requirement for a TableSection? Or can it title-less? Ask Spectrum
          // I could instead look for title in the item to determine if the item is a Section, if it is going to be a hard requirement and update the types for TableSection accordingly
          let element = children(item);
          if (element.type === 'section' || (typeof element.type !== 'string' && element.type.name === 'TableSection')) {
            // This yield is the partialNode in CollectionBuilder and is then compared to the full node generated from the TableSection collection element
            // The type needs to match the type returned by the respective collection element, the renderer is the function provided to TableBody that will
            // yield Section or Item, and value is the value propagated to the full node
            yield {
              type: 'section',
              value: item,
              renderer: children
            };
          } else {
            yield {
              type: 'item',
              value: item,
              renderer: children
            };
          }
        }
      } else {
        let items: PartialNode<T>[] = [];
        React.Children.forEach(children, item => {
          let type;
          if (item.type === 'section' || (typeof item.type !== 'string' && item.type.name === 'TableSection')) {
            type = 'section';
          } else {
            type = 'item';
          }

          items.push({
            type,
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
