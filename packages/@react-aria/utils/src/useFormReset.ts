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

type ResetEvent = Event & {
  reactAriaReDispatched?: boolean,
  reactAriaShouldReset?: boolean
};

export function useFormReset<T>(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null> | undefined,
  initialValue: T,
  onReset: (value: T) => void
): void {
  let resetValue = useRef(initialValue);

  /**
   * Because event.stopPropagation() does not preventDefault and because we attach directly to the form element unlike React
   * we need to create a new event which lets us monitor stopPropagation and preventDefault. This allows us to call onReset
   * as the browser would natively.
   */
  let formListener = useEffectEvent((e: ResetEvent) => {
    if (e.reactAriaReDispatched || e.target !== ref?.current?.form) {
       // This is the re-dispatched event. Or it's for a different form.
      return;
    }
    if (e.reactAriaShouldReset === undefined) {
      let event: ResetEvent = new Event('reset', {bubbles: true, cancelable: true});
      event.reactAriaReDispatched = true;
      if (e.defaultPrevented) {
        event.preventDefault();
      }
      e.stopPropagation();
      e.preventDefault();

      e.reactAriaShouldReset = e.target?.dispatchEvent(event) ?? false;
    };
    if (onReset && e.reactAriaShouldReset) {
      onReset(resetValue.current);
    }
  });

  useEffect(() => {
    let form = ref?.current?.form;
    let document = form?.ownerDocument;
    document?.addEventListener('reset', formListener, true);
    return () => {
      document?.removeEventListener('reset', formListener, true);
    };
  }, [ref, formListener]);
}
