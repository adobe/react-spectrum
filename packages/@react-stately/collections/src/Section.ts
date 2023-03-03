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

// TODO: make this generic if it will even still be a thing with the collection builder updates
// We don't want table deps in stately/collection
import {CollectionBuilderContext} from '@react-stately/table';
import {PartialNode} from './types';
import React, {ReactElement} from 'react';
import {SectionProps} from '@react-types/shared';

function Section<T>(props: SectionProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

Section.getCollectionNode = function* getCollectionNode<T>(props: SectionProps<T>, context: CollectionBuilderContext<T>): Generator<PartialNode<T>> {
  let {children, title, items} = props;
  yield {
    type: 'section',
    props: props,
    hasChildNodes: true,
    rendered: title,
    'aria-label': props['aria-label'],
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
        React.Children.forEach(children, child => {
          items.push({
            type: 'item',
            element: child
          });
        });

        yield* items;
      }
    },
    shouldInvalidate(newContext: CollectionBuilderContext<T>) {
      // TODO: maybe I should create a new TableSection since this context is specific to table
      if (newContext) {
        // Invalidate section if the columns changed.
        let shouldInvalidate = newContext.columns.length !== context.columns.length ||
        newContext.columns.some((c, i) => c.key !== context.columns[i].key) ||
        newContext.showSelectionCheckboxes !== context.showSelectionCheckboxes ||
        newContext.selectionMode !== context.selectionMode;

        return shouldInvalidate;
      }
    }
  };
};

// We don't want getCollectionNode to show up in the type definition
let _Section = Section as <T>(props: SectionProps<T>) => JSX.Element;
export {_Section as Section};
