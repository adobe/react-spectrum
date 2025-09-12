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

import {CollectionNode} from '@react-aria/collections';
import {DOMAttributes, RefObject, Node as RSNode} from '@react-types/shared';
import {getNumberOfRows} from './useGridListItem';
import type {ListState} from '@react-stately/list';
import {useLabels, useSlotId} from '@react-aria/utils';

export interface AriaGridListSectionProps {
  /** An accessibility label for the section. Required if `heading` is not present. */
  'aria-label'?: string,
  /** An object representing the section. */
  node: RSNode<unknown>,
  /** Whether the list row is contained in a virtual scroller. */
  isVirtualized?: boolean
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useGridListSection<T>(props: AriaGridListSectionProps, state: ListState<T>, ref: RefObject<HTMLElement | null>): GridListSectionAria {
  let {'aria-label': ariaLabel, node, isVirtualized} = props;
  let headingId = useSlotId();
  let labelProps = useLabels({
    'aria-label': ariaLabel,
    'aria-labelledby': headingId
  });
  let rowIndex;

  let sumOfNodes = (node: CollectionNode<unknown>): number => {
    // If prevKey is null, then this is the first node in the collection
    if (node.prevKey === null) {
      return getNumberOfRows(node, state);
    }
  
    // Otherwise, if the node is a section or item outside of a section, recursively call to get the current sum + get the number of row(s)
    let prevNode = state.collection.getItem(node.prevKey!) as CollectionNode<T>;
    if (prevNode) {
      return sumOfNodes(prevNode) + getNumberOfRows(node, state);
    }

    return 0;
  };

  if (isVirtualized) {
    if (node.prevKey) {
      let prevNode = state.collection.getItem(node.prevKey);
      if (prevNode) {
        rowIndex = sumOfNodes(prevNode as CollectionNode<T>) + 1;
      }
    } else {
      rowIndex = 1;
    }
  }

  return {
    rowProps: {
      role: 'row',
      'aria-rowindex': rowIndex
    },
    rowHeaderProps: {
      id: headingId,
      role: 'rowheader',
      'aria-colindex': 1
    },
    rowGroupProps: {
      role: 'rowgroup',
      ...labelProps
    }
  };
}
