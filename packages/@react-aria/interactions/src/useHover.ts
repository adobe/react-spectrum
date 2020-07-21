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

import {HoverEvents} from '@react-types/shared';
import {HTMLAttributes, useMemo, useRef, useState} from 'react';

export interface HoverProps extends HoverEvents {
  /** Whether the hover events should be disabled. */
  isDisabled?: boolean
  isHovered?: boolean
}

interface HoverResult {
  /** Props to spread on the target element. */
  hoverProps: HTMLAttributes<HTMLElement>
  isHovered: boolean
}

/**
 * Handles pointer hover interactions for an element. Normalizes behavior
 * across browsers and platforms, and ignores emulated mouse events on touch devices.
 */
export function useHover(props: HoverProps): HoverResult {
  let { 
    onHoverStart, 
    onHoverChange, 
    onHoverEnd, 
    isDisabled, 
    isHovered: isHoveredProp 
  } = props;

  let [isHovered, setHovered] = useState(false);
  let state = useRef({
    isHovered: false,
    ignoreEmulatedMouseEvents: false
  }).current;

  let hoverProps = useMemo(() => {
    let triggerHoverStart = (event, pointerType) => {
      if (isDisabled || pointerType === 'touch' || state.isHovered) {
        return;
      }

      state.isHovered = true;
      let target = event.target;

      if (onHoverStart) {
        onHoverStart({
          type: 'hoverstart',
          target,
          pointerType
        });
      }

      if (onHoverChange) {
        onHoverChange(true);
      }

      setHovered(true);
    };

    let triggerHoverEnd = (event, pointerType) => {
      if (isDisabled || pointerType === 'touch' || !state.isHovered) {
        return;
      }

      state.isHovered = false;
      let target = event.target;

      if (onHoverEnd) {
        onHoverEnd({
          type: 'hoverend',
          target,
          pointerType
        });
      }

      if (onHoverChange) {
        onHoverChange(false);
      }

      setHovered(false);
    };

    let hoverProps: HTMLAttributes<HTMLElement> = {};

    if (typeof PointerEvent !== 'undefined') {
      hoverProps.onPointerEnter = (e) => {
        triggerHoverStart(e, e.pointerType);
      };

      hoverProps.onPointerLeave = (e) => {
        triggerHoverEnd(e, e.pointerType);
      };
    } else {
      hoverProps.onTouchStart = () => {
        state.ignoreEmulatedMouseEvents = true;
      };

      hoverProps.onMouseEnter = (e) => {
        if (!state.ignoreEmulatedMouseEvents) {
          triggerHoverStart(e, 'mouse');
        }

        state.ignoreEmulatedMouseEvents = false;
      };

      hoverProps.onMouseLeave = (e) => {
        triggerHoverEnd(e, 'mouse');
      };
    }
    return hoverProps;
  }, [onHoverStart, onHoverChange, onHoverEnd, isDisabled, state]);

  return {
    hoverProps,
    isHovered: isHoveredProp || isHovered
  };
}
