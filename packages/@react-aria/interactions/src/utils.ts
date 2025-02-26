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

import {FocusableElement} from '@react-types/shared';
import {focusWithoutScrolling, getOwnerWindow, isFocusable, useEffectEvent, useLayoutEffect} from '@react-aria/utils';
import {FocusEvent as ReactFocusEvent, useCallback, useRef} from 'react';

export class SyntheticFocusEvent<Target = Element> implements ReactFocusEvent<Target> {
  nativeEvent: FocusEvent;
  target: EventTarget & Target;
  currentTarget: EventTarget & Target;
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
    this.target = nativeEvent.target as EventTarget & Target;
    this.currentTarget = nativeEvent.currentTarget as EventTarget & Target;
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

export function useSyntheticBlurEvent<Target = Element>(onBlur: (e: ReactFocusEvent<Target>) => void) {
  let stateRef = useRef({
    isFocused: false,
    observer: null as MutationObserver | null
  });

  // Clean up MutationObserver on unmount. See below.
   
  useLayoutEffect(() => {
    const state = stateRef.current;
    return () => {
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
      }
    };
  }, []);

  let dispatchBlur = useEffectEvent((e: SyntheticFocusEvent<Target>) => {
    onBlur?.(e);
  });

  // This function is called during a React onFocus event.
  return useCallback((e: ReactFocusEvent<Target>) => {
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
      let onBlurHandler: EventListenerOrEventListenerObject | null = (e) => {
        stateRef.current.isFocused = false;

        if (target.disabled) {
          // For backward compatibility, dispatch a (fake) React synthetic event.
          dispatchBlur(new SyntheticFocusEvent('blur', e as FocusEvent));
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
          stateRef.current.observer?.disconnect();
          let relatedTargetEl = target === document.activeElement ? null : document.activeElement;
          target.dispatchEvent(new FocusEvent('blur', {relatedTarget: relatedTargetEl}));
          target.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget: relatedTargetEl}));
        }
      });

      stateRef.current.observer.observe(target, {attributes: true, attributeFilter: ['disabled']});
    }
  }, [dispatchBlur]);
}

export let ignoreFocusEvent = false;

/**
 * This function prevents the next focus event fired on `target`, without using `event.preventDefault()`.
 * It works by waiting for the series of focus events to occur, and reverts focus back to where it was before.
 * It also makes these events mostly non-observable by using a capturing listener on the window and stopping propagation.
 */
export function preventFocus(target: FocusableElement | null) {
  // The browser will focus the nearest focusable ancestor of our target.
  while (target && !isFocusable(target)) {
    target = target.parentElement;
  }

  let window = getOwnerWindow(target);
  let activeElement = window.document.activeElement as FocusableElement | null;
  if (!activeElement || activeElement === target) {
    return;
  }
  
  ignoreFocusEvent = true;
  let isRefocusing = false;
  let onBlur = (e: FocusEvent) => {
    if (e.target === activeElement || isRefocusing) {
      e.stopImmediatePropagation();
    }
  };

  let onFocusOut = (e: FocusEvent) => {
    if (e.target === activeElement || isRefocusing) {
      e.stopImmediatePropagation();

      // If there was no focusable ancestor, we don't expect a focus event.
      // Re-focus the original active element here.
      if (!target && !isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };
  
  let onFocus = (e: FocusEvent) => {
    if (e.target === target || isRefocusing) {
      e.stopImmediatePropagation();
    }
  };

  let onFocusIn = (e: FocusEvent) => {
    if (e.target === target || isRefocusing) {
      e.stopImmediatePropagation();

      if (!isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };

  window.addEventListener('blur', onBlur, true);
  window.addEventListener('focusout', onFocusOut, true);
  window.addEventListener('focusin', onFocusIn, true);
  window.addEventListener('focus', onFocus, true);

  let cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('blur', onBlur, true);
    window.removeEventListener('focusout', onFocusOut, true);
    window.removeEventListener('focusin', onFocusIn, true);
    window.removeEventListener('focus', onFocus, true);
    ignoreFocusEvent = false;
    isRefocusing = false;
  };

  let raf = requestAnimationFrame(cleanup);
  return cleanup;
}
