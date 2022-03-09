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

import {FocusEvents} from '@react-types/shared';
import {HTMLAttributes, FocusEvent as ReactFocusEvent} from 'react';

interface FocusProps extends FocusEvents {
  /** Whether the focus events should be disabled. */
  isDisabled?: boolean
}

interface FocusResult {
  /** Props to spread onto the target element. */
  focusProps: HTMLAttributes<HTMLElement>
}

/**
 * Handles focus events for the immediate target.
 * Focus events on child elements will be ignored.
 */
export function useFocus(props: FocusProps): FocusResult {
  if (props.isDisabled) {
    return {focusProps: {}};
  }

  let onFocus: FocusProps['onFocus'];
  if (props.onFocus || props.onFocusChange || props.onBlur) {
    onFocus = (e: ReactFocusEvent) => {
      if (e.target === e.currentTarget) {
        if (props.onFocus) {
          props.onFocus(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(true);
        }

        // Use native events to handle the onBlur. React does not fire onBlur when an element is disabled.
        // https://github.com/facebook/react/issues/9142
        if (props.onBlur || props.onFocusChange) {
          let isFocused = true;
          let observer: MutationObserver;
          let SyntheticEvent: any = e.constructor;

          // Most browsers will fire a blur/focusout event when elements are disabled (except Firefox).
          let onBlur = (e: FocusEvent) => {
            if (e.target === e.currentTarget) {
              isFocused = false;

              // For backward compatibility, dispatch a React synthetic event.
              let event: ReactFocusEvent = new SyntheticEvent('onBlur', 'blur', null, e, e.target);
              event.currentTarget = e.currentTarget as Element;

              if (props.onBlur) {
                props.onBlur(event);
              }

              if (props.onFocusChange) {
                props.onFocusChange(false);
              }

              if (event.isPropagationStopped()) {
                e.stopPropagation();
              }

              e.target.removeEventListener('focusout', onBlur);
              if (observer) {
                observer.disconnect();
                observer = null;
              }
            }
          };

          e.target.addEventListener('focusout', onBlur);

          // If this is a <button> or <input>, use a MutationObserver to watch for the disabled attribute.
          // This is necessary because Firefox does not fire blur/focusout in this case. We dispatch these events ourselves instead.
          // For browsers that do, focusout fires before the MutationObserver, so onBlur should not fire twice.
          if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) {
            let target = e.target;
            observer = new MutationObserver(() => {
              if (isFocused && target.disabled) {
                observer.disconnect();
                e.target.dispatchEvent(new FocusEvent('blur'));
                e.target.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
              }
            });

            observer.observe(e.target, {attributes: true, attributeFilter: ['disabled']});
          }
        }
      }
    };
  }

  return {
    focusProps: {
      onFocus
    }
  };
}
