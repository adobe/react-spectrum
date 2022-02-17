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

import {focusSafely} from '@react-aria/focus';
import {HTMLAttributes, Key, RefObject, useEffect, useRef} from 'react';
import {isCtrlKeyPressed, isNonContiguousSelectionModifier} from './utils';
import {LongPressEvent, PressEvent} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {MultipleSelectionManager} from '@react-stately/selection';
import {PressProps, useLongPress, usePress} from '@react-aria/interactions';

interface SelectableItemOptions {
  /**
   * An interface for reading and updating multiple selection state.
   */
  selectionManager: MultipleSelectionManager,
  /**
   * A unique key for the item.
   */
  key: Key,
  /**
   * Ref to the item.
   */
  ref: RefObject<HTMLElement>,
  /**
   * By default, selection occurs on pointer down. This can be strange if selecting an
   * item causes the UI to disappear immediately (e.g. menus).
   */
  shouldSelectOnPressUp?: boolean,
  /**
   * Whether selection requires the pointer/mouse down and up events to occur on the same target or triggers selection on
   * the target of the pointer/mouse up event.
   */
  allowsDifferentPressOrigin?: boolean,
  /**
   * Whether the option is contained in a virtual scroller.
   */
  isVirtualized?: boolean,
  /**
   * Function to focus the item.
   */
  focus?: () => void,
  /**
   * Whether the option should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean,
  /** Whether the item is disabled. */
  isDisabled?: boolean,
  /**
   * Handler that is called when a user performs an action on the cell. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void
}

interface SelectableItemAria {
  /**
   * Props to be spread on the item root node.
   */
  itemProps: HTMLAttributes<HTMLElement>,
  /** Whether the item is currently in a pressed state. */
  isPressed: boolean
}

/**
 * Handles interactions with an item in a selectable collection.
 */
