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

import {HTMLAttributes, Key, RefObject, useEffect} from 'react';
import {MultipleSelectionManager} from '@react-stately/selection';
import {PressEvent} from '@react-types/shared';
import {PressProps} from '@react-aria/interactions';

interface SelectableItemOptions {
  selectionManager: MultipleSelectionManager,
  itemKey: Key,
  itemRef: RefObject<HTMLElement>,
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
    isVirtualized
  } = options;

  let onPressStart = (e: PressEvent) => {
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
      itemRef.current.focus({preventScroll: true});
    }
  }, [itemRef, isFocused, manager.focusedKey, manager.isFocused]);

  let itemProps = {
    onPressStart,
    tabIndex: isFocused ? 0 : -1,
    onFocus() {
      manager.setFocusedKey(itemKey);
    }
  };

  if (!isVirtualized) {
    itemProps['data-key'] = itemKey;
  }

  return {
    itemProps
  };
}
