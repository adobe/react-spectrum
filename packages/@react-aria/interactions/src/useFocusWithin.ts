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

// Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions

import {FocusEvent as ReactFocusEvent, HTMLAttributes, useRef} from 'react';
import {isPreact} from '@react-aria/utils';

interface FocusWithinProps {
  /** Whether the focus within events should be disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the target element or a descendant receives focus. */
  onFocusWithin?: (e: ReactFocusEvent) => void,
  /** Handler that is called when the target element and all descendants lose focus. */
  onBlurWithin?: (e: ReactFocusEvent) => void,
  /** Handler that is called when the the focus within state changes. */
  onFocusWithinChange?: (isFocusWithin: boolean) => void
}

interface FocusWithinResult {
  /** Props to spread onto the target element. */
  focusWithinProps: HTMLAttributes<HTMLElement>
}

/**
 * Handles focus events for the target and its descendants.
 */
export function useFocusWithin(props: FocusWithinProps): FocusWithinResult {
  let state = useRef({
    isFocusWithin: false
  }).current;

  if (props.isDisabled) {
    return {focusWithinProps: {}};
  }

  let onFocus = (e: ReactFocusEvent) => {
    if (!state.isFocusWithin) {
      if (props.onFocusWithin) {
        props.onFocusWithin(new Proxy(e, {
          get(target, prop) {
            if (prop === 'type') {
              return 'focus';
            }
            return target[prop];
          },
        }));
      }

      if (props.onFocusWithinChange) {
        props.onFocusWithinChange(true);
      }

      state.isFocusWithin = true;
    }
  };

  let onBlur = (e: ReactFocusEvent) => {
    // We don't want to trigger onBlurWithin and then immediately onFocusWithin again
    // when moving focus inside the element. Only trigger if the currentTarget doesn't
    // include the relatedTarget (where focus is moving).
    if (state.isFocusWithin && !e.currentTarget.contains(e.relatedTarget as HTMLElement)) {
      if (props.onBlurWithin) {
        props.onBlurWithin(new Proxy(e, {
          get(target, prop) {
            if (prop === 'type') {
              return 'blur';
            }
            return target[prop];
          },
        }));
      }

      if (props.onFocusWithinChange) {
        props.onFocusWithinChange(false);
      }

      state.isFocusWithin = false;
    }
  };

  return {
    focusWithinProps: isPreact ?
      {
        onfocusin: onFocus,
        onfocusout: onBlur
      } : {
        onFocus,
        onBlur
      }
  };
}
