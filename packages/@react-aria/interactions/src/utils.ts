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

import {FocusEvent as ReactFocusEvent, useCallback, useRef} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

// Original licensing for the following method can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/blob/3c713d513195a53788b3f8bb4b70279d68b15bcc/packages/react-interactions/events/src/dom/shared/index.js#L74-L87

// Keyboards, Assistive Technologies, and element.click() all produce a "virtual"
// click event. This is a method of inferring such clicks. Every browser except
// IE 11 only sets a zero value of "detail" for click events that are "virtual".
// However, IE 11 uses a zero value for all click events. For IE 11 we rely on
// the quirk that it produces click events that are of type PointerEvent, and
// where only the "virtual" click lacks a pointerType field.

export function isVirtualClick(event: MouseEvent | PointerEvent): boolean {
  // JAWS/NVDA with Firefox.
  if ((event as any).mozInputSource === 0 && event.isTrusted) {
    return true;
  }

  return event.detail === 0 && !(event as PointerEvent).pointerType;
}

export class SyntheticFocusEvent implements ReactFocusEvent {
  nativeEvent: FocusEvent;
  target: Element;
  currentTarget: Element;
  relatedTarget: Element;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  timeStamp: number;
  type: string;

  constructor(type: string, nativeEvent: FocusEvent) {
    this.nativeEvent = nativeEvent;
    this.target = nativeEvent.target as Element;
    this.currentTarget = nativeEvent.currentTarget as Element;
    this.relatedTarget = nativeEvent.relatedTarget as Element;
    this.bubbles = nativeEvent.bubbles;
    this.cancelable = nativeEvent.cancelable;
    this.defaultPrevented = nativeEvent.defaultPrevented;
    this.eventPhase = nativeEvent.eventPhase;
    this.isTrusted = nativeEvent.isTrusted;
    this.timeStamp = nativeEvent.timeStamp;
    this.type = type;
  }

  isDefaultPrevented(): boolean {
    return this.nativeEvent.defaultPrevented;
  }

  preventDefault(): void {
    this.defaultPrevented = true;
    this.nativeEvent.preventDefault();
  }

  stopPropagation(): void {
    this.nativeEvent.stopPropagation();
    this.isPropagationStopped = () => true;
  }

  isPropagationStopped(): boolean {
    return false;
  }

  persist() {}
}

export function useSyntheticBlurEvent(onBlur: (e: ReactFocusEvent) => void) {
  let stateRef = useRef({
    isFocused: false,
    onBlur,
    observer: null as MutationObserver
  });
  stateRef.current.onBlur = onBlur;

  // Clean up MutationObserver on unmount. See below.
  // eslint-disable-next-line arrow-body-style
  useLayoutEffect(() => {
    const state = stateRef.current;
    return () => {
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
      }
    };
  }, []);

  // This function is called during a React onFocus event.
  return useCallback((e: ReactFocusEvent) => {
    // React does not fire onBlur when an element is disabled. https://github.com/facebook/react/issues/9142
    // Most browsers fire a native focusout event in this case, except for Firefox. In that case, we use a
    // MutationObserver to watch for the disabled attribute, and dispatch these events ourselves.
    // For browsers that do, focusout fires before the MutationObserver, so onBlur should not fire twice.
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      stateRef.current.isFocused = true;

      let target = e.target;
      let onBlurHandler = (e: FocusEvent) => {
        stateRef.current.isFocused = false;

        if (target.disabled) {
          // For backward compatibility, dispatch a (fake) React synthetic event.
          stateRef.current.onBlur?.(new SyntheticFocusEvent('blur', e));
        }

        // We no longer need the MutationObserver once the target is blurred.
        if (stateRef.current.observer) {
          stateRef.current.observer.disconnect();
          stateRef.current.observer = null;
        }
      };

      target.addEventListener('focusout', onBlurHandler, {once: true});

      stateRef.current.observer = new MutationObserver(() => {
        if (stateRef.current.isFocused && target.disabled) {
          stateRef.current.observer.disconnect();
          target.dispatchEvent(new FocusEvent('blur'));
          target.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
        }
      });

      stateRef.current.observer.observe(target, {attributes: true, attributeFilter: ['disabled']});
    }
  }, []);
}
