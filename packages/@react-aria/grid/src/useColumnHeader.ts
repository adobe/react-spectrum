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

import {GridState} from '@react-stately/grid';
import {KeyboardDelegate} from '@react-types/shared';
import {RefObject, HTMLAttributes, Key} from 'react';
import { useSelectableItem } from '@react-aria/selection';
import { getColumnHeaderId } from './utils';

interface ColumnHeaderProps {
  key: Key,
  ref: RefObject<HTMLElement>,
  isVirtualized?: boolean,
  colspan?: number
}

interface ColumnHeaderAria {
  columnHeaderProps: HTMLAttributes<HTMLElement>
}

export function useColumnHeader<T>(props: ColumnHeaderProps, state: GridState<T>): ColumnHeaderAria {
  let {key, ref, isVirtualized, colspan} = props;
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: key,
    itemRef: ref,
    isVirtualized
  });

  let columnHeaderProps: HTMLAttributes<HTMLElement> = {
    role: 'columnheader',
    id: getColumnHeaderId(state, key),
    'aria-colspan': colspan && colspan > 1 ? colspan : null,
    ...itemProps
    // 'aria-sort'
  };

  if (isVirtualized) {
    let item = state.collection.getItem(key);
    columnHeaderProps['aria-colindex'] = item.index + 1;
  }

  return {
    columnHeaderProps
  };
}
