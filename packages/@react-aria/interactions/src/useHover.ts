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

import {DOMAttributes, HoverEvents} from '@react-types/shared';
import {getOwnerDocument, nodeContains, useGlobalListeners} from '@react-aria/utils';
import {useEffect, useMemo, useRef, useState} from 'react';

export interface HoverProps extends HoverEvents {
  /** Whether the hover events should be disabled. */
  isDisabled?: boolean
}

export interface HoverResult {
  /** Props to spread on the target element. */
  hoverProps: DOMAttributes,
  isHovered: boolean
}

// iOS fires onPointerEnter twice: once with pointerType="touch" and again with pointerType="mouse".
// We want to ignore these emulated events so they do not trigger hover behavior.
// See https://bugs.webkit.org/show_bug.cgi?id=214609.
let globalIgnoreEmulatedMouseEvents = false;
let hoverCount = 0;

function setGlobalIgnoreEmulatedMouseEvents() {
  globalIgnoreEmulatedMouseEvents = true;

  // Clear globalIgnoreEmulatedMouseEvents after a short timeout. iOS fires onPointerEnter
  // with pointerType="mouse" immediately after onPointerUp and before onFocus. On other
  // devices that don't have this quirk, we don't want to ignore a mouse hover sometime in
  // the distant future because a user previously touched the element.
  setTimeout(() => {
    globalIgnoreEmulatedMouseEvents = false;
  }, 50);
}

function handleGlobalPointerEvent(e) {
  if (e.pointerType === 'touch') {
    setGlobalIgnoreEmulatedMouseEvents();
  }
}

function setupGlobalTouchEvents() {
  if (typeof document === 'undefined') {
    return;
  }

  if (typeof PointerEvent !== 'undefined') {
    document.addEventListener('pointerup', handleGlobalPointerEvent);
  } else {
    document.addEventListener('touchend', setGlobalIgnoreEmulatedMouseEvents);
  }

  hoverCount++;
  return () => {
    hoverCount--;
    if (hoverCount > 0) {
      return;
    }

    if (typeof PointerEvent !== 'undefined') {
      document.removeEventListener('pointerup', handleGlobalPointerEvent);
    } else {
      document.removeEventListener('touchend', setGlobalIgnoreEmulatedMouseEvents);
    }
  };
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
    isDisabled
  } = props;

  let [isHovered, setHovered] = useState(false);
  let state = useRef({
    isHovered: false,
    ignoreEmulatedMouseEvents: false,
    pointerType: '',
    target: null
  }).current;

  useEffect(setupGlobalTouchEvents, []);
  let {addGlobalListener, removeAllGlobalListeners} = useGlobalListeners();

  let {hoverProps, triggerHoverEnd} = useMemo(() => {
    let triggerHoverStart = (event, pointerType) => {
      state.pointerType = pointerType;
      if (isDisabled || pointerType === 'touch' || state.isHovered || !event.currentTarget.contains(event.target)) {
        return;
      }

      state.isHovered = true;
      let target = event.currentTarget;
      state.target = target;

      // When an element that is hovered over is removed, no pointerleave event is fired by the browser,
      // even though the originally hovered target may have shrunk in size so it is no longer hovered.
      // However, a pointerover event will be fired on the new target the mouse is over.
      // In Chrome this happens immediately. In Safari and Firefox, it happens upon moving the mouse one pixel.
      addGlobalListener(getOwnerDocument(event.target), 'pointerover', e => {
        if (state.isHovered && state.target && !nodeContains(state.target, e.target as Element)) {
          triggerHoverEnd(e, e.pointerType);
        }
      }, {capture: true});

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
      let target = state.target;
      state.pointerType = '';
      state.target = null;

      if (pointerType === 'touch' || !state.isHovered || !target) {
        return;
      }

      state.isHovered = false;
      removeAllGlobalListeners();

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

    let hoverProps: DOMAttributes = {};

    if (typeof PointerEvent !== 'undefined') {
      hoverProps.onPointerEnter = (e) => {
        if (globalIgnoreEmulatedMouseEvents && e.pointerType === 'mouse') {
          return;
        }

        triggerHoverStart(e, e.pointerType);
      };

      hoverProps.onPointerLeave = (e) => {
        if (!isDisabled && e.currentTarget.contains(e.target as Element)) {
          triggerHoverEnd(e, e.pointerType);
        }
      };
    } else {
      hoverProps.onTouchStart = () => {
        state.ignoreEmulatedMouseEvents = true;
      };

      hoverProps.onMouseEnter = (e) => {
        if (!state.ignoreEmulatedMouseEvents && !globalIgnoreEmulatedMouseEvents) {
          triggerHoverStart(e, 'mouse');
        }

        state.ignoreEmulatedMouseEvents = false;
      };

      hoverProps.onMouseLeave = (e) => {
        if (!isDisabled && e.currentTarget.contains(e.target as Element)) {
          triggerHoverEnd(e, 'mouse');
        }
      };
    }
    return {hoverProps, triggerHoverEnd};
  }, [onHoverStart, onHoverChange, onHoverEnd, isDisabled, state, addGlobalListener, removeAllGlobalListeners]);

  useEffect(() => {
    // Call the triggerHoverEnd as soon as isDisabled changes to true
    // Safe to call triggerHoverEnd, it will early return if we aren't currently hovering
    if (isDisabled) {
      triggerHoverEnd({currentTarget: state.target}, state.pointerType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled]);

  return {
    hoverProps,
    isHovered
  };
}
