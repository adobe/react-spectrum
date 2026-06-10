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
    typeof (value as Node).nodeType === 'number'
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
 * Type guard that checks if a value is an Element. Uses nodeType and tagName property checks to
 * distinguish Element from other ElementNodes.
 */
export function isElement(value?: unknown): value is Element {
  return isNode(value) && value.nodeType === Node.ELEMENT_NODE && 'tagName' in value;
}

/**
 * Type guard that checks if a value is an HTMLElement. Uses prototype checks to
 * distinguish Element from other Elements.
 */
export function isHTMLElement(value?: unknown): value is HTMLElement {
  return isElement(value) && value instanceof getOwnerWindow(value).HTMLElement;
}

/**
 * Type guard that checks if a value is an SVGElement. Uses prototype checks to
 * distinguish SVGElement from other Elements.
 */
export function isSVGElement(value?: unknown): value is SVGElement {
  return isElement(value) && value instanceof getOwnerWindow(value).SVGAElement;
}

/**
 * Type guard that checks if a value is a ShadowRoot. Uses nodeType and host property checks to
 * distinguish ShadowRoot from other DocumentFragments.
 */
export function isShadowRoot(value?: unknown): value is ShadowRoot {
  return isNode(value) && value.nodeType === Node.DOCUMENT_FRAGMENT_NODE && 'host' in value;
}
