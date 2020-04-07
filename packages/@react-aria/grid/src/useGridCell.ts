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
import { usePress } from '@react-aria/interactions';

interface GridCellProps {
  ref: RefObject<HTMLElement>,
  key: Key,
  isVirtualized?: boolean
}

interface GridCellAria {
  gridCellProps: HTMLAttributes<HTMLElement>
}

export function useGridCell<T>(props: GridCellProps, state: GridState<T>): GridCellAria {
  let {
    ref,
    key,
    isVirtualized
  } = props;

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: key,
    itemRef: ref,
    isVirtualized
  });

  // TODO: move into useSelectableItem?
  let {pressProps} = usePress(itemProps);

  let gridCellProps: HTMLAttributes<HTMLElement> = {
    role: 'gridcell',
    ...itemProps,
    ...pressProps
  };

  if (isVirtualized) {
    let item = state.collection.getItem(key);
    gridCellProps['aria-colindex'] = item.index;
  }

  return {
    gridCellProps
  };
}
