// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16
/* eslint-disable rsp-rules/no-non-shadow-contains */

import {isShadowRoot} from '../domHelpers';
import {shadowDOM} from '@react-stately/flags';
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

// Type helper to extract the target element type from an event
type EventTargetType<T> = T extends SyntheticEvent<infer E, any> ? E : EventTarget;

/**
 * ShadowDOM safe version of event.target.
 */
export function getEventTarget<T extends Event | SyntheticEvent>(event: T): EventTargetType<T> {
  // For React synthetic events, use the native event
  let nativeEvent: Event = 'nativeEvent' in event ? (event as SyntheticEvent).nativeEvent : event as Event;
  let target = nativeEvent.target!;

  if (shadowDOM() && (target as HTMLElement).shadowRoot) {
    if (nativeEvent.composedPath) {
      return nativeEvent.composedPath()[0] as EventTargetType<T>;
    }
  }
  return target as EventTargetType<T>;
}
