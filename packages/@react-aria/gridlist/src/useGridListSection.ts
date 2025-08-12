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

import {DOMAttributes, Node as RSNode} from '@react-types/shared';
import type {ListState} from '@react-stately/list';
import {useLabels, useSlotId} from '@react-aria/utils';

export interface AriaGridListSectionProps {
  /** An accessibility label for the section. Required if `heading` is not present. */
  'aria-label'?: string,
  /** Whether the list row is contained in a virtual scroller. */
  isVirtualized?: boolean,
  /** An object representing the list item. Contains all the relevant information that makes up the list row. */
  node: RSNode<unknown>
}

export interface GridListSectionAria {
  /** Props for the wrapper list item. */
  rowProps: DOMAttributes,

  /** Props for the heading element, if any. */
  rowHeaderProps: DOMAttributes,

  /** Props for the grid's row group element. */
  rowGroupProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a section in a grid list.
 * See `useGridList` for more details about grid list.
 * @param props - Props for the section.
 */
export function useGridListSection<T>(props: AriaGridListSectionProps, state: ListState<T>): GridListSectionAria {
  let {'aria-label': ariaLabel, isVirtualized, node} = props;
  let headingId = useSlotId();
  let labelProps = useLabels({
    'aria-label': ariaLabel,
    'aria-labelledby': headingId
  });
  let rowIndex: number | undefined =  undefined;

  if (isVirtualized) {
    let {collection} = state;
    let filteredCollection = [...collection.getKeys()].filter((key) => collection.getItem(key)?.type !== 'header');
    let prevItem = node.prevKey ? state.collection.getItem(node.prevKey) : undefined;
    rowIndex = prevItem ? filteredCollection.findIndex((key) => key === prevItem.key) + 2 : node.index + 1;
  }
  
  return {
    rowProps: {
      role: 'row',
      'aria-rowindex': rowIndex
    },
    rowHeaderProps: {
      id: headingId,
      role: 'rowheader'
    },
    rowGroupProps: {
      role: 'rowgroup',
      ...labelProps
    }
  };
}
