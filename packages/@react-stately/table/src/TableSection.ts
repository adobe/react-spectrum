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

import {CollectionBuilderContext} from '@react-stately/table';
import {PartialNode} from '@react-stately/collections';
import React, {ReactElement} from 'react';
import {TableSectionProps} from '@react-types/table';

function TableSection<T>(props: TableSectionProps<T>): ReactElement { // eslint-disable-line @typescript-eslint/no-unused-vars
  return null;
}

TableSection.getCollectionNode = function* getCollectionNode<T>(props: TableSectionProps<T>, context: CollectionBuilderContext<T>): Generator<PartialNode<T>> {
  let {children, title, items} = props;
  yield {
    type: 'section',
    props: props,
    hasChildNodes: true,
    rendered: title,
    textValue: typeof title === 'string' ? title : props['aria-label'],
    'aria-label': props['aria-label'],
    *childNodes() {
      // Automatically include a section header row
      yield {
        type: 'header',
        key: 'section-header',
        hasChildNodes: true,
        *childNodes() {
          yield {
            type: 'cell',
            key: 'section-header-cell',
            rendered: title,
            props: {
              isSectionCell: true
            }
          };
        },
        props: {
          isSectionHeader: true
        }
      };

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
      if (newContext) {
        // Invalidate section if the columns changed. Also required so the rows in the section
        // properly rebuild when we need to show checkboxes
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
let _TableSection = TableSection as <T>(props: TableSectionProps<T>) => JSX.Element;
export {_TableSection as TableSection};
