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

import {ItemElement, ItemProps, CellElement} from '@react-types/shared';
import {PartialNode} from './types';
import React, {ReactElement} from 'react';
import { CollectionBuilder } from './CollectionBuilder';

function Item<T>(props: ItemProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Item.getCollectionNode = function<T> (props: ItemProps<T>, builder: CollectionBuilder<T>): PartialNode<T> {
  let {childItems, title, children} = props;

  let rendered = props.title || props.children;
  let textValue = props.textValue || (typeof rendered === 'string' ? rendered : '') || props['aria-label'] || '';
  if (!textValue && !builder.columns) {
    console.warn('<Item> with non-plain text contents is unsupported by type to select for accessibility. Please add a `textValue` prop.');
  }

  return {
    type: 'item',
    props: props,
    rendered,
    textValue,
    'aria-label': props['aria-label'],
    hasChildNodes: hasChildItems(props) || !!builder.columns,
    *childNodes() {
      // If the CollectionBuilder has columns, then the item may have cells inside it
      if (builder.columns) {
        let index = 0;
        if (typeof children === 'function') {
          for (let column of builder.columns) {
            yield {
              type: 'cell',
              element: children(column),
              key: column.key,
              index: index++
            };
          }
        } else {
          let cells = React.Children.toArray(children) as CellElement[];
          for (let cell of cells) {
            yield {
              type: 'cell',
              element: cell,
              index: index++
            };
          }  
        }
      }

      if (childItems) {
        for (let child of childItems) {
          yield {
            type: 'item',
            value: child
          };
        }
      } else if (title && !builder.columns) {
        let items = React.Children.toArray(children) as ItemElement<T>[];
        for (let item of items) {
          yield {
            type: 'item',
            element: item
          };
        }
      }
    }
  };
};

function hasChildItems<T>(props: ItemProps<T>) {
  if (props.hasChildItems != null) {
    return props.hasChildItems;
  }

  if (props.childItems) {
    return true;
  }

  if (props.title && React.Children.count(props.children) > 0) {
    return true;
  }

  return false;
}

// We don't want getCollectionNode to show up in the type definition
let _Item = Item as <T>(props: ItemProps<T>) => JSX.Element;
export {_Item as Item};
