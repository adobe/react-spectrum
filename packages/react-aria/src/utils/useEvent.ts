/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {useEffect} from 'react';
import {useEffectEvent} from './useEffectEvent';

type EventHandlerMap<T extends EventTarget> = T extends Window
  ? WindowEventMap
  : T extends Document
    ? DocumentEventMap
    : T extends Element
      ? HTMLElementEventMap
      : T extends VisualViewport
        ? VisualViewportEventMap
        : GlobalEventHandlersEventMap;

export function useEvent<T extends EventTarget, K extends keyof EventHandlerMap<T>>(
  ref: RefObject<T | null>,
  event: Extract<K, string> | (string & {}),
  listener?: (this: T, ev: EventHandlerMap<Exclude<T, null>>[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  let handleEvent = useEffectEvent(listener);
  let isDisabled = listener == null;

  useEffect(() => {
    if (isDisabled || ref.current == null) {
      return;
    }

    return addEvent(ref.current, event, handleEvent, options);
  }, [ref, event, options, isDisabled]);
}

export function addEvent<T extends EventTarget, K extends keyof EventHandlerMap<Exclude<T, null>>>(
  target: T | null,
  event: Extract<K, string> | (string & {}),
  listener?: (this: T, ev: EventHandlerMap<Exclude<T, null>>[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  if (listener == null || target == null) {
    return () => {};
  }

  target.addEventListener(event, listener as EventListener, options);
  return () => target.removeEventListener(event, listener as EventListener, options);
}
