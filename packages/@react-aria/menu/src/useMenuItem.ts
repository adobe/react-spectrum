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

import {DOMAttributes, DOMProps, FocusableElement, FocusEvents, HoverEvents, Key, KeyboardEvents, PressEvent, PressEvents, RefObject} from '@react-types/shared';
import {filterDOMProps, handleLinkClick, mergeProps, useLinkProps, useRouter, useSlotId} from '@react-aria/utils';
import {getItemCount} from '@react-stately/collections';
import {isFocusVisible, useFocus, useHover, useKeyboard, usePress} from '@react-aria/interactions';
import {menuData} from './utils';
import {MouseEvent, useRef} from 'react';
import {SelectionManager} from '@react-stately/selection';
import {TreeState} from '@react-stately/tree';
import {useSelectableItem} from '@react-aria/selection';

export interface MenuItemAria {
  /** Props for the menu item element. */
  menuItemProps: DOMAttributes,

  /** Props for the main text element inside the menu item. */
  labelProps: DOMAttributes,

  /** Props for the description text element inside the menu item, if any. */
  descriptionProps: DOMAttributes,

  /** Props for the keyboard shortcut text element inside the item, if any. */
  keyboardShortcutProps: DOMAttributes,

  /** Whether the item is currently focused. */
  isFocused: boolean,
  /** Whether the item is keyboard focused. */
  isFocusVisible: boolean,
  /** Whether the item is currently selected. */
  isSelected: boolean,
  /** Whether the item is currently in a pressed state. */
  isPressed: boolean,
  /** Whether the item is disabled. */
  isDisabled: boolean
}

export interface AriaMenuItemProps extends DOMProps, PressEvents, HoverEvents, KeyboardEvents, FocusEvents  {
  /**
   * Whether the menu item is disabled.
   * @deprecated - pass disabledKeys to useTreeState instead.
   */
  isDisabled?: boolean,

  /**
   * Whether the menu item is selected.
   * @deprecated - pass selectedKeys to useTreeState instead.
   */
  isSelected?: boolean,

  /** A screen reader only label for the menu item. */
  'aria-label'?: string,

  /** The unique key for the menu item. */
  key: Key,

  /**
   * Handler that is called when the menu should close after selecting an item.
   * @deprecated - pass to the menu instead.
   */
  onClose?: () => void,

  /**
   * Whether the menu should close when the menu item is selected.
   * @default true
   */
  closeOnSelect?: boolean,

  /** Whether the menu item is contained in a virtual scrolling menu. */
  isVirtualized?: boolean,

  /**
   * Handler that is called when the user activates the item.
   * @deprecated - pass to the menu instead.
   */
  onAction?: (key: Key) => void,

  /** What kind of popup the item opens. */
  'aria-haspopup'?: 'menu' | 'dialog',

  /** Indicates whether the menu item's popup element is expanded or collapsed. */
  'aria-expanded'?: boolean | 'true' | 'false',

  /** Identifies the menu item's popup element whose contents or presence is controlled by the menu item. */
  'aria-controls'?: string,

  /** Override of the selection manager. By default, `state.selectionManager` is used. */
  selectionManager?: SelectionManager
}

/**
 * Provides the behavior and accessibility implementation for an item in a menu.
 * See `useMenu` for more details about menus.
 * @param props - Props for the item.
 * @param state - State for the menu, as returned by `useTreeState`.
 */
