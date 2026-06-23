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

import type {EventMapType} from '@react-types/shared';

export const getOwnerDocument = (target?: EventTarget | null): Document => {
  if (isWindow(target)) return target.document;

  // @ts-expect-error Ensure safe access in SSR environments.
  return target?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined);
};

export const getOwnerWindow = (el?: EventTarget | null): Window & typeof globalThis => {
  let ownerDocument = getOwnerDocument(el);

  // @ts-expect-error Ensure safe access in SSR environments.
  return ownerDocument?.defaultView ?? (typeof window !== 'undefined' ? window : undefined);
};

export const getOwnerViewport = (el?: EventTarget | null): VisualViewport | null => {
  let ownerWindow = getOwnerWindow(el);

  return ownerWindow?.visualViewport ?? null;
};

export const getOwnerRootElement = (el?: EventTarget | null): HTMLElement => {
  let ownerDocument = getOwnerDocument(el);
  let scrollingElement = ownerDocument?.scrollingElement as HTMLElement;

  return scrollingElement ?? ownerDocument?.documentElement;
};

/**
 * Type guard that checks if a value is a Node. Verifies the presence and type of the nodeType
 * property.
 */
export function isNode(value?: unknown): value is Node {
  return (
    value !== null &&
    typeof value === 'object' &&
    'nodeType' in value &&
    typeof value.nodeType === 'number'
  );
}

/**
 * Type guard that checks if a value is an Element. Uses window self reference checks to
 * distinguish Window from other values.
 */
export function isWindow(value?: unknown): value is Window & typeof globalThis {
  return typeof value === 'object' && value != null && 'window' in value && value.window === value;
}

/**
 * Type guard that checks if a value is a Document. Uses nodeType and documentElement checks to
 * distinguish Document from other values.
 */
export function isDocument(value?: unknown): value is Document {
  return isNode(value) && value.nodeType === 9 && 'documentElement' in value;
}

/**
 * Type guard that checks if a value is an Element. Uses nodeType and tagName property checks to
 * distinguish Element from other values.
 */
export function isElement(value?: unknown): value is Element {
  return isNode(value) && value.nodeType === 1 && 'tagName' in value;
}

/**
 * Type guard that checks if a value is an HTMLElement. Uses prototype checks to
 * distinguish Element from other values.
 */
export function isHTMLElement(value?: unknown): value is HTMLElement {
  return isElement(value) && value.namespaceURI === 'http://www.w3.org/1999/xhtml';
}

/**
 * Type guard that checks if a value is a ShadowRoot. Uses nodeType and host property checks to
 * distinguish ShadowRoot from other values.
 */
export function isShadowRoot(value?: unknown): value is ShadowRoot {
  return isNode(value) && value.nodeType === 11 && 'host' in value;
}

/**
 * Type guard that checks if a value is a SlotElement. Uses prototype and assignedElements checks to
 * distinguish SlotElements from other values.
 */
export function isSlotElement(value?: unknown): value is HTMLSlotElement {
  return isHTMLElement(value) && 'assignedElements' in value;
}

/**
 * Attaches an event listener on target(s) and returns a cleanup function.
 */
export function addEvent<T extends EventTarget, K extends keyof EventMapType<Exclude<T, null>>>(
  target: T | EventTarget[] | null,
  event: Extract<K, string> | (string & {}),
  listener?: (this: T, ev: EventMapType<Exclude<T, null>>[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  if (listener == null || target == null) {
    return () => {};
  }

  let eventTargets = Array.isArray(target) ? target : [target];

  for (let eventTarget of eventTargets) {
    eventTarget.addEventListener(event, listener as EventListener, options);
  }

  return () => {
    for (let eventTarget of eventTargets) {
      eventTarget.removeEventListener(event, listener as EventListener, options);
    }
  };
}

/**
 * Sets a CSS property on an element and returns a cleanup function.
 */
export function setStyle(
  target: HTMLElement | HTMLElement[] | null,
  property: string,
  value: string,
  priority?: string
): () => void {
  if (target == null) {
    return () => {};
  }

  let restore = new Array<Function>();
  let styleTargets = Array.isArray(target) ? target : [target];

  for (let styleTarget of styleTargets) {
    let initialValue = styleTarget.style.getPropertyValue(property);
    let initialPriority = styleTarget.style.getPropertyPriority(property);

    styleTarget.style.setProperty(property, value, priority);

    restore.unshift(() => {
      if (initialValue) {
        styleTarget.style.setProperty(property, initialValue, initialPriority);
      } else {
        styleTarget.style.removeProperty(property);
      }
    });
  }

  return () => {
    for (let cleanup of restore) {
      cleanup();
    }
  };
}
