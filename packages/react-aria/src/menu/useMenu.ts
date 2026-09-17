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

import {
  AriaLabelingProps,
  CollectionBase,
  DOMAttributes,
  DOMProps,
  FocusStrategy,
  Key,
  KeyboardDelegate,
  KeyboardEvents,
  MultipleSelection,
  RefObject
} from '@react-types/shared';
import {filterDOMProps} from '../utils/filterDOMProps';
import {menuData} from './utils';
import {mergeProps} from '../utils/mergeProps';
import {TreeState} from 'react-stately/useTreeState';
import {useHover} from '../interactions/useHover';
import {useSelectableList} from '../selection/useSelectableList';

export interface MenuProps<T> extends CollectionBase<T>, MultipleSelection {
  /** Where the focus should be set. */
  autoFocus?: boolean | FocusStrategy;
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean;
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key, value: T) => void;
  /** Handler that is called when the menu should close after selecting an item. */
  onClose?: () => void;
}

export interface AriaMenuProps<T> extends MenuProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether pressing the escape key should clear selection in the menu or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: 'clearSelection' | 'none';
}

export interface MenuAria {
  /** Props for the menu element. */
  menuProps: DOMAttributes;
}

export interface AriaMenuOptions<T> extends Omit<AriaMenuProps<T>, 'children'>, KeyboardEvents {
  /** Whether the menu uses virtual scrolling. */
  isVirtualized?: boolean;
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate;
  /**
   * Whether the menu items should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 *
 * @param props - Props for the menu.
 * @param state - State for the menu, as returned by `useListState`.
 */
export function useMenu<T>(
  props: AriaMenuOptions<T>,
  state: TreeState<T>,
  ref: RefObject<HTMLElement | null>
): MenuAria {
  let {shouldFocusWrap = true, onKeyDown, onKeyUp, ...otherProps} = props;

  if (!props['aria-label'] && !props['aria-labelledby'] && process.env.NODE_ENV !== 'production') {
    console.warn('An aria-label or aria-labelledby prop is required for accessibility.');
  }

  let domProps = filterDOMProps(props, {labelable: true});
  let {listProps} = useSelectableList({
    ...otherProps,
    ref,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    shouldFocusWrap,
    linkBehavior: 'override'
  });

  // When the pointer leaves the menu entirely, clear the focused key so the last hovered item
  // doesn't keep intercepting Enter/Space. useSelectableCollection already moves DOM focus to the
  // menu itself once focusedKey becomes null (the same path used when a focused item is removed),
  // so this reuses that existing behavior rather than introducing a new one.
  // Skip this while a submenu opened from this menu is still expanded: the pointer moving from the
  // trigger item towards its submenu leaves this menu's bounding box (the submenu renders in a
  // separate popover), and the trigger item should stay visually focused while its submenu is open.
  let {hoverProps} = useHover({
    onHoverEnd() {
      let {selectionManager: manager} = state;
      if (
        manager.isFocused &&
        manager.focusedKey != null &&
        !ref.current?.querySelector('[aria-haspopup][aria-expanded="true"]')
      ) {
        manager.setFocusedKey(null);
      }
    }
  });

  menuData.set(state, {
    onClose: props.onClose,
    onAction: props.onAction,
    shouldUseVirtualFocus: props.shouldUseVirtualFocus
  });

  return {
    menuProps: mergeProps(
      domProps,
      {onKeyDown, onKeyUp},
      hoverProps,
      {
        role: 'menu',
        ...listProps,
        onKeyDown: e => {
          // don't clear the menu selected keys if the user is presses escape since escape closes the menu
          if (e.key !== 'Escape' || props.shouldUseVirtualFocus) {
            listProps.onKeyDown?.(e);
          }
        }
      }
    )
  };
}
