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

import {getCellId} from './utils';
import {getFocusableTreeWalker} from '@react-aria/focus';
import {GridState} from '@react-stately/grid';
import {HTMLAttributes, Key, RefObject} from 'react';
import {mergeProps} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

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
  let interactions = mergeProps(itemProps, pressProps);

  // Grid cells can have focusable elements inside them. In this case, focus should
  // be marshalled to that element rather than focusing the cell itself.
  let onFocus = (e) => {
    if (e.target !== ref.current) {
      // useSelectableItem only handles setting the focused key when 
      // the focused element is the gridcell itself. We also want to
      // set the focused key when a child element receives focus.
      state.selectionManager.setFocusedKey(key);
      return;
    }

    // If the cell itself is focused, check if there is a child focusable
    // element, and marshall focus to that.
    let treeWalker = getFocusableTreeWalker(ref.current);
    let focusable = treeWalker.firstChild() as HTMLElement;
    if (focusable) {
      // Wait a frame so that focus finishes propagatating up to the tree
      // before we move focus to the child element.
      requestAnimationFrame(() => {
        focusable.focus();
      });
    }
  };

  let item = state.collection.getItem(key);
  let columnKey = state.collection.columns[item.index].key;
  let gridCellProps: HTMLAttributes<HTMLElement> = mergeProps(interactions, {
    role: 'gridcell',
    id: getCellId(state, item.parentKey, columnKey),
    onFocus
  });

  if (isVirtualized) {
    let item = state.collection.getItem(key);
    gridCellProps['aria-colindex'] = item.index + 1; // aria-colindex is 1-based
  }

  return {
    gridCellProps
  };
}
