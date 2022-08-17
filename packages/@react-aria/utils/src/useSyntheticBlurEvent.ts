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

class SyntheticBlurEvent implements ReactFocusEvent {
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

type Listener = (mutationList: MutationRecord[], target: HTMLElement) => boolean;

export function useSyntheticBlurEvent(onBlur: (e: ReactFocusEvent) => void) {
  let stateRef = useRef({
    isFocused: false,
    onBlur,
    disabledObserver: null as MutationObserver,
    target: null as HTMLElement
  });
  stateRef.current.onBlur = onBlur;

  let domNodeRemovedHandler = useCallback<Listener>((mutationList, target) => {
    if (stateRef.current.isFocused && target) {
      for (const mutation of mutationList) {
        for (const node of mutation.removedNodes) {
          if (node?.contains?.(target)) {
            domNodeRemovedObserver.removeListener(domNodeRemovedHandler);
            // fire blur which will be picked up by the 'once' blur handler defined below
            target.dispatchEvent(new FocusEvent('blur'));
            target.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
            // early return so we don't look at the rest of the DOM
            return true;
          }
        }
      }
    }
    return false;
  }, [stateRef]);

  let onBlurHandler = useCallback((e: FocusEvent) => {
    let target = e.target;
    stateRef.current.isFocused = false;

    if (
      (
        (target instanceof HTMLButtonElement ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement) &&
        target.disabled
      ) ||
      !document.body.contains(e.target as HTMLElement)
    ) {
      // For backward compatibility, dispatch a (fake) React synthetic event.
      stateRef.current.onBlur?.(new SyntheticBlurEvent('blur', e));
    }

    // We no longer need the MutationObserver once the target is blurred.
    if (stateRef.current.disabledObserver) {
      stateRef.current.disabledObserver.disconnect();
      stateRef.current.disabledObserver = null;
    }

    domNodeRemovedObserver.removeListener(domNodeRemovedHandler);
  }, [stateRef]);

  // Clean up MutationObserver on unmount. See below.
  useLayoutEffect(() => {
    const state = stateRef.current;

    return () => {
      if (stateRef.current.isFocused) {
        stateRef.current.isFocused = false;
      }
      if (stateRef.current.target) {
        stateRef.current.target.removeEventListener('focusout', onBlurHandler);
        stateRef.current.target = null;
      }
      if (state.disabledObserver) {
        state.disabledObserver.disconnect();
        state.disabledObserver = null;
      }
      domNodeRemovedObserver.removeListener(domNodeRemovedHandler);
    };
  }, [domNodeRemovedHandler]);

  // This function is called during a React onFocus event.
  return useCallback((e: ReactFocusEvent) => {

    let target = e.target;
    stateRef.current.isFocused = true;

    if (stateRef.current.target && target !== stateRef.current.target) {
      stateRef.current.target.removeEventListener('focusout', onBlurHandler);
      target.addEventListener('focusout', onBlurHandler, {once: true});
    } else if (!stateRef.current.target || e.target !== stateRef.current.target) {
      e.target.addEventListener('focusout', onBlurHandler, {once: true});
    }

    stateRef.current.target = target as HTMLElement;

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

      stateRef.current.disabledObserver = new MutationObserver(() => {
        if (stateRef.current.isFocused && (target as any).disabled) {
          stateRef.current.disabledObserver.disconnect();
          target.dispatchEvent(new FocusEvent('blur'));
          target.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
        }
      });

      stateRef.current.disabledObserver.observe(target, {attributes: true, attributeFilter: ['disabled']});
    }

    // Some browsers do not fire onBlur when the document.activeElement is removed from the dom.
    // Firefox has had a bug open about it for 13 years https://bugzilla.mozilla.org/show_bug.cgi?id=559561
    // A Safari bug has been logged for it as well https://bugs.webkit.org/show_bug.cgi?id=243749
    domNodeRemovedObserver.addListener(domNodeRemovedHandler, target);
  }, []);
}


class DOMNodeRemovedObserver {
  private observer;
  public listeners = new Map<Listener, HTMLElement>();
  constructor() {
    this.observer = new MutationObserver((mutationList) => {
      for (let [listener, target] of this.listeners) {
        if (listener(mutationList, target)) {
          // early return if we find a place to call blur
          return;
        }
      }
    });
  }
  addListener(listener, target) {
    if (this.listeners.size <= 0) {
      this.observer.observe(document, {childList: true, subtree: true, attributes: false, characterData: false});
    }
    this.listeners.set(listener, target);
  }
  removeListener(listener) {
    if (this.listeners.has(listener)) {
      this.listeners.delete(listener);
    }
    if (this.listeners.size <= 0) {
      this.observer.disconnect();
    }
  }
}
let domNodeRemovedObserver = new DOMNodeRemovedObserver();
