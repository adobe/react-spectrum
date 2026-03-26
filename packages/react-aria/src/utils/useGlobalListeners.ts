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

import {useCallback, useEffect, useRef} from 'react';

interface GlobalListeners {
  addGlobalListener<K extends keyof WindowEventMap>(el: Window, type: K, listener: (this: Document, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void,
  addGlobalListener<K extends keyof DocumentEventMap>(el: EventTarget, type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void,
  addGlobalListener(el: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void,
  removeGlobalListener<K extends keyof DocumentEventMap>(el: EventTarget, type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void,
  removeGlobalListener(el: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void,
  removeAllGlobalListeners(): void
}

export function useGlobalListeners(): GlobalListeners {
  let globalListeners = useRef(new Map());
  let addGlobalListener = useCallback((eventTarget, type, listener, options) => {
    // Make sure we remove the listener after it is called with the `once` option.
    let fn = options?.once ? (...args) => {
      globalListeners.current.delete(listener);
      listener(...args);
    } : listener;
    globalListeners.current.set(listener, {type, eventTarget, fn, options});
    eventTarget.addEventListener(type, fn, options);
  }, []);
  let removeGlobalListener = useCallback((eventTarget, type, listener, options) => {
    let fn = globalListeners.current.get(listener)?.fn || listener;
    eventTarget.removeEventListener(type, fn, options);
    globalListeners.current.delete(listener);
  }, []);
  let removeAllGlobalListeners = useCallback(() => {
    globalListeners.current.forEach((value, key) => {
      removeGlobalListener(value.eventTarget, value.type, key, value.options);
    });
  }, [removeGlobalListener]);

   
  useEffect(() => {
    return removeAllGlobalListeners;
  }, [removeAllGlobalListeners]);

  return {addGlobalListener, removeGlobalListener, removeAllGlobalListeners};
}
