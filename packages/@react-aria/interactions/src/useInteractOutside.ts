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

import {RefObject, SyntheticEvent, useEffect, useRef} from 'react';

interface InteractOutsideProps {
  ref: RefObject<Element>,
  onInteractOutside?: (e: SyntheticEvent) => void
}

export function useInteractOutside(props: InteractOutsideProps) {
  let {ref, onInteractOutside} = props;
  let stateRef = useRef({
    ignoreEmulatedMouseEvents: false
  });
  let state = stateRef.current;

  useEffect(() => {
    // Use pointer events if available. Otherwise, fall back to mouse and touch events.
    if (typeof PointerEvent !== 'undefined') {
      let onPointerUp = (e) => {
        if (onInteractOutside && isValidEvent(e, ref)) {
          onInteractOutside(e);
        }
      };

      document.addEventListener('pointerup', onPointerUp, false);

      return () => {
        document.removeEventListener('pointerup', onPointerUp, false);
      };
    } else {
      let onMouseUp = (e) => {
        if (state.ignoreEmulatedMouseEvents) {
          state.ignoreEmulatedMouseEvents = false;
        } else if (onInteractOutside && isValidEvent(e, ref)) {
          onInteractOutside(e);
        }
      };

      let onTouchEnd = (e) => {
        state.ignoreEmulatedMouseEvents = true;
        if (onInteractOutside && isValidEvent(e, ref)) {
          onInteractOutside(e);
        }
      };

      document.addEventListener('mouseup', onMouseUp, false);
      document.addEventListener('touchend', onTouchEnd, false);

      return () => {
        document.removeEventListener('mouseup', onMouseUp, false);
        document.removeEventListener('touchend', onTouchEnd, false);
      };
    }
  }, [onInteractOutside, ref, state.ignoreEmulatedMouseEvents]);
}

function isValidEvent(event, ref) {
  if (event.button > 0) {
    return false;
  }

  return ref.current && !ref.current.contains(event.target);
}
