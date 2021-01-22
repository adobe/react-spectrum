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

import {RefObject, SyntheticEvent, useEffect} from 'react';

interface InteractOutsideProps {
  ref: RefObject<Element>,
  onInteractOutside?: (e: SyntheticEvent) => void,
  /** Whether the interact outside events should be disabled. */
  isDisabled?: boolean
}

/**
 * Example, used in components like Dialogs and Popovers so they can close
 * when a user clicks outside them.
 */
export function useInteractOutside(props: InteractOutsideProps) {
  let {ref, onInteractOutside, isDisabled} = props;

  useEffect(() => {
    if (!onInteractOutside) {
      return;
    }

    let onPointerDown = (e) => {
      if (isDisabled) {
        return;
      }
      if (isValidEvent(e, ref)) {
        onInteractOutside(e);
      }
    };

    // FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=1675846 prevents us from using this pointerevent
    // once it's fixed we can uncomment
    // Use pointer events if available. Otherwise, fall back to mouse and touch events.
    if (typeof PointerEvent !== 'undefined') {
      // changing these to capture phase fixed combobox
      document.addEventListener('pointerdown', onPointerDown, true);

      return () => {
        document.removeEventListener('pointerdown', onPointerDown, true);
      };
    } else {
      document.addEventListener('mousedown', onPointerDown, true);
      document.addEventListener('touchstart', onPointerDown, true);

      return () => {
        document.removeEventListener('mousedown', onPointerDown, true);
        document.removeEventListener('touchstart', onPointerDown, true);
      };
    }
  }, [onInteractOutside, ref, isDisabled]);
}

function isValidEvent(event, ref) {
  if (event.button > 0) {
    return false;
  }

  // if the event target is no longer in the document
  if (event.target) {
    const ownerDocument = event.target.ownerDocument;
    if (!ownerDocument || !ownerDocument.documentElement.contains(event.target)) {
      return false;
    }
  }

  return ref.current && !ref.current.contains(event.target);
}
