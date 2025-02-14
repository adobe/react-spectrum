import {getActiveElement, getOwnerDocument} from '@react-aria/utils';

export function moveVirtualFocus(to: Element | null) {
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

export function dispatchVirtualBlur(from: Element, to: Element | null) {
  from.dispatchEvent(new FocusEvent('blur', {relatedTarget: to}));
  from.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget: to}));
}

export function dispatchVirtualFocus(to: Element, from: Element | null) {
  to.dispatchEvent(new FocusEvent('focus', {relatedTarget: from}));
  to.dispatchEvent(new FocusEvent('focusin', {bubbles: true, relatedTarget: from}));
}

export function getVirtuallyFocusedElement(document: Document) {
  let activeElement = getActiveElement(document);
  let activeDescendant = activeElement?.getAttribute('aria-activedescendant');
  if (activeDescendant) {
    return document.getElementById(activeDescendant) || activeElement;
  }

  return activeElement;
}
