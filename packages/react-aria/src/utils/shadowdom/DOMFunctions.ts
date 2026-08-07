// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16
/* eslint-disable rsp-rules/no-non-shadow-contains, rsp-rules/safe-event-target */

import {getOwnerWindow, isShadowRoot} from '../domHelpers';
import {shadowDOM} from 'react-stately/private/flags/flags';
import type {SyntheticEvent} from 'react';

/**
 * ShadowDOM safe version of Node.contains.
 */
export function nodeContains(
  node: Node | Element | null | undefined,
  otherNode: Node | Element | null | undefined
): boolean {
  if (!shadowDOM()) {
    return otherNode && node ? node.contains(otherNode) : false;
  }

  if (!node || !otherNode) {
    return false;
  }

  let currentNode: HTMLElement | Node | null | undefined = otherNode;

  while (currentNode !== null) {
    if (currentNode === node) {
      return true;
    }

    if (
      typeof (currentNode as HTMLSlotElement).assignedElements !== 'function' &&
      (currentNode as HTMLSlotElement).assignedSlot?.parentNode
    ) {
      // Element is slotted
      currentNode = (currentNode as HTMLSlotElement).assignedSlot!.parentNode;
    } else if (isShadowRoot(currentNode)) {
      // Element is in shadow root
      currentNode = currentNode.host;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return false;
}

/**
 * ShadowDOM safe version of document.activeElement.
 */
export const getActiveElement = (doc: Document = document): Element | null => {
  if (!shadowDOM()) {
    return doc.activeElement;
  }
  let activeElement: Element | null = doc.activeElement;

  while (
    activeElement &&
    'shadowRoot' in activeElement &&
    activeElement.shadowRoot?.activeElement
  ) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement;
};

// Type helper to extract the target element type from an event
type EventTargetType<T> = T extends SyntheticEvent<infer E, any> ? E : EventTarget;

// Possibly we can improve the types for this using https://github.com/adobe/react-spectrum/pull/8991/changes#diff-2d491c0c91701d28d08e1cf9fcadbdb21a030b67ab681460c9934140f29127b8R68 but it was more changes than I
// wanted to make to fix the function.
/**
 * ShadowDOM safe version of event.target.
 */
export function getEventTarget<T extends Event | SyntheticEvent>(event: T): EventTargetType<T> {
  if (shadowDOM() && event.target instanceof Element && event.target.shadowRoot) {
    if ('composedPath' in event) {
      return (event.composedPath()[0] ?? null) as EventTargetType<T>;
    } else if ('composedPath' in event.nativeEvent) {
      return (event.nativeEvent.composedPath()[0] ?? null) as EventTargetType<T>;
    }
  }
  return event.target as EventTargetType<T>;
}

/**
 * Returns the set of event targets a listener must be attached to in order to
 * globally observe an event.
 *
 * @param from - The target element to start from.
 * @param to - The element to stop at when bubbling. @default getOwnerWindow(from)
 *   `to` is generally going to be either `document` or `window`, but
 *   it can be any intermediate node.
 * @returns [global, ...shadowRoots]
 */
export function getPropagationTargets(
  from: Element | null | undefined,
  to?: Document | Window | Element | null
): EventTarget[] {
  // If `to` is coming from a ref, its type technically allows `null`.
  // In practice, this function will generally be called from within a useEffect.
  // If the ref has not resolved by that point, then a coding error has been made.
  // Better to return an empty array than `[window]`, which may appear to work
  // in the light DOM, but fail in the shadow DOM.
  if (to === null) {
    return [];
  }
  to = to ?? getOwnerWindow(from);
  let targets: EventTarget[] = [to];
  if (!shadowDOM() || !from || from === to) {
    return targets;
  }

  // The root `to` itself lives in. The event already reaches `to` once
  // it is inside this root, so we must NOT collect this root or anything above
  // it — only the shadow roots strictly between `refNode` and `to`.
  // `window` has no getRootNode; its boundary is the document, which the walk
  // reaches naturally (the document is not a ShadowRoot, so the loop exits).
  let toRoot = 'getRootNode' in to ? to.getRootNode() : null;
  let current: Node | null = from.getRootNode() ?? null;
  while (isShadowRoot(current) && current !== toRoot) {
    // order shouldn't matter
    targets.push(current);
    current = current.host.getRootNode();
  }

  return targets;
}

/**
 * ShadowDOM safe fast version of node.contains(document.activeElement).
 *
 * @param node
 * @returns
 */
export function isFocusWithin(node: Element | null | undefined): boolean {
  if (!node) {
    return false;
  }
  // Get the active element within the node's parent shadow root (or the document). Can return null.
  let root = node.getRootNode();
  let ownerWindow = getOwnerWindow(node);
  if (!(root instanceof ownerWindow.Document || root instanceof ownerWindow.ShadowRoot)) {
    return false;
  }
  let activeElement = root.activeElement;

  // Check if the active element is within this node. These nodes are within the same shadow root.
  return activeElement != null && node.contains(activeElement);
}
