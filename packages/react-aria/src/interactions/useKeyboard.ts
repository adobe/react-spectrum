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

import {chain} from '../utils/chain';
import {createEventHandler} from './createEventHandler';
import {
  createKeyboardShortcutHandler,
  KeyboardShortcutBindings
} from './createKeyboardShortcutHandler';
import {DOMAttributes, KeyboardEvents} from '@react-types/shared';
import {getEventTarget, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {KeyboardEvent as ReactKeyboardEvent} from 'react';

export interface KeyboardProps extends KeyboardEvents {
  /** Whether the keyboard events should be disabled. */
  isDisabled?: boolean;
  /** Keyboard shortcuts to handle. */
  shortcuts?: KeyboardShortcutBindings;
  allowRepeats?: boolean;
  allowComposing?: boolean;
}

export interface KeyboardResult {
  /** Props to spread onto the target element. */
  keyboardProps: DOMAttributes;
}

/**
 * Handles keyboard interactions for a focusable element.
 */
export function useKeyboard(props: KeyboardProps): KeyboardResult {
  let {shortcuts, allowRepeats = false, allowComposing = false} = props;
  let onKeyDown;
  let onKeyUp;
  if (shortcuts) {
    let shortcutHandler = createKeyboardShortcutHandler(shortcuts);
    let shortcutOnKeyDown = createEventHandler<ReactKeyboardEvent<any>>(e => {
      // If keyboard event didn't originate from a child of the current target,
      // then it's a React event coming through a portal. We should ignore it.
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        e.continuePropagation();
        return;
      }
      if (
        (e.nativeEvent?.repeat && !allowRepeats) ||
        (e.nativeEvent?.isComposing && !allowComposing)
      ) {
        e.continuePropagation();
        return;
      }

      shortcutHandler(e);
    });
    let shortcutOnKeyUp = createEventHandler<ReactKeyboardEvent<any>>(e => {
      // If keyboard event didn't originate from a child of the current target,
      // then it's a React event coming through a portal. We should ignore it.
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        e.continuePropagation();
        return;
      }
      if (
        (e.nativeEvent?.repeat && !allowRepeats) ||
        (e.nativeEvent?.isComposing && !allowComposing)
      ) {
        e.continuePropagation();
        return;
      }
      // implement shortcut handler on keyup, what should the map be called? or should it be another syntax on shortcuts?
      e.continuePropagation();
    });
    onKeyDown = props.onKeyDown ? chain(props.onKeyDown, shortcutOnKeyDown) : shortcutOnKeyDown;
    onKeyUp = props.onKeyUp ? chain(props.onKeyUp, shortcutOnKeyUp) : shortcutOnKeyUp;
  } else {
    onKeyDown = createEventHandler(props.onKeyDown);
    onKeyUp = createEventHandler(props.onKeyUp);
  }
  return {
    keyboardProps: props.isDisabled
      ? {}
      : {
          onKeyDown,
          onKeyUp
        }
  };
}
