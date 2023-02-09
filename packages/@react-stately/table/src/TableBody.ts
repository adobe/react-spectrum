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
  console.log('in table body')
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

          // TODO use the render function passed to TableBody to get the actual collection element aka Section/Row?
          // right now I could instead look for title in the item to determine if the item is a Section, but is that
          // going to be a hard requirement (it is an optional prop to Section)? Maybe create a TableSection component that has title as required?
          let element = children(item);
          // if (item.title) {
          if (element.type === 'section' || (typeof element.type !== 'string' && element.type.name === 'Section')) {
            // This yield is the partialNode in CollectionBuilder and is then compared to the full node generated from the Section collection element
            // TODO: what info do I need exactly in this yield?
            // I think I might only need type, value, and renderer? The Section collection element should handle the rest?
            // This type needs to match the type returned by the respective collection element, the renderer is the function provided to TableBody that will
            // yield Section or Item, and value is the
            // i.e this needs to match the Section element type from stately
            yield {
              type: 'section',
              value: item,
              renderer: children
              // // todo: right now item comes from the user defined `items` passed to TableBody, so that means
              // // we only get item = {id: 0, title: 'section1', children: [...]}. Is children going to be a guarenteed field?
              // hasChildNodes: true,
              // rendered: item.title,
              // // TODO is there a way to dive into the actualy Section context?
              // props: item.props,
              // // TODO do I need the below?
              // *childNodes() {
              //   // TODO item.children is assuming that the items provided to the TableBody are structured like
              //   // item = {id: 0, title: 'section1', children: [...]}. maybe use the
              //   for (let row of item.children) {
              //     yield {
              //       type: 'item',
              //       value: row
              //       // TODO: how do I get the rendere
              //     };
              //   }
              // }
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
          // TODO: we don't get access to any information to differentiate between row and section here
          // we can either just drop the defined type here and collection builder won't do its recursive type check and thus won't throw an erro
          // alternatively, do a similar check as above to get the collection element type
          if (item.type === 'section' || (typeof item.type !== 'string' && item.type.name === 'Section')) {
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
