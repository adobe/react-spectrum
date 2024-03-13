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

import {getRootNode, useEffectEvent} from '@react-aria/utils';
import {RefObject, useEffect, useRef} from 'react';

export interface InteractOutsideProps {
  ref: RefObject<Element>,
  onInteractOutside?: (e: PointerEvent) => void,
  onInteractOutsideStart?: (e: PointerEvent) => void,
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

  let onPointerDown = useEffectEvent((e) => {
    if (onInteractOutside && isValidEvent(e, ref)) {
      if (onInteractOutsideStart) {
        onInteractOutsideStart(e);
      }
      stateRef.current.isPointerDown = true;
    }
  });

  let triggerInteractOutside = useEffectEvent((e: PointerEvent) => {
    if (onInteractOutside) {
      onInteractOutside(e);
    }
  });

  useEffect(() => {
    let state = stateRef.current;
    if (isDisabled) {
      return;
    }

    const element = ref.current;
    const documentObject = getRootNode(element);
    const isShadowRoot = documentObject instanceof ShadowRoot;

    // Use pointer events if available. Otherwise, fall back to mouse and touch events.
    if (typeof PointerEvent !== 'undefined') {
      let onPointerUp = (e) => {
        if (state.isPointerDown && isValidEvent(e, ref)) {
          triggerInteractOutside(e);
        }
        state.isPointerDown = false;
      };

      // changing these to capture phase fixed combobox
      documentObject.addEventListener('pointerdown', onPointerDown, true);
      documentObject.addEventListener('pointerup', onPointerUp, true);

      if (isShadowRoot) {
        documentObject.ownerDocument.addEventListener('pointerdown', onPointerDown, true);
        documentObject.ownerDocument.addEventListener('pointerup', onPointerUp, true);
      }

      return () => {
        documentObject.removeEventListener('pointerdown', onPointerDown, true);
        documentObject.removeEventListener('pointerup', onPointerUp, true);

        if (isShadowRoot) {
          documentObject.ownerDocument.removeEventListener('pointerdown', onPointerDown, true);
          documentObject.ownerDocument.removeEventListener('pointerup', onPointerUp, true);
        }
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

      if (isShadowRoot) {
        documentObject.ownerDocument.addEventListener('mousedown', onPointerDown, true);
        documentObject.ownerDocument.addEventListener('mouseup', onMouseUp, true);
        documentObject.ownerDocument.addEventListener('touchstart', onPointerDown, true);
        documentObject.ownerDocument.addEventListener('touchend', onTouchEnd, true);
      }

      documentObject.addEventListener('mousedown', onPointerDown, true);
      documentObject.addEventListener('mouseup', onMouseUp, true);
      documentObject.addEventListener('touchstart', onPointerDown, true);
      documentObject.addEventListener('touchend', onTouchEnd, true);

      return () => {

        if (isShadowRoot) {
          documentObject.ownerDocument.removeEventListener('mousedown', onPointerDown, true);
          documentObject.ownerDocument.removeEventListener('mouseup', onMouseUp, true);
          documentObject.ownerDocument.removeEventListener('touchstart', onPointerDown, true);
          documentObject.ownerDocument.removeEventListener('touchend', onTouchEnd, true);
        }

        documentObject.removeEventListener('mousedown', onPointerDown, true);
        documentObject.removeEventListener('mouseup', onMouseUp, true);
        documentObject.removeEventListener('touchstart', onPointerDown, true);
        documentObject.removeEventListener('touchend', onTouchEnd, true);
      };
    }
  }, [ref, isDisabled, onPointerDown, triggerInteractOutside]);
}

/**
 * Checks if an event is valid for triggering interact outside logic.
 *
 * This function determines the validity of an event based on several conditions:
 * - The event must be triggered by a left mouse click (button 0).
 * - The target of the event must be within the document.
 * - The target should not be within any element designated as a "top layer" (e.g., modals, overlays).
 * - The event target must not be contained within the specified reference element.
 *
 * For shadow DOM support, it uses event.composedPath() to accurately determine the event's target, ensuring
 * compatibility with events that originate from within shadow roots.
 *
 * @param {Event} event - The event to check.
 * @param {RefObject<Element>} ref - A React ref object pointing to the component's root element.
 * @returns {boolean} True if the event is valid and should trigger interact outside logic, false otherwise.
 */
function isValidEvent(event, ref) {
  if (event.button > 0) {
    return false;
  }

  // Use composedPath to accurately get the event path, including shadow DOMs
  const path = event.composedPath();
  const target = path[0];

  // Determine the root node for the event target and the component's ref
  const refRoot = getRootNode(ref.current);
  const targetRoot = getRootNode(target);

  // Check for top layer elements (e.g., modals or overlays) and ignore events within them
  if (target.closest('[data-react-aria-top-layer]')) {
    return false;
  }

  // The event is considered outside if:
  // 1. The target and ref are not in the same root (document or shadow root).
  // 2. The ref does not contain the target.
  return refRoot !== targetRoot || !ref.current.contains(target);
}


