// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16
/* eslint-disable rsp-rules/no-non-shadow-contains, rsp-rules/safe-event-target */

import {EventTargetType} from '@react-types/shared';
import {
  getOwnerDocument,
  isDocument,
  isElement,
  isHTMLElement,
  isShadowRoot,
  isSlotElement
} from '../domHelpers';
import {shadowDOM} from 'react-stately/private/flags/flags';
import type {SyntheticEvent} from 'react';

/**
 * ShadowDOM safe version of Node.contains.
 */
export function nodeContains(
  node: Node | null | undefined,
  otherNode: Node | null | undefined
): boolean {
  if (!shadowDOM()) {
    return otherNode && node ? node.contains(otherNode) : false;
  }

  if (!node || !otherNode) {
    return false;
  }

  let current: Node | null = otherNode;

  while (current != null) {
    if (current === node) {
      return true;
    }

    if (isHTMLElement(current) && !isSlotElement(current) && current.assignedSlot?.parentNode) {
      current = current.assignedSlot.parentNode;
    } else if (isShadowRoot(current)) {
      current = current.host;
    } else {
      current = current.parentNode;
    }
  }

  return false;
}

/**
 * ShadowDOM safe version of document.activeElement.
 */
export const getActiveElement = (doc: Document = getOwnerDocument()): Element | null => {
  if (!doc) {
    return null;
  } else if (!shadowDOM()) {
    return doc.activeElement;
  }

  let current: Element | null = doc.activeElement;

  while (isElement(current) && current.shadowRoot?.activeElement) {
    current = current.shadowRoot.activeElement;
  }

  return current;
};

// Possibly we can improve the types for this using https://github.com/adobe/react-spectrum/pull/8991/changes#diff-2d491c0c91701d28d08e1cf9fcadbdb21a030b67ab681460c9934140f29127b8R68 but it was more changes than I
// wanted to make to fix the function.
/**
 * ShadowDOM safe version of event.target.
 */
export function getEventTarget<T extends Event | SyntheticEvent>(event: T): EventTargetType<T> {
  if (shadowDOM() && isElement(event.target) && event.target.shadowRoot) {
    if ('composedPath' in event) {
      return (event.composedPath()[0] ?? null) as EventTargetType<T>;
    }

    if ('composedPath' in event.nativeEvent) {
      return (event.nativeEvent.composedPath()[0] ?? null) as EventTargetType<T>;
    }
  }

  return event.target as EventTargetType<T>;
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

  if (!isDocument(root) && !isShadowRoot(root)) {
    return false;
  }

  // Check if the active element is within this node. These nodes are within the same shadow root.
  return root.activeElement != null && node.contains(root.activeElement);
}
