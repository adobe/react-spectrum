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

import {getRowLabelledBy} from './utils';
import {GridState} from '@react-stately/grid';
import {HTMLAttributes, Key, RefObject} from 'react';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

interface RowProps {
  ref?: RefObject<HTMLElement>,
  isVirtualized?: boolean,
  isSelected?: boolean,
  key: Key
}

interface RowAria {
  rowProps: HTMLAttributes<HTMLElement>
}

export function useRow<T>(props: RowProps, state: GridState<T>): RowAria {
  let {
    ref,
    isVirtualized,
    isSelected,
    key
  } = props;

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: key,
    itemRef: ref,
    isVirtualized
  });

  // TODO: move into useSelectableItem?
  let {pressProps} = usePress(itemProps);

  let rowProps: HTMLAttributes<HTMLElement> = {
    role: 'row',
    'aria-selected': isSelected,
    'aria-labelledby': getRowLabelledBy(state, key),
    ...itemProps,
    ...pressProps
  };

  if (isVirtualized) {
    rowProps['aria-rowindex'] = state.collection.getItem(key).index;
  }

  return {
    rowProps
  };
}
