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

import {AriaButtonProps} from '@react-types/button';
import {HTMLAttributes, RefObject} from 'react';
import {MenuTriggerState} from '@react-stately/menu';
import {useId} from '@react-aria/utils';
import {useOverlayTrigger} from '@react-aria/overlays';

interface MenuTriggerAriaProps {
  /** The type of menu that the menu trigger opens. */
  type?: 'menu' | 'listbox',
  /** Whether menu trigger is disabled. */
  isDisabled?: boolean
}

interface MenuTriggerAria {
  /** Props for the menu trigger element. */
  menuTriggerProps: AriaButtonProps,

  /** Props for the menu. */
  menuProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a menu trigger.
 * @param props - Props for the menu trigger.
 * @param state - State for the menu trigger.
 */
export function useMenuTrigger(props: MenuTriggerAriaProps, state: MenuTriggerState, ref: RefObject<HTMLElement>): MenuTriggerAria {
  let {
    type = 'menu' as MenuTriggerAriaProps['type'],
    isDisabled
  } = props;

  let menuTriggerId = useId();
  let {triggerProps, overlayProps} = useOverlayTrigger({type}, state, ref);

  let onKeyDown = (e) => {
    if ((typeof e.isDefaultPrevented === 'function' && e.isDefaultPrevented()) || e.defaultPrevented || isDisabled) {
      return;
    }

    if (ref && ref.current) {
      switch (e.key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          state.toggle('first');
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
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
        if (e.pointerType !== 'touch' && e.pointerType !== 'keyboard') {
          // If opened with a screen reader, auto focus the first item.
          // Otherwise, the menu itself will be focused.
          state.toggle(e.pointerType === 'virtual' ? 'first' : null);
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
      'aria-labelledby': menuTriggerId
    }
  };
}