export function useSelectableItem(options: SelectableItemOptions): SelectableItemAria {
  let {
    selectionManager: manager,
    key,
    ref,
    shouldSelectOnPressUp,
    isVirtualized,
    shouldUseVirtualFocus,
    focus,
    isDisabled,
    onAction,
    allowsDifferentPressOrigin
  } = options;

  let onSelect = (e: PressEvent | LongPressEvent | PointerEvent) => {
    if (e.pointerType === 'keyboard' && isNonContiguousSelectionModifier(e)) {
      manager.toggleSelection(key);
    } else {
      if (manager.selectionMode === 'none') {
        return;
      }

      if (manager.selectionMode === 'single') {
        if (manager.isSelected(key) && !manager.disallowEmptySelection) {
          manager.toggleSelection(key);
        } else {
          manager.replaceSelection(key);
        }
      } else if (e && e.shiftKey) {
        manager.extendSelection(key);
      } else if (manager.selectionBehavior === 'toggle' || (e && (isCtrlKeyPressed(e) || e.pointerType === 'touch' || e.pointerType === 'virtual'))) {
        // if touch or virtual (VO) then we just want to toggle, otherwise it's impossible to multi select because they don't have modifier keys
        manager.toggleSelection(key);
      } else {
        manager.replaceSelection(key);
      }
    }
  };

  // Focus the associated DOM node when this item becomes the focusedKey
  let isFocused = key === manager.focusedKey;
  useEffect(() => {
    if (isFocused && manager.isFocused && !shouldUseVirtualFocus && document.activeElement !== ref.current) {
      if (focus) {
        focus();
      } else {
        focusSafely(ref.current);
      }
    }
  }, [ref, isFocused, manager.focusedKey, manager.childFocusStrategy, manager.isFocused, shouldUseVirtualFocus]);

  // Set tabIndex to 0 if the element is focused, or -1 otherwise so that only the last focused
  // item is tabbable.  If using virtual focus, don't set a tabIndex at all so that VoiceOver
  // on iOS 14 doesn't try to move real DOM focus to the item anyway.
  let itemProps: SelectableItemAria['itemProps'] = {};
  if (!shouldUseVirtualFocus) {
    itemProps = {
      tabIndex: isFocused ? 0 : -1,
      onFocus(e) {
        if (e.target === ref.current) {
          manager.setFocusedKey(key);
        }
      }
    };
  }

  let modality = useRef(null);
  let hasPrimaryAction = onAction && manager.selectionMode === 'none';
  let hasSecondaryAction = onAction && manager.selectionMode !== 'none' && manager.selectionBehavior === 'replace';
  let allowsSelection = !isDisabled && manager.canSelectItem(key);

  // By default, selection occurs on pointer down. This can be strange if selecting an
  // item causes the UI to disappear immediately (e.g. menus).
  // If shouldSelectOnPressUp is true, we use onPressUp instead of onPressStart.
  // onPress requires a pointer down event on the same element as pointer up. For menus,
  // we want to be able to have the pointer down on the trigger that opens the menu and
  // the pointer up on the menu item rather than requiring a separate press.
  // For keyboard events, selection still occurs on key down.
  let itemPressProps: PressProps = {};
  if (shouldSelectOnPressUp) {
    itemPressProps.onPressStart = (e) => {
      modality.current = e.pointerType;
      if (e.pointerType === 'keyboard') {
        onSelect(e);
      }
    };

    // If allowsDifferentPressOrigin, make selection happen on pressUp (e.g. open menu on press down, selection on menu item happens on press up.)
    // Otherwise, have selection happen onPress (prevents listview row selection when clicking on interactable elements in the row)
    if (!allowsDifferentPressOrigin) {
      itemPressProps.onPress = (e) => {
        if (e.pointerType !== 'keyboard') {
          onSelect(e);
        }

        if (hasPrimaryAction) {
          onAction();
        }
      };
    } else {
      itemPressProps.onPressUp = (e) => {
        if (e.pointerType !== 'keyboard') {
          onSelect(e);
        }
      };

      itemPressProps.onPress = hasPrimaryAction ? () => onAction() : null;
    }
  } else {
    // On touch, it feels strange to select on touch down, so we special case this.
    itemPressProps.onPressStart = (e) => {
      modality.current = e.pointerType;
      if (e.pointerType !== 'touch' && e.pointerType !== 'virtual') {
        onSelect(e);
      }
    };

    itemPressProps.onPress = (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'virtual' || hasPrimaryAction) {
        // Single tap on touch with selectionBehavior = 'replace' performs an action, i.e. navigation.
        // Also perform action on press up when selectionMode = 'none'.
        if (hasPrimaryAction || hasSecondaryAction) {
          onAction();
        } else {
          onSelect(e);
        }
      }
    };
  }

  if (!isVirtualized) {
    itemProps['data-key'] = key;
  }

  itemPressProps.preventFocusOnPress = shouldUseVirtualFocus;
  let {pressProps, isPressed} = usePress(itemPressProps);

  // Double clicking with a mouse with selectionBehavior = 'replace' performs an action.
  let onDoubleClick = hasSecondaryAction ? (e) => {
    if (modality.current === 'mouse') {
      e.stopPropagation();
      e.preventDefault();
      onAction();
    }
  } : undefined;

  // Long pressing an item with touch when selectionBehavior = 'replace' switches the selection behavior
  // to 'toggle'. This changes the single tap behavior from performing an action (i.e. navigating) to
  // selecting, and may toggle the appearance of a UI affordance like checkboxes on each item.
  // TODO: what about when drag and drop is also enabled??
  let {longPressProps} = useLongPress({
    isDisabled: !hasSecondaryAction,
    onLongPress(e) {
      if (e.pointerType === 'touch') {
        onSelect(e);
        manager.setSelectionBehavior('toggle');
      }
    }
  });

  // Pressing the Enter key with selectionBehavior = 'replace' performs an action (i.e. navigation).
  let onKeyUp = hasSecondaryAction ? (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAction();
    }
  } : undefined;

  return {
    itemProps: mergeProps(
      itemProps,
      allowsSelection || hasPrimaryAction ? pressProps : {},
      hasSecondaryAction ? longPressProps : {},
      {onKeyUp, onDoubleClick}
    ),
    isPressed
  };
}
