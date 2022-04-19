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

import {FocusEvent, HTMLAttributes} from 'react';
import {FocusEvents} from '@react-types/shared';
import {useSyntheticBlurEvent} from './utils';

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
  let onBlur: FocusProps['onBlur'];
  if (!props.isDisabled && (props.onBlur || props.onFocusChange)) {
    onBlur = (e: FocusEvent) => {
      if (e.target === e.currentTarget) {
        if (props.onBlur) {
          props.onBlur(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(false);
        }

        return true;
      }
    };
  } else {
    onBlur = null;
  }

  let onSyntheticFocus = useSyntheticBlurEvent(onBlur);

  let onFocus: FocusProps['onFocus'];
  if (!props.isDisabled && (props.onFocus || props.onFocusChange || props.onBlur)) {
    onFocus = (e: FocusEvent) => {
      if (e.target === e.currentTarget) {
        if (props.onFocus) {
          props.onFocus(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(true);
        }

        onSyntheticFocus(e);
      }
    };
  }

  return {
    focusProps: {
      onFocus,
      onBlur
    }
  };
}
