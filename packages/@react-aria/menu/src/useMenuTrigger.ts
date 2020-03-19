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

import {AllHTMLAttributes} from 'react';
import {MenuTriggerProps, MenuTriggerState} from '@react-types/menu';
import {PressProps, useFocusWithin} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';
import {useOverlayTrigger} from '@react-aria/overlays';

interface MenuTriggerAria {
  menuTriggerProps: AllHTMLAttributes<HTMLElement> & PressProps,
  menuProps: AllHTMLAttributes<HTMLElement>
}

export function useMenuTrigger(props: MenuTriggerProps, state: MenuTriggerState): MenuTriggerAria {
  let {
    ref,
    type = 'menu' as MenuTriggerProps['type'],
    isDisabled
  } = props;

  let menuTriggerId = useId();
  let {triggerAriaProps, overlayAriaProps} = useOverlayTrigger({
    ref,
    type,
    onClose: () => state.setOpen(false),
    isOpen: state.isOpen
  });

  let onPress = () => {
    if (!isDisabled && !state.isOpen) {
      state.setFocusStrategy('first');
      state.setOpen(true);
    }
  };

  let onKeyDown = (e) => {
    if ((typeof e.isDefaultPrevented === 'function' && e.isDefaultPrevented()) || e.defaultPrevented || isDisabled) {
      return;
    }

    if (ref && ref.current) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          onPress();
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          onPress();
          // If no menu item is selected, focus last item when opening menu with ArrowDown
          state.setFocusStrategy('last');
          break;
      }
    }
  };

  let {focusWithinProps} = useFocusWithin({
    onBlurWithin: () => {
      state.setOpen(false);
    }
  });

  return {
    menuTriggerProps: {
      ...triggerAriaProps,
      id: menuTriggerId,
      onPressStart() {
        // Wait a frame to ensure target is focused prior to opening the menu so FocusScope
        // can record the correct element to restore focus to.
        requestAnimationFrame(() => {
          onPress();
        });
      },
      onKeyDown
    },
    menuProps: {
      ...overlayAriaProps,
      ...focusWithinProps,
      'aria-labelledby': menuTriggerId
    }
  };
}
