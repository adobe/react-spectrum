// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16

import {SyntheticEvent} from 'react';
import {isShadowRoot} from '../domHelpers';
import {shadowDOM} from '@react-stately/flags';

/**
 * ShadowDOM safe version of Node.contains.
 */
export function nodeContains(
  node: Node | EventTarget | null | undefined,
  otherNode: Node | EventTarget | null | undefined
): boolean {
  if (!shadowDOM()) {
    return node instanceof Node && otherNode instanceof Node ? node.contains(otherNode) : false;
  }

  if (!(node instanceof Node) || !(otherNode instanceof Node)) {
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

type EventTargetType<T> = {
  target: T;
};

/**
 * ShadowDOM safe version of event.target.
 */
export function getEventTarget<NodeType, SE extends SyntheticEvent<NodeType>>(event: SE): SE extends EventTargetType<infer Target> ? Target : never;
export function getEventTarget(event: Event): Event['target'];
export function getEventTarget<NodeType, SE extends SyntheticEvent<NodeType>>(event: Event | SE): Event['target'] {
  if (shadowDOM() && (event.target instanceof Element) && event.target.shadowRoot) {
    if ('composedPath' in event) {
      return event.composedPath()[0] || null;
    } else if ('composedPath' in event.nativeEvent) {
      /** If Typescript types are to be strictly trusted, there is a risk 
       * that the return type of this branch doesn't match the return type of the first overload.
       * In practice, SyntheticEvents only seem to have `target: EventTarget & T` when the event
       * doesn't bubble. In that case, .composedPath()[0] and .target should always
       * be the same.
       */
      return event.nativeEvent.composedPath()[0] || null
    }
  }
  return event.target;
}
