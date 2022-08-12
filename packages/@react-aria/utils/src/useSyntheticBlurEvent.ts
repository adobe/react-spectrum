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
import {useLayoutEffect} from './useLayoutEffect';

export class UseSyntheticBlurEvent implements ReactFocusEvent {
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
    observer: null as MutationObserver,
    removalObserver: null as MutationObserver
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
      if (state.removalObserver) {
        state.removalObserver.disconnect();
        state.removalObserver = null;
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

        if (target.disabled || !document.body.contains(e.target as HTMLElement)) {
          // For backward compatibility, dispatch a (fake) React synthetic event.
          stateRef.current.onBlur?.(new UseSyntheticBlurEvent('blur', e));
        }

        // We no longer need the MutationObserver once the target is blurred.
        if (stateRef.current.observer) {
          stateRef.current.observer.disconnect();
          stateRef.current.observer = null;
        }

        // We no longer need the MutationObserver once the target is blurred.
        if (stateRef.current.removalObserver) {
          stateRef.current.removalObserver.disconnect();
          stateRef.current.removalObserver = null;
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

      // Some browsers do not fire onBlur when the document.activeElement is removed from the dom.
      // Firefox has had a bug open about it for 13 years https://bugzilla.mozilla.org/show_bug.cgi?id=559561
      // A Safari bug has been logged for it as well https://bugs.webkit.org/show_bug.cgi?id=243749
      stateRef.current.removalObserver = new MutationObserver((mutationList) => {
        if (stateRef.current.isFocused) {
          for (const mutation of mutationList) {
            for (const node of mutation.removedNodes) {
              if (node?.contains?.(target)) {
                // this can be null because mutation observers fire async, so we might've disconnected and set to null before
                // this fires, but it's still been scheduled by an event that happened before we disconnected
                if (stateRef.current.removalObserver) {
                  stateRef.current.removalObserver.disconnect();
                  stateRef.current.removalObserver = null;
                  // fire blur to cleanup any other synthetic blur handlers
                  target.dispatchEvent(new FocusEvent('blur'));
                  target.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
                  // early return so we don't look at the rest of the DOM
                  return;
                }
              }
            }
          }
        }
      });

      stateRef.current.observer.observe(target, {attributes: true, attributeFilter: ['disabled']});

      stateRef.current.removalObserver.observe(document, {childList: true, subtree: true, attributes: false, characterData: false});
    }
  }, []);
}
