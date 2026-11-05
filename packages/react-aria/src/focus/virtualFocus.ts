import {getActiveElement} from '../utils/shadowdom/DOMFunctions';
import {getOwnerDocument} from '../utils/domHelpers';
import {shadowDOM} from 'react-stately/private/flags/flags';

export function moveVirtualFocus(to: Element | null): void {
  let from = getVirtuallyFocusedElement(getOwnerDocument(to));
  if (from !== to) {
    if (from) {
      dispatchVirtualBlur(from, to);
    }
    if (to) {
      dispatchVirtualFocus(to, from);
    }
  }
}

export function dispatchVirtualBlur(from: Element, to: Element | null): void {
  from.dispatchEvent(createFocusEvent('blur', {relatedTarget: to}));
  from.dispatchEvent(createFocusEvent('focusout', {bubbles: true, relatedTarget: to}));
}

export function dispatchVirtualFocus(to: Element, from: Element | null): void {
  to.dispatchEvent(createFocusEvent('focus', {relatedTarget: from}));
  to.dispatchEvent(createFocusEvent('focusin', {bubbles: true, relatedTarget: from}));
}

export function getVirtuallyFocusedElement(document: Document): Element | null {
  let activeElement = getActiveElement(document);
  let activeDescendant = activeElement?.getAttribute('aria-activedescendant');
  if (activeDescendant) {
    return document.getElementById(activeDescendant) || activeElement;
  }

  return activeElement;
}

let originalRelatedTargetMap: WeakMap<FocusEvent, EventTarget> | null = null;
function createFocusEvent(type: string, eventInitDict?: FocusEventInit) {
  const event = new FocusEvent(type, eventInitDict);
  if (shadowDOM()) {
    originalRelatedTargetMap ??= new WeakMap();
    const relatedTarget = event.relatedTarget;
    if (relatedTarget !== null) {
      originalRelatedTargetMap.set(event, relatedTarget);
    }
  }
  return event;
}

export function getOriginalRelatedTarget(event: FocusEvent): EventTarget | null {
  if (!shadowDOM()) {
    return event.relatedTarget;
  }
  return originalRelatedTargetMap?.get(event) ?? event.relatedTarget;
}
