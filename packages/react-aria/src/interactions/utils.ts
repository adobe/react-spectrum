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
import {focusWithoutScrolling} from '../utils/focusWithoutScrolling';
import {getActiveElement, getEventTarget, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {getOwnerWindow} from '../utils/domHelpers';
import {isFocusable} from '../utils/isFocusable';
import {FocusEvent as ReactFocusEvent, SyntheticEvent, useCallback, useRef} from 'react';
import {useLayoutEffect} from '../utils/useLayoutEffect';

// Turn a native event into a React synthetic event.
export function createSyntheticEvent<E extends SyntheticEvent>(nativeEvent: Event): E {
  let event = nativeEvent as any as E;
  event.nativeEvent = nativeEvent;
  event.isDefaultPrevented = () => event.defaultPrevented;
  // cancelBubble is technically deprecated in the spec, but still supported in all browsers.
  event.isPropagationStopped = () => (event as any).cancelBubble;
  event.persist = () => {};
  return event;
}

export function setEventTarget(event: Event, target: Element): void {
  Object.defineProperty(event, 'target', {value: target});
  Object.defineProperty(event, 'currentTarget', {value: target});
}

export function useSyntheticBlurEvent<Target extends Element = Element>(
  onBlur: (e: ReactFocusEvent<Target>) => void
): (e: ReactFocusEvent<Target>) => void {
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

  // This function is called during a React onFocus event.
  return useCallback(
    (e: ReactFocusEvent<Target>) => {
      // React does not fire onBlur when an element is disabled. https://github.com/facebook/react/issues/9142
      // Most browsers fire a native focusout event in this case, except for Firefox. In that case, we use a
      // MutationObserver to watch for the disabled attribute, and dispatch these events ourselves.
      // For browsers that do, focusout fires before the MutationObserver, so onBlur should not fire twice.
      let eventTarget = getEventTarget(e);
      if (
        eventTarget instanceof HTMLButtonElement ||
        eventTarget instanceof HTMLInputElement ||
        eventTarget instanceof HTMLTextAreaElement ||
        eventTarget instanceof HTMLSelectElement
      ) {
        stateRef.current.isFocused = true;

        let target = eventTarget;
        let onBlurHandler: EventListenerOrEventListenerObject | null = e => {
          stateRef.current.isFocused = false;

          if (target.disabled) {
            // For backward compatibility, dispatch a (fake) React synthetic event.
            let event = createSyntheticEvent<ReactFocusEvent<Target>>(e);
            onBlur?.(event);
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
            let relatedTargetEl = target === getActiveElement() ? null : getActiveElement();
            target.dispatchEvent(new FocusEvent('blur', {relatedTarget: relatedTargetEl}));
            target.dispatchEvent(
              new FocusEvent('focusout', {bubbles: true, relatedTarget: relatedTargetEl})
            );
          }
        });

        stateRef.current.observer.observe(target, {
          attributes: true,
          attributeFilter: ['disabled']
        });
      }
    },
    [onBlur]
  );
}

export let ignoreFocusEvent = false;
export let ignoreTransientFocus = false;

let transientFocusRoot: HTMLElement | null = null;
let endTransientFocusCleanup: (() => void) | null = null;

/**
 * Suppresses focus ring and focus-visible updates while focus briefly moves to a
 * collection root during Shift+Tab exit pivot.
 */
export function beginTransientCollectionFocus(root: HTMLElement): void {
  endTransientCollectionFocus();

  ignoreTransientFocus = true;
  ignoreFocusEvent = true;
  transientFocusRoot = root;

  let window = getOwnerWindow(root);
  let onFocusIn = (e: FocusEvent) => {
    let target = getEventTarget(e) as Element;
    if (transientFocusRoot && !nodeContains(transientFocusRoot, target)) {
      endTransientCollectionFocus();
    }
  };

  window.addEventListener('focusin', onFocusIn, true);

  let raf = requestAnimationFrame(() => {
    if (ignoreTransientFocus) {
      endTransientCollectionFocus();
    }
  });

  endTransientFocusCleanup = () => {
    window.removeEventListener('focusin', onFocusIn, true);
    cancelAnimationFrame(raf);
    endTransientFocusCleanup = null;
  };
}

export function endTransientCollectionFocus(): void {
  endTransientFocusCleanup?.();
  ignoreTransientFocus = false;
  ignoreFocusEvent = false;
  transientFocusRoot = null;
}

/**
 * Returns true when the collection root receives focus from a descendant during
 * a Shift+Tab exit pivot. Focus ring updates on the root should be suppressed,
 * but descendant blur events should still update focus state normally.
 */
export function shouldIgnoreTransientFocusChange(
  relatedTarget: Element | null,
  currentTarget: Element
): boolean {
  if (!ignoreTransientFocus || !transientFocusRoot) {
    return false;
  }

  if (currentTarget === transientFocusRoot) {
    return relatedTarget !== null && nodeContains(transientFocusRoot, relatedTarget);
  }

  return false;
}

/**
 * This function prevents the next focus event fired on `target`, without using
 * `event.preventDefault()`. It works by waiting for the series of focus events to occur, and
 * reverts focus back to where it was before. It also makes these events mostly non-observable by
 * using a capturing listener on the window and stopping propagation.
 */
export function preventFocus(target: FocusableElement | null): (() => void) | undefined {
  // The browser will focus the nearest focusable ancestor of our target.
  while (target && !isFocusable(target, {skipVisibilityCheck: true})) {
    target = target.parentElement;
  }

  let ownerWindow = getOwnerWindow(target);
  let activeElement = ownerWindow.document.activeElement as FocusableElement | null;
  if (!activeElement || activeElement === target) {
    return;
  }

  ignoreFocusEvent = true;
  let isRefocusing = false;
  let onBlur = (e: FocusEvent) => {
    if (getEventTarget(e) === activeElement || isRefocusing) {
      e.stopImmediatePropagation();
    }
  };

  let onFocusOut = (e: FocusEvent) => {
    if (getEventTarget(e) === activeElement || isRefocusing) {
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
    if (getEventTarget(e) === target || isRefocusing) {
      e.stopImmediatePropagation();
    }
  };

  let onFocusIn = (e: FocusEvent) => {
    if (getEventTarget(e) === target || isRefocusing) {
      e.stopImmediatePropagation();

      if (!isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };

  ownerWindow.addEventListener('blur', onBlur, true);
  ownerWindow.addEventListener('focusout', onFocusOut, true);
  ownerWindow.addEventListener('focusin', onFocusIn, true);
  ownerWindow.addEventListener('focus', onFocus, true);

  let cleanup = () => {
    cancelAnimationFrame(raf);
    ownerWindow.removeEventListener('blur', onBlur, true);
    ownerWindow.removeEventListener('focusout', onFocusOut, true);
    ownerWindow.removeEventListener('focusin', onFocusIn, true);
    ownerWindow.removeEventListener('focus', onFocus, true);
    ignoreFocusEvent = false;
    isRefocusing = false;
  };

  let raf = requestAnimationFrame(cleanup);
  return cleanup;
}
