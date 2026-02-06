// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16
/* eslint-disable rsp-rules/no-non-shadow-contains */

import {getOwnerWindow, isShadowRoot} from '../domHelpers';
import {shadowDOM} from '@react-stately/flags';

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

  let currentNode: HTMLElement | Node | null | undefined = otherNode;

  while (currentNode !== null) {
    if (currentNode === node) {
      return true;
    }

    if ((currentNode as HTMLSlotElement).tagName === 'SLOT' &&
      (currentNode as HTMLSlotElement).assignedSlot) {
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

  while (activeElement && 'shadowRoot' in activeElement &&
  activeElement.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement;
};

/**
 * ShadowDOM safe version of event.target.
 */
export function getEventTarget<T extends Event>(event: T): Element {
  if (shadowDOM() && (event.target as HTMLElement).shadowRoot) {
    if (event.composedPath) {
      return event.composedPath()[0] as Element;
    }
  }
  return event.target as Element;
}

/**
 * ShadowDOM safe fast version of node.contains(document.activeElement).
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
