// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16
/* eslint-disable rsp-rules/no-non-shadow-contains, rsp-rules/safe-event-target */

import {getOwnerDocument, getOwnerWindow, isShadowRoot} from '../domHelpers';
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
      (currentNode as HTMLSlotElement).tagName === 'SLOT' &&
      (currentNode as HTMLSlotElement).assignedSlot
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
 * Returns the set of event targets a listener must be attached to for an event
 * to be observed at `global`, given an element `refNode` that may live inside
 * one or more shadow roots.
 *
 * Returns `[global, ...shadowRoots]`, where shadowRoots are the ShadowRoots
 * enclosing `refNode` that lie between it and `global`. Needed for events that
 * are `composed: false` and do not propagate out of shadow roots even in the
 * capture phase. Pass the result straight to `addEvent` (react-aria/domHelpers).
 *
 * Known `composed: false` events (non-exhaustive):
 * - `scroll`
 * - `scrollend`
 * - `change`
 * - `submit`
 * - `reset`
 * - `select`
 * - `selectstart`
 * - `slotchange`
 */
export function getPropagationTargets(from: Element | null | undefined): EventTarget[] {
  const global = getOwnerDocument(from);
  let targets: EventTarget[] = [global];
  if (!shadowDOM() || from == null) {
    return targets;
  }

  let current: Node | null = from.getRootNode() ?? null;
  while (isShadowRoot(current)) {
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
