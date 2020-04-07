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

import {focusWithoutScrolling} from '@react-aria/utils';
import {HTMLAttributes, Key, RefObject, useEffect} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';
import {PressEvent} from '@react-types/shared';
import {PressProps} from '@react-aria/interactions';

interface SelectableItemOptions {
  selectionManager: MultipleSelectionManager,
  itemKey: Key,
  itemRef: RefObject<HTMLElement>,
  shouldSelectOnPressUp?: boolean,
  isVirtualized?: boolean
}

interface SelectableItemAria {
  itemProps: HTMLAttributes<HTMLElement> & PressProps
}

export function useSelectableItem(options: SelectableItemOptions): SelectableItemAria {
  let {
    selectionManager: manager,
    itemKey,
    itemRef,
    shouldSelectOnPressUp,
    isVirtualized
  } = options;

  let onSelect = (e: PressEvent | PointerEvent) => {
    if (manager.selectionMode === 'none') {
      return;
    }

    if (manager.selectionMode === 'single') {
      if (manager.selectedKeys.has(itemKey)) {
        manager.toggleSelection(itemKey);
      } else {
        manager.replaceSelection(itemKey);
      }
    } else if (e.shiftKey) {
      manager.extendSelection(itemKey);
    } else if (manager) {
      manager.toggleSelection(itemKey);
    }
  };

  // Focus the associated DOM node when this item becomes the focusedKey
  let isFocused = itemKey === manager.focusedKey;
  useEffect(() => {
    if (isFocused && manager.isFocused && document.activeElement !== itemRef.current) {
      focusWithoutScrolling(itemRef.current);
    }
  }, [itemRef, isFocused, manager.focusedKey, manager.isFocused]);

  let itemProps: SelectableItemAria['itemProps'] = {
    tabIndex: isFocused ? 0 : -1,
    onFocus(e) {
      // Prevent parent items from handling focus event
      e.stopPropagation();
      manager.setFocused(true);
      manager.setFocusedKey(itemKey);
    }
  };

  // By default, selection occurs on pointer down. This can be strange if selecting an 
  // item causes the UI to disappear immediately (e.g. menuts).
  // If shouldSelectOnPressUp is true, we use onPressUp instead of onPressStart.
  // onPress requires a pointer down event on the same element as pointer up. For menus,
  // we want to be able to have the pointer down on the trigger that opens the menu and
  // the pointer up on the menu item rather than requiring a separate press.
  // For keyboard events, selection still occurrs on key down.
  if (shouldSelectOnPressUp) {
    itemProps.onPressStart = (e) => {
      if (e.pointerType === 'keyboard') {
        onSelect(e);
      }
    };
    
    itemProps.onPressUp = (e) => {
      if (e.pointerType !== 'keyboard') {
        onSelect(e);
      }
    };
  } else {
    itemProps.onPressStart = onSelect;
  }

  if (!isVirtualized) {
    itemProps['data-key'] = itemKey;
  }

  return {
    itemProps
  };
}
