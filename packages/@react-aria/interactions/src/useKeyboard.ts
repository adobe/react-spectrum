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

import {createEventHandler} from './createEventHandler';
import {createKeyboardShortcutHandler, KeyboardShortcutBindings} from './createKeyboardShortcutHandler';
import {DOMAttributes, KeyboardEvents} from '@react-types/shared';
import {getEventTarget, nodeContains} from '@react-aria/utils';
import {KeyboardEvent as ReactKeyboardEvent, RefObject} from 'react';

export interface KeyboardProps extends KeyboardEvents {
  /** Whether the keyboard events should be disabled. */
  isDisabled?: boolean,
  /** Keyboard shortcuts to handle. */
  shortcuts?: KeyboardShortcutBindings,
  /** A ref to the element to ignore portal events. */
  ignorePortalRef?: RefObject<Element> | null
}

export interface KeyboardResult {
  /** Props to spread onto the target element. */
  keyboardProps: DOMAttributes
}

/**
 * Handles keyboard interactions for a focusable element.
 */
export function useKeyboard(props: KeyboardProps): KeyboardResult {
  let {shortcuts, ignorePortalRef = null} = props;
  let onKeyDown;
  let onKeyUp;
  if (shortcuts) {
    let shortcutHandler = createKeyboardShortcutHandler(shortcuts);
    onKeyDown = createEventHandler<ReactKeyboardEvent<any>>((e) => {
      // should be built in more somehow? or turn it off per matched handler?

      if (ignorePortalRef && ignorePortalRef.current && !nodeContains(ignorePortalRef.current, getEventTarget(e) as Element)) {
        e.continuePropagation();
        return;
      }
      shortcutHandler(e);
      props.onKeyDown?.(e);
    });
    onKeyUp = createEventHandler<ReactKeyboardEvent<any>>((e) => {
      if (ignorePortalRef && ignorePortalRef.current && !nodeContains(ignorePortalRef.current, getEventTarget(e) as Element)) {
        e.continuePropagation();
        return;
      }
      // implement shortcut handler on keyup
      e.continuePropagation();
      props.onKeyUp?.(e);
    });
  } else {
    onKeyDown = createEventHandler(props.onKeyDown);
    onKeyUp = createEventHandler(props.onKeyUp);
  }
  return {
    keyboardProps: props.isDisabled ? {} : {
      onKeyDown,
      onKeyUp
    }
  };
}
