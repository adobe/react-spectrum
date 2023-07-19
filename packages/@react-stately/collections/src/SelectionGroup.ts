/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {SelectionGroupProps} from '@react-types/shared';

function SelectionGroup<T extends object>(props: SelectionGroupProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

SelectionGroup.__name = 'SelectionGroup';

SelectionGroup.getCollectionNode = function* getCollectionNode<T>(props: any): Generator<PartialNode<T>> {
  let {children, items} = props;
  yield {
    type: 'selectionGroup',
    props,
    hasChildNodes: true,
    *childNodes() {
      if (typeof children === 'function') {
        if (!items) {
          throw new Error(
            'props.children was a function but props.items is missing'
          );
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
        React.Children.forEach(children, (child) => {
          items.push({
            type: 'item',
            element: child
          });
        });

        yield* items;
      }
    }
  };
};

// We don't want getCollectionNode to show up in the type definition
let _SelectionGroup = SelectionGroup as (props: SelectionGroupProps<object>) => JSX.Element;
export {_SelectionGroup as SelectionGroup};
