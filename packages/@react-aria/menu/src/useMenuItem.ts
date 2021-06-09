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

import {getItemCount} from '@react-stately/collections';
import {HTMLAttributes, Key, RefObject} from 'react';
import {isFocusVisible, useHover, usePress} from '@react-aria/interactions';
import {mergeProps, useSlotId} from '@react-aria/utils';
import {PressEvent} from '@react-types/shared';
import {TreeState} from '@react-stately/tree';
import {useSelectableItem} from '@react-aria/selection';

interface MenuItemAria {
  /** Props for the menu item element. */
  menuItemProps: HTMLAttributes<HTMLElement>,

  /** Props for the main text element inside the menu item. */
  labelProps: HTMLAttributes<HTMLElement>,

  /** Props for the description text element inside the menu item, if any. */
  descriptionProps: HTMLAttributes<HTMLElement>,

  /** Props for the keyboard shortcut text element inside the item, if any. */
  keyboardShortcutProps: HTMLAttributes<HTMLElement>
}

interface AriaMenuItemProps {
  /** Whether the menu item is disabled. */
  isDisabled?: boolean,

  /** Whether the menu item is selected. */
  isSelected?: boolean,

  /** A screen reader only label for the menu item. */
  'aria-label'?: string,

  /** The unique key for the menu item. */
  key?: Key,

  /** Handler that is called when the menu should close after selecting an item. */
  onClose?: () => void,

  /**
   * Whether the menu should close when the menu item is selected.
   * @default true
   */
  closeOnSelect?: boolean,

  /** Whether the menu item is contained in a virtual scrolling menu. */
  isVirtualized?: boolean,

  /** Handler that is called when the user activates the item. */
  onAction?: (key: Key) => void
}

/**
 * Provides the behavior and accessibility implementation for an item in a menu.
 * See `useMenu` for more details about menus.
 * @param props - Props for the item.
 * @param state - State for the menu, as returned by `useTreeState`.
 */
export function useMenuItem<T>(props: AriaMenuItemProps, state: TreeState<T>, ref: RefObject<HTMLElement>): MenuItemAria {
  let {
    isSelected,
    isDisabled,
    key,
    onClose,
    closeOnSelect,
    isVirtualized,
    onAction
  } = props;

  let role = 'menuitem';
  if (state.selectionManager.selectionMode === 'single') {
    role = 'menuitemradio';
  } else if (state.selectionManager.selectionMode === 'multiple') {
    role = 'menuitemcheckbox';
  }

  let labelId = useSlotId();
  let descriptionId = useSlotId();
  let keyboardId = useSlotId();

  let ariaProps = {
    'aria-disabled': isDisabled,
    role,
    'aria-label': props['aria-label'],
    'aria-labelledby': labelId,
    'aria-describedby': [descriptionId, keyboardId].filter(Boolean).join(' ') || undefined
  };

  if (state.selectionManager.selectionMode !== 'none') {
    ariaProps['aria-checked'] = isSelected;
  }

  if (isVirtualized) {
    ariaProps['aria-posinset'] = state.collection.getItem(key).index;
    ariaProps['aria-setsize'] = getItemCount(state.collection);
  }

  let onKeyDown = (e: KeyboardEvent) => {
    // Ignore repeating events, which may have started on the menu trigger before moving
    // focus to the menu item. We want to wait for a second complete key press sequence.
    if (e.repeat) {
      return;
    }

    switch (e.key) {
      case ' ':
        if (!isDisabled && state.selectionManager.selectionMode === 'none' && closeOnSelect !== false && onClose) {
          onClose();
        }
        break;
      case 'Enter':
        // The Enter key should always close on select, except if overridden.
        if (!isDisabled && closeOnSelect !== false && onClose) {
          onClose();
        }
        break;
    }
  };

  let onPressStart = (e: PressEvent) => {
    if (e.pointerType === 'keyboard' && onAction) {
      onAction(key);
    }
  };

  let onPressUp = (e: PressEvent) => {
    if (e.pointerType !== 'keyboard') {
      if (onAction) {
        onAction(key);
      }

      // Pressing a menu item should close by default in single selection mode but not multiple
      // selection mode, except if overridden by the closeOnSelect prop.
      if (onClose && (closeOnSelect ?? state.selectionManager.selectionMode !== 'multiple')) {
        onClose();
      }
    }
  };

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    key,
    ref,
    shouldSelectOnPressUp: true
  });

  let {pressProps} = usePress(mergeProps({onPressStart, onPressUp, onKeyDown, isDisabled}, itemProps));
  let {hoverProps} = useHover({
    isDisabled,
    onHoverStart() {
      if (!isFocusVisible()) {
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(key);
      }
    }
  });

  return {
    menuItemProps: {
      ...ariaProps,
      ...mergeProps(pressProps, hoverProps)
    },
    labelProps: {
      id: labelId
    },
    descriptionProps: {
      id: descriptionId
    },
    keyboardShortcutProps: {
      id: keyboardId
    }
  };
}
