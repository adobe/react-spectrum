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
import {FocusEvent} from '@react-types/shared';
import {HTMLAttributes, useRef} from 'react';

interface FocusWithinProps {
  isDisabled?: boolean,
  onFocusWithin?: (e: FocusEvent) => void,
  onBlurWithin?: (e: FocusEvent) => void,
  onFocusWithinChange?: (isFocusWithin: boolean) => void
}

interface FocusWithinResult {
  focusWithinProps: HTMLAttributes<HTMLElement>
}

/**
 * Handles focus events for the target and all children
 */
export function useFocusWithin(props: FocusWithinProps): FocusWithinResult {
  let state = useRef({
    isFocusWithin: false
  }).current;

  if (props.isDisabled) {
    return {focusWithinProps: {}};
  }

  let onFocus, onBlur;
  if (props.onFocusWithin || props.onFocusWithinChange) {
    onFocus = createEventHandler((e: FocusEvent) => {
      if (props.onFocusWithin) {
        props.onFocusWithin(e);
      }

      if (!state.isFocusWithin) {
        if (props.onFocusWithinChange) {
          props.onFocusWithinChange(true);
        }

        state.isFocusWithin = true;
      }
    });
  }

  if (props.onBlurWithin || props.onFocusWithinChange) {
    onBlur = createEventHandler((e: FocusEvent) => {
      // We don't want to trigger onBlurWithin and then immediately onFocusWithin again 
      // when moving focus inside the element. Only trigger if the currentTarget doesn't 
      // include the relatedTarget (where focus is moving).
      if (state.isFocusWithin && !e.currentTarget.contains(e.relatedTarget as HTMLElement)) {
        if (props.onBlurWithin) {
          props.onBlurWithin(e);
        }

        if (props.onFocusWithinChange) {
          props.onFocusWithinChange(false);
        }

        state.isFocusWithin = false;
      }
    });
  }
  
  return {
    focusWithinProps: {
      onFocus: onFocus,
      onBlur: onBlur
    }
  };
}
