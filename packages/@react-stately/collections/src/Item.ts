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

import {ItemElement, ItemProps} from '@react-types/shared';
import {PartialNode} from './types';
import React, {ReactElement} from 'react';

export function Item<T>(props: ItemProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Item.getCollectionNode = function<T> (props: ItemProps<T>): PartialNode<T> {
  let {childItems, title, children} = props;

  let rendered = props.title || props.children;
  let textValue = props.textValue || (typeof rendered === 'string' ? rendered : '');
  if (!textValue) {
    console.warn('<Item> with non-plain text contents is unsupported by type to select for accessibility. Please add a `textValue` prop.');
  }

  return {
    type: 'item',
    props: props,
    rendered,
    textValue,
    hasChildNodes: hasChildItems(props),
    *childNodes() {
      if (childItems) {
        for (let child of childItems) {
          yield {
            type: 'item',
            value: child
          };
        }
      } else if (title) {
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
