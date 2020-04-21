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

import {HTMLAttributes, RefObject} from 'react';
import {MenuTriggerState} from '@react-stately/menu';
import {PressProps} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';
import {useOverlayTrigger} from '@react-aria/overlays';

interface MenuTriggerAriaProps {
  /** The type of menu that the menu trigger opens. */
  type?: 'menu' | 'listbox',

  /** A ref to the trigger element. */
  ref?: RefObject<HTMLElement | null>
}

interface MenuTriggerAria {
  /** Props for the menu trigger element. */
  menuTriggerProps: HTMLAttributes<HTMLElement> & PressProps,

  /** Props for the menu. */
  menuProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a menu trigger.
 * @param props - props for the menu trigger
 * @param state - state for the menu trigger
 */
export function useMenuTrigger(props: MenuTriggerAriaProps, state: MenuTriggerState): MenuTriggerAria {
  let {
    ref,
    type = 'menu' as MenuTriggerAriaProps['type']
  } = props;

  let menuTriggerId = useId();
  let {triggerProps, overlayProps} = useOverlayTrigger({
    ref,
    type,
    onClose: state.close,
    isOpen: state.isOpen
  });

  let onKeyDown = (e) => {
    if ((typeof e.isDefaultPrevented === 'function' && e.isDefaultPrevented()) || e.defaultPrevented) {
      return;
    }

    if (ref && ref.current) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          state.toggle('first');
          break;
        case 'ArrowUp':
          e.preventDefault();
          state.toggle('last');
          break;
      }
    }
  };

  return {
    menuTriggerProps: {
      ...triggerProps,
      id: menuTriggerId,
      onPressStart(e) {
        // For consistency with native, open the menu on mouse/key down, but touch up.
        if (e.pointerType !== 'touch') {
          // If opened with a keyboard or screen reader, auto focus the first item.
          // Otherwise, the menu itself will be focused.
          state.toggle(e.pointerType === 'keyboard' || e.pointerType === 'virtual' ? 'first' : null);
        }
      },
      onPress(e) {
        if (e.pointerType === 'touch') {
          state.toggle();
        }
      },
      onKeyDown
    },
    menuProps: {
      ...overlayProps,
      'aria-labelledby': menuTriggerId,
      onMouseDown(e) {
        // Safari blurs the focused item on mousedown on the scrollbar, when the menu is inside an iframe,
        // which casues the menu to close (see onBlurWithin above).
        // Preventing default on the event solves this.
        e.preventDefault();
      }
    }
  };
}
