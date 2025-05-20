/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {RefObject} from '@react-types/shared';
import {useEffect, useRef} from 'react';
import {useEffectEvent} from './useEffectEvent';

export function useFormReset<T>(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null> | undefined,
  initialValue: T,
  onReset: (value: T) => void
): void {
  let currEvent = useRef<Event | null>(null);
  let resetValue = useRef(initialValue);

  let handleReset = useEffectEvent((e: Event) => {
    currEvent.current = null;
    if (
      e.target === ref?.current?.form
      && onReset
      && !e.defaultPrevented
    ) {
      onReset(resetValue.current);
    }
  });

  /**
   * Because event.stopPropagation() does not preventDefault and because we attach directly to the form element unlike React
   * we need to create a new event which lets us monitor stopPropagation and preventDefault. This allows us to call onReset
   * as the browser would natively.
   */
  let formListener = useEffectEvent((e: Event) => {
    if (currEvent.current !== null || e.target !== ref?.current?.form) {
       // This is the re-dispatched event. Or it's for a different form.
      return;
    }
    let alreadyPrevented = e.defaultPrevented;
    e.stopPropagation();
    e.preventDefault();
    let event = new Event('reset', {bubbles: true, cancelable: true});
    currEvent.current = event;
    let originalStopPropagation = event.stopPropagation;
    let stopPropagation = () => {
      currEvent.current = null;
      originalStopPropagation.call(event);
      if (!alreadyPrevented && !event.defaultPrevented && onReset) {
        onReset(resetValue.current);
      }
    };
    event.stopPropagation = stopPropagation;

    e.target?.dispatchEvent(event);
  });

  useEffect(() => {
    let form = ref?.current?.form;
    let document = form?.ownerDocument;
    document?.addEventListener('reset', formListener, true);
    document?.addEventListener('reset', handleReset);
    return () => {
      document?.removeEventListener('reset', formListener, true);
      document?.removeEventListener('reset', handleReset);
    };
  }, [ref, handleReset, formListener]);
}
