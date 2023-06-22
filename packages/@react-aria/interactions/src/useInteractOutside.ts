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

import {RefObject, SyntheticEvent, useEffect, useRef} from 'react';
import {useDocument} from './ownerDocument';
import {useEffectEvent} from '@react-aria/utils';

export interface InteractOutsideProps {
  ref: RefObject<Element>,
  onInteractOutside?: (e: SyntheticEvent) => void,
  onInteractOutsideStart?: (e: SyntheticEvent) => void,
  /** Whether the interact outside events should be disabled. */
  isDisabled?: boolean
}

/**
 * Example, used in components like Dialogs and Popovers so they can close
 * when a user clicks outside them.
 */
export function useInteractOutside(props: InteractOutsideProps) {
  let {ref, onInteractOutside, isDisabled, onInteractOutsideStart} = props;
  let stateRef = useRef({
    isPointerDown: false,
    ignoreEmulatedMouseEvents: false
  });
  let ownerDocument = useDocument();

  let onPointerDown = useEffectEvent((e: SyntheticEvent) => {
    if (onInteractOutside && isValidEvent(e, ref)) {
      if (onInteractOutsideStart) {
        onInteractOutsideStart(e);
      }
      stateRef.current.isPointerDown = true;
    }
  });

  let triggerInteractOutside = useEffectEvent((e: SyntheticEvent) => {
    if (onInteractOutside) {
      onInteractOutside(e);
    }
  });

  useEffect(() => {
    let state = stateRef.current;
    if (isDisabled) {
      return;
    }

    // Use pointer events if available. Otherwise, fall back to mouse and touch events.
    if (typeof PointerEvent !== 'undefined') {
      let onPointerUp = (e) => {
        if (state.isPointerDown && isValidEvent(e, ref)) {
          triggerInteractOutside(e);
        }
        state.isPointerDown = false;
      };

      // changing these to capture phase fixed combobox
      ownerDocument.addEventListener('pointerdown', onPointerDown, true);
      ownerDocument.addEventListener('pointerup', onPointerUp, true);

      return () => {
        ownerDocument.removeEventListener('pointerdown', onPointerDown, true);
        ownerDocument.removeEventListener('pointerup', onPointerUp, true);
      };
    } else {
      let onMouseUp = (e) => {
        if (state.ignoreEmulatedMouseEvents) {
          state.ignoreEmulatedMouseEvents = false;
        } else if (state.isPointerDown && isValidEvent(e, ref)) {
          triggerInteractOutside(e);
        }
        state.isPointerDown = false;
      };

      let onTouchEnd = (e) => {
        state.ignoreEmulatedMouseEvents = true;
        if (state.isPointerDown && isValidEvent(e, ref)) {
          triggerInteractOutside(e);
        }
        state.isPointerDown = false;
      };

      ownerDocument.addEventListener('mousedown', onPointerDown, true);
      ownerDocument.addEventListener('mouseup', onMouseUp, true);
      ownerDocument.addEventListener('touchstart', onPointerDown, true);
      ownerDocument.addEventListener('touchend', onTouchEnd, true);

      return () => {
        ownerDocument.removeEventListener('mousedown', onPointerDown, true);
        ownerDocument.removeEventListener('mouseup', onMouseUp, true);
        ownerDocument.removeEventListener('touchstart', onPointerDown, true);
        ownerDocument.removeEventListener('touchend', onTouchEnd, true);
      };
    }
  }, [ref, isDisabled, onPointerDown, triggerInteractOutside, ownerDocument]);
}

function isValidEvent(event, ref) {
  if (event.button > 0) {
    return false;
  }

  if (event.target) {
    // if the event target is no longer in the document, ignore
    const ownerDocument = event.target.ownerDocument;
    if (!ownerDocument || !ownerDocument.documentElement.contains(event.target)) {
      return false;
    }

    // If the target is within a top layer element (e.g. toasts), ignore.
    if (event.target.closest('[data-react-aria-top-layer]')) {
      return false;
    }
  }

  return ref.current && !ref.current.contains(event.target);
}
