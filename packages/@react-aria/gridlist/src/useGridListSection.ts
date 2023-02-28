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

import {DOMAttributes, Node as RSNode} from '@react-types/shared';
import type {ListState} from '@react-stately/list';
import {useId} from '@react-aria/utils';

export interface AriaGridListSectionOptions {
  /** An object representing the list section. Contains all the relevant information that makes up the list section. */
  node: RSNode<unknown>,
  /** Whether the list section is contained in a virtual scroller. */
  isVirtualized?: boolean
}

export interface GridListSectionAria {
  /** Props for the list section's row group element. */
  rowGroupProps: DOMAttributes,
  /** Props for the list section's grid row element. */
  rowProps: DOMAttributes,
  /** Props for the list section's grid cell element. */
  cellProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a section in a grid list.
 * @param props - Props for the section.
 * @param state - State of the parent list, as returned by `useListState`.
 */
export function useGridListSection<T>(props: AriaGridListSectionOptions, state: ListState<T>): GridListSectionAria {
  let {node, isVirtualized} = props;
  let headerId = useId();
  let rowIndex;

  if (isVirtualized) {
    let prevItem = state.collection.getItem(node.prevKey);
    rowIndex = prevItem ? prevItem.index + node.index + 2 : 1;
  }

  // TODO: for some reason VO announces section 2 for section 1's first row when using control + option + arrow keys to navigate...
  return {
    rowGroupProps: {
      role: 'rowgroup',
      'aria-labelledby': headerId
    },
    rowProps: {
      role: 'row',
      'aria-rowindex': rowIndex
    },
    cellProps: {
      id: headerId,
      role: 'rowheader',
      'aria-label': node.textValue || undefined
    }
  };
}