export function useMenuItem<T>(props: AriaMenuItemProps, state: TreeState<T>, ref: RefObject<FocusableElement | null>): MenuItemAria {
  let {
    id,
    key,
    closeOnSelect,
    isVirtualized,
    'aria-haspopup': hasPopup,
    onPressStart: pressStartProp,
    onPressUp: pressUpProp,
    onPress,
    onPressChange: pressChangeProp,
    onPressEnd,
    onClick: onClickProp,
    onHoverStart: hoverStartProp,
    onHoverChange,
    onHoverEnd,
    onKeyDown,
    onKeyUp,
    onFocus,
    onFocusChange,
    onBlur,
    selectionManager = state.selectionManager
  } = props;

  let isTrigger = !!hasPopup;
  let isTriggerExpanded = isTrigger && props['aria-expanded'] === 'true';
  let isDisabled = props.isDisabled ?? selectionManager.isDisabled(key);
  let isSelected = props.isSelected ?? selectionManager.isSelected(key);
  let data = menuData.get(state)!;
  let item = state.collection.getItem(key);
  let onClose = props.onClose || data.onClose;
  let router = useRouter();
  let performAction = () => {
    if (isTrigger) {
      return;
    }

    if (item?.props?.onAction) {
      item.props.onAction();
    } else if (props.onAction) {
      props.onAction(key);
    }

    if (data.onAction) {
      // Must reassign to variable otherwise `this` binding gets messed up. Something to do with WeakMap.
      let onAction = data.onAction;
      onAction(key);
    }
  };

  let role = 'menuitem';
  if (!isTrigger) {
    if (selectionManager.selectionMode === 'single') {
      role = 'menuitemradio';
    } else if (selectionManager.selectionMode === 'multiple') {
      role = 'menuitemcheckbox';
    }
  }

  let labelId = useSlotId();
  let descriptionId = useSlotId();
  let keyboardId = useSlotId();

  let ariaProps = {
    id,
    'aria-disabled': isDisabled || undefined,
    role,
    'aria-label': props['aria-label'],
    'aria-labelledby': labelId,
    'aria-describedby': [descriptionId, keyboardId].filter(Boolean).join(' ') || undefined,
    'aria-controls': props['aria-controls'],
    'aria-haspopup': hasPopup,
    'aria-expanded': props['aria-expanded']
  };

  if (selectionManager.selectionMode !== 'none' && !isTrigger) {
    ariaProps['aria-checked'] = isSelected;
  }

  if (isVirtualized) {
    ariaProps['aria-posinset'] = item?.index;
    ariaProps['aria-setsize'] = getItemCount(state.collection);
  }

  let onPressStart = (e: PressEvent) => {
    // Trigger native click event on keydown unless this is a link (the browser will trigger onClick then).
    if (e.pointerType === 'keyboard' && !selectionManager.isLink(key)) {
      (e.target as HTMLElement).click();
    }

    pressStartProp?.(e);
  };
  let isPressedRef = useRef(false);
  let onPressChange = (isPressed: boolean) => {
    pressChangeProp?.(isPressed);
    isPressedRef.current = isPressed;
  };

  let onPressUp = (e: PressEvent) => {
    // If interacting with mouse, allow the user to mouse down on the trigger button,
    // drag, and release over an item (matching native behavior).
    if (e.pointerType === 'mouse') {
      if (!isPressedRef.current) {
        (e.target as HTMLElement).click();
      }
    }

    // Pressing a menu item should close by default in single selection mode but not multiple
    // selection mode, except if overridden by the closeOnSelect prop.
    if (e.pointerType !== 'keyboard' && !isTrigger && onClose && (closeOnSelect ?? (selectionManager.selectionMode !== 'multiple' || selectionManager.isLink(key)))) {
      onClose();
    }

    pressUpProp?.(e);
  };

  let onClick = (e: MouseEvent<FocusableElement>) => {
    onClickProp?.(e);
    performAction();
    handleLinkClick(e, router, item!.props.href, item?.props.routerOptions);
  };

  let {itemProps, isFocused} = useSelectableItem({
    id,
    selectionManager: selectionManager,
    key,
    ref,
    shouldSelectOnPressUp: true,
    allowsDifferentPressOrigin: true,
    // Disable all handling of links in useSelectable item
    // because we handle it ourselves. The behavior of menus
    // is slightly different from other collections because
    // actions are performed on key down rather than key up.
    linkBehavior: 'none',
    shouldUseVirtualFocus: data.shouldUseVirtualFocus
  });

  let {pressProps, isPressed} = usePress({
    onPressStart,
    onPress,
    onPressUp,
    onPressChange,
    onPressEnd,
    isDisabled
  });
  let {hoverProps} = useHover({
    isDisabled,
    onHoverStart(e) {
      // Hovering over an already expanded sub dialog trigger should keep focus in the dialog.
      if (!isFocusVisible() && !(isTriggerExpanded && hasPopup)) {
        selectionManager.setFocused(true);
        selectionManager.setFocusedKey(key);
      }
      hoverStartProp?.(e);
    },
    onHoverChange,
    onHoverEnd
  });

  let {keyboardProps} = useKeyboard({
    onKeyDown: (e) => {
      // Ignore repeating events, which may have started on the menu trigger before moving
      // focus to the menu item. We want to wait for a second complete key press sequence.
      if (e.repeat) {
        e.continuePropagation();
        return;
      }

      switch (e.key) {
        case ' ':
          if (!isDisabled && selectionManager.selectionMode === 'none' && !isTrigger && closeOnSelect !== false && onClose) {
            onClose();
          }
          break;
        case 'Enter':
          // The Enter key should always close on select, except if overridden.
          if (!isDisabled && closeOnSelect !== false && !isTrigger && onClose) {
            onClose();
          }
          break;
        default:
          if (!isTrigger) {
            e.continuePropagation();
          }

          onKeyDown?.(e);
          break;
      }
    },
    onKeyUp
  });

  let {focusProps} = useFocus({onBlur, onFocus, onFocusChange});
  let domProps = filterDOMProps(item?.props);
  delete domProps.id;
  let linkProps = useLinkProps(item?.props);

  return {
    menuItemProps: {
      ...ariaProps,
      ...mergeProps(
        domProps,
        linkProps,
        isTrigger 
          ? {onFocus: itemProps.onFocus, 'data-collection': itemProps['data-collection'], 'data-key': itemProps['data-key']} 
          : itemProps,
        pressProps,
        hoverProps,
        keyboardProps,
        focusProps,
        // Prevent DOM focus from moving on mouse down when using virtual focus or this is a submenu/subdialog trigger.
        data.shouldUseVirtualFocus || isTrigger ? {onMouseDown: e => e.preventDefault()} : undefined,
        isDisabled ? undefined : {onClick}
      ),
      // If a submenu is expanded, set the tabIndex to -1 so that shift tabbing goes out of the menu instead of the parent menu item.
      tabIndex: itemProps.tabIndex != null && isTriggerExpanded && !data.shouldUseVirtualFocus ? -1 : itemProps.tabIndex
    },
    labelProps: {
      id: labelId
    },
    descriptionProps: {
      id: descriptionId
    },
    keyboardShortcutProps: {
      id: keyboardId
    },
    isFocused,
    isFocusVisible: isFocused && selectionManager.isFocused && isFocusVisible() && !isTriggerExpanded,
    isSelected,
    isPressed,
    isDisabled
  };
}
