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

import {AriaButtonProps} from '../button/useButton';
import {AriaMenuOptions} from './useMenu';
import {FocusableElement, FocusStrategy, KeyboardEvent, RefObject} from '@react-types/shared';
import {focusWithoutScrolling} from '../utils/focusWithoutScrolling';
import intlMessages from '../../intl/menu/*.json';
import {MenuTriggerState, MenuTriggerType} from 'react-stately/useMenuTriggerState';
import {PressProps} from '../interactions/usePress';
import {useId} from '../utils/useId';
import {useKeyboard} from '../interactions/useKeyboard';
import {useLocalizedStringFormatter} from '../i18n/useLocalizedStringFormatter';
import {useLongPress} from '../interactions/useLongPress';
import {useOverlayTrigger} from '../overlays/useOverlayTrigger';

export interface AriaMenuTriggerProps {
  /** The type of menu that the menu trigger opens. */
  type?: 'menu' | 'listbox';
  /** Whether menu trigger is disabled. */
  isDisabled?: boolean;
  /** How menu is triggered. */
  trigger?: MenuTriggerType;
}

export interface MenuTriggerAria<T> {
  /** Props for the menu trigger element. */
  menuTriggerProps: AriaButtonProps;

  /** Props for the menu. */
  menuProps: AriaMenuOptions<T>;
}

/**
 * Provides the behavior and accessibility implementation for a menu trigger.
 *
 * @param props - Props for the menu trigger.
 * @param state - State for the menu trigger.
 * @param ref - Ref to the HTML element trigger for the menu.
 */
export function useMenuTrigger<T>(
  props: AriaMenuTriggerProps,
  state: MenuTriggerState,
  ref: RefObject<Element | null>
): MenuTriggerAria<T> {
  let {type = 'menu', isDisabled, trigger = 'press'} = props;

  let menuTriggerId = useId();
  let {triggerProps, overlayProps} = useOverlayTrigger({type}, state, ref);

  let open = (
    shouldOpen: boolean,
    e: KeyboardEvent,
    focusStrategy: FocusStrategy = 'first'
  ): boolean | void => {
    if (!shouldOpen || e.isDefaultPrevented()) {
      return false;
    }
    state.toggle(focusStrategy);
  };

  // React puts listeners on the same root, so even if propagation was stopped, immediate propagation is still possible.
  // useTypeSelect will handle the spacebar first if it's running, so we don't want to open if it's handled it already.
  // We use isDefaultPrevented() instead of isPropagationStopped() because createEventHandler stops propagation by default.
  // And default prevented means that the event was handled by something else (typeahead), so we don't want to open the menu.
  let {keyboardProps} = useKeyboard({
    isDisabled,
    shortcuts: {
      Enter: e => {
        return open(trigger !== 'longPress', e, 'first');
      },
      ' ': e => {
        return open(trigger !== 'longPress', e, 'first');
      },
      ArrowDown: e => {
        return open(trigger !== 'longPress', e, 'first');
      },
      ArrowUp: e => {
        return open(trigger !== 'longPress', e, 'last');
      },
      'Alt+Enter': e => {
        return open(trigger === 'longPress', e, 'first');
      },
      'Alt+ ': e => {
        return open(trigger === 'longPress', e, 'first');
      },
      // Alt+Arrow* must open for both trigger modes: for `press` it matches the same `e.key` cases as
      // plain Arrow*; for `longPress`, plain arrows are ignored elsewhere and Alt+Arrow is the opener
      // (see legacy `if (trigger === 'longPress' && !e.altKey) return` before the ArrowDown/Up switch).
      'Alt+ArrowDown': e => {
        return open(true, e, 'first');
      },
      'Alt+ArrowUp': e => {
        return open(true, e, 'last');
      }
    }
  });

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/menu');
  let {longPressProps} = useLongPress({
    isDisabled: isDisabled || trigger !== 'longPress',
    accessibilityDescription: stringFormatter.format('longPressMessage'),
    onLongPressStart() {
      state.close();
    },
    onLongPress() {
      state.open('first');
    }
  });

  let pressProps: PressProps = {
    preventFocusOnPress: true,
    onPressStart(e) {
      // For consistency with native, open the menu on mouse/key down, but touch up.
      if (e.pointerType !== 'touch' && e.pointerType !== 'keyboard' && !isDisabled) {
        // Ensure trigger has focus before opening the menu so it can be restored by FocusScope on close.
        focusWithoutScrolling(e.target as FocusableElement);

        // If opened with a screen reader, auto focus the first item.
        // Otherwise, the menu itself will be focused.
        state.open(e.pointerType === 'virtual' ? 'first' : null);
      }
    },
    onPress(e) {
      if (e.pointerType === 'touch' && !isDisabled) {
        // Ensure trigger has focus before opening the menu so it can be restored by FocusScope on close.
        focusWithoutScrolling(e.target as FocusableElement);

        state.toggle();
      }
    }
  };

  // omit onPress from triggerProps since we override it above.
  // oxlint-disable-next-line react/react-compiler
  delete triggerProps.onPress;

  return {
    // @ts-ignore - TODO we pass out both DOMAttributes AND AriaButtonProps, but useButton will discard the longPress event handlers, it's only through PressResponder magic that this works for RSP and RAC. it does not work in aria examples
    menuTriggerProps: {
      ...triggerProps,
      ...(trigger === 'press' ? pressProps : longPressProps),
      ...keyboardProps,
      id: menuTriggerId
    },
    menuProps: {
      ...overlayProps,
      'aria-labelledby': menuTriggerId,
      autoFocus: state.focusStrategy || true,
      onClose: state.close
    }
  };
}
