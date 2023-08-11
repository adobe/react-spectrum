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

import {ItemElement, ItemProps, SectionElement} from '@react-types/shared';
import {PartialNode} from './types';
import React, {ReactElement} from 'react';
import {Section} from './Section';

function Item<T>(props: ItemProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

// TODO: make a Menu specific Item/Section? This is because the submenu api pattern allows Item to take other Items/Sections as children
// but Item/Section is currently generic and used in a bunch of other components that won't support Item nesting. Will need to make Menu only Item props
Item.getCollectionNode = function* getCollectionNode<T>(props: ItemProps<T>, context: any): Generator<PartialNode<T>> {
  let {childItems, title, children} = props;

  let rendered = props.title || props.children;
  let textValue = props.textValue || (typeof rendered === 'string' ? rendered : '') || props['aria-label'] || '';

  // suppressTextValueWarning is used in components like Tabs, which don't have type to select support.
  if (!textValue && !context?.suppressTextValueWarning) {
    console.warn('<Item> with non-plain text contents is unsupported by type to select for accessibility. Please add a `textValue` prop.');
  }

  yield {
    type: 'item',
    props: props,
    rendered,
    textValue,
    'aria-label': props['aria-label'],
    hasChildNodes: hasChildItems(props),
    *childNodes() {
      if (childItems) {
        for (let child of childItems) {
          // console.log('child dynamic', child)
          // TODO: how to distiguish a item from a section? Perhaps add another prop called childSection (similar to childItem)?
          // For now I am relying on a value provided in the item's object from the user data
          // Also can we assume that a menu will always have either sections or not? Or will we support a menu having sections and sectionless items?
          if (child.isSection) {
            yield {
              type: 'section',
              value: child
            };
          } else {
            yield {
              type: 'item',
              value: child
            };
          }
        }
      } else if (title) {
        let items: PartialNode<T>[] = [];
        React.Children.forEach(children, child => {
          // TODO: see todo at top for children prop type update. Needs to support ItemElements and SectionElements
          if (child.type === Section) {
            items.push({
              type: 'section',
              element: child as SectionElement<T>
            });
          } else {
            items.push({
              type: 'item',
              element: child as ItemElement<T>
            });
          }
        });

        yield* items;
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
