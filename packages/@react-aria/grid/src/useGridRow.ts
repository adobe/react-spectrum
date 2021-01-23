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

import {GridCollection} from '@react-types/grid';
import {GridState} from '@react-stately/grid';
import {HTMLAttributes, RefObject} from 'react';
import {Node} from '@react-types/shared';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

export interface GridRowProps<T> {
  node: Node<T>,
  ref?: RefObject<HTMLElement>,
  isVirtualized?: boolean,
  isSelected?: boolean,
  isDisabled?: boolean
}

export interface GridRowAria {
  rowProps: HTMLAttributes<HTMLElement>
}

export function useGridRow<T, C extends GridCollection<T>, S extends GridState<T, C>>(props: GridRowProps<T>, state: S): GridRowAria {
  let {
    node,
    ref,
    isVirtualized,
    isSelected,
    isDisabled
  } = props;

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    key: node.key,
    ref,
    isVirtualized
  });

  // TODO: move into useSelectableItem?
  let {pressProps} = usePress({...itemProps, isDisabled});

  let rowProps: HTMLAttributes<HTMLElement> = {
    role: 'row',
    'aria-selected': isSelected,
    ...pressProps
  };

  if (isVirtualized) {
    rowProps['aria-rowindex'] = node.index + 1; // aria-rowindex is 1 based
  }

  return {
    rowProps
  };
}
