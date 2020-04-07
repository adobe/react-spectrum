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

import {focusWithoutScrolling} from '@react-aria/utils';
import React, {ReactNode, RefObject, useContext, useEffect, useLayoutEffect, useRef} from 'react';

// import {FocusScope, useFocusScope} from 'react-events/focus-scope';
// export {FocusScope};

interface FocusScopeProps {
  children: ReactNode,
  contain?: boolean,
  restoreFocus?: boolean,
  autoFocus?: boolean
}

interface FocusManagerOptions {
  from?: HTMLElement,
  tabbable?: boolean,
  wrap?: boolean
}

interface FocusManager {
  focusNext(opts?: FocusManagerOptions): HTMLElement,
  focusPrevious(opts?: FocusManagerOptions): HTMLElement
}

const FocusContext = React.createContext<FocusManager>(null);

let activeScope: RefObject<HTMLElement[]> = null;
let scopes: Set<RefObject<HTMLElement[]>> = new Set();

// This is a hacky DOM-based implementation of a FocusScope until this RFC lands in React:
// https://github.com/reactjs/rfcs/pull/109
// For now, it relies on the DOM tree order rather than the React tree order, and is probably
// less optimized for performance.
export function FocusScope(props: FocusScopeProps) {
  let {children, contain, restoreFocus, autoFocus} = props;
  let startRef = useRef<HTMLSpanElement>();
  let endRef = useRef<HTMLSpanElement>();
  let scopeRef = useRef<HTMLElement[]>([]);

  useLayoutEffect(() => {
    // Find all rendered nodes between the sentinels and add them to the scope.
    let node = startRef.current.nextSibling;
    let nodes = [];
    while (node && node !== endRef.current) {
      nodes.push(node);
      node = node.nextSibling;
    }

    scopeRef.current = nodes;
    scopes.add(scopeRef);
    return () => {
      scopes.delete(scopeRef);
    };
  }, [children]);

  useFocusContainment(scopeRef, contain);
  useRestoreFocus(scopeRef, restoreFocus, contain);
  useAutoFocus(scopeRef, autoFocus);

  let focusManager = createFocusManager(scopeRef);

  return (
    <FocusContext.Provider value={focusManager}>
      <span hidden ref={startRef} />
      {children}
      <span hidden ref={endRef} />
    </FocusContext.Provider>
  );
}

export function useFocusManager() {
  return useContext(FocusContext);
}

function createFocusManager(scopeRef: React.RefObject<HTMLElement[]>): FocusManager {
  return {
    focusNext(opts: FocusManagerOptions = {}) {
      let node = opts.from || document.activeElement;
      let focusable = getFocusableElementsInScope(scopeRef.current, opts);
      let nextNode = focusable.find(n =>
        !!(node.compareDocumentPosition(n) & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY))
      );
      if (!nextNode && opts.wrap) {
        nextNode = focusable[0];
      }
      if (nextNode) {
        nextNode.focus();
      }
      return nextNode;
    },
    focusPrevious(opts: FocusManagerOptions = {}) {
      let node = opts.from || document.activeElement;
      let focusable = getFocusableElementsInScope(scopeRef.current, opts).reverse();
      let previousNode = focusable.find(n =>
        !!(node.compareDocumentPosition(n) & (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINED_BY))
      );
      if (!previousNode && opts.wrap) {
        previousNode = focusable[0];
      }
      if (previousNode) {
        previousNode.focus();
      }
      return previousNode;
    }
  };
}

const focusableElements = [
  'input:not([disabled]):not([type=hidden])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  'area[href]',
  'summary',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]'
];

const FOCUSABLE_ELEMENT_SELECTOR = focusableElements.join(',') + ',[tabindex]';

focusableElements.push('[tabindex]:not([tabindex="-1"])');
const TABBABLE_ELEMENT_SELECTOR = focusableElements.join(':not([tabindex="-1"]),');

function getFocusableElementsInScope(scope: HTMLElement[], opts: FocusManagerOptions): HTMLElement[] {
  let res = [];
  let selector = opts.tabbable ? TABBABLE_ELEMENT_SELECTOR : FOCUSABLE_ELEMENT_SELECTOR;
  for (let node of scope) {
    if (node.matches(selector)) {
      res.push(node);
    }
    res.push(...Array.from(node.querySelectorAll(selector)));
  }

  return res.filter(node => node.offsetParent !== null);
}

function useFocusContainment(scopeRef: RefObject<HTMLElement[]>, contain: boolean) {
  let focusedNode = useRef<HTMLElement>();

  useEffect(() => {
    let scope = scopeRef.current;
    if (!contain) {
      return;
    }

    // Handle the Tab key to contain focus within the scope
    let onKeyDown = (e) => {
      if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      let focusedElement = document.activeElement as HTMLElement;
      if (!isElementInScope(focusedElement, scope)) {
        return;
      }

      let elements = getFocusableElementsInScope(scope, {tabbable: true});
      let position = elements.indexOf(focusedElement);
      let lastPosition = elements.length - 1;
      let nextElement = null;

      if (e.shiftKey) {
        if (position <= 0) {
          nextElement = elements[lastPosition];
        } else {
          nextElement = elements[position - 1];
        }
      } else {
        if (position === lastPosition) {
          nextElement = elements[0];
        } else {
          nextElement = elements[position + 1];
        }
      }

      e.preventDefault();
      if (nextElement) {
        focusElement(nextElement);
      }
    };

    let onFocus = (e) => {
      // If a focus event occurs outside the active scope (e.g. user tabs from browser location bar),
      // restore focus to the previously focused node or the first tabbable element in the active scope.
      let isInAnyScope = isElementInAnyScope(e.target, scopes);
      if (!isInAnyScope) {
        if (focusedNode.current) {
          focusedNode.current.focus();
        } else if (activeScope) {
          focusFirstInScope(activeScope.current);
        } 
      } else {
        e.stopPropagation();
        activeScope = scopeRef;
        focusedNode.current = e.target;
      }
    };

    let onBlur = (e) => {
      e.stopPropagation();
      let isInAnyScope = isElementInAnyScope(e.relatedTarget, scopes);

      if (!isInAnyScope) {
        activeScope = scopeRef;
        focusedNode.current = e.target;
        // Firefox doesn't shift focus back to the Dialog properly without this 
        requestAnimationFrame(() => {
          focusedNode.current.focus();
        });
      }
    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('focusin', onFocus, false);
    scope.forEach(element => element.addEventListener('focusin', onFocus, false));
    scope.forEach(element => element.addEventListener('focusout', onBlur, false));
    return () => {
      document.removeEventListener('keydown', onKeyDown, false);
      document.removeEventListener('focusin', onFocus, false);
      scope.forEach(element => element.removeEventListener('focusin', onFocus, false));
      scope.forEach(element => element.removeEventListener('focusout', onBlur, false));
    };
  }, [scopeRef, contain]);
}

function isElementInAnyScope(element: Element, scopes: Set<RefObject<HTMLElement[]>>) {
  for (let scope of scopes.values()) {
    if (isElementInScope(element, scope.current)) { 
      return true; 
    }
  }  
  return false;
}

function isElementInScope(element: Element, scope: HTMLElement[]) {
  return scope.some(node => node.contains(element));
}

function focusElement(element: HTMLElement | null) {
  if (element != null) {
    try {
      focusWithoutScrolling(element);
    } catch (err) {
      // ignore
    }
  }
}

function focusFirstInScope(scope: HTMLElement[]) {
  let elements = getFocusableElementsInScope(scope, {tabbable: true});
  focusElement(elements[0]);
}

function useAutoFocus(scopeRef: RefObject<HTMLElement[]>, autoFocus: boolean) {
  useEffect(() => {
    if (autoFocus) {
      activeScope = scopeRef;
      if (!isElementInScope(document.activeElement, activeScope.current)) {
        focusFirstInScope(scopeRef.current);
      }
    }
  }, [scopeRef, autoFocus]);
}

function useRestoreFocus(scopeRef: RefObject<HTMLElement[]>, restoreFocus: boolean, contain: boolean) {
  // useLayoutEffect instead of useEffect so the active element is saved synchronously instead of asynchronously.
  useLayoutEffect(() => {
    let scope = scopeRef.current;
    let nodeToRestore = document.activeElement as HTMLElement;

    // Handle the Tab key so that tabbing out of the scope goes to the next element
    // after the node that had focus when the scope mounted. This is important when
    // using portals for overlays, so that focus goes to the expected element when
    // tabbing out of the overlay.
    let onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      let focusedElement = document.activeElement as HTMLElement;
      if (!isElementInScope(focusedElement, scope)) {
        return;
      }

      // Create a DOM tree walker that matches all tabbable elements
      let walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode(node) {
            if ((node as HTMLElement).matches(TABBABLE_ELEMENT_SELECTOR)) {
              return NodeFilter.FILTER_ACCEPT;
            }

            return NodeFilter.FILTER_SKIP;
          }
        },
        false
      );

      // Find the next tabbable element after the currently focused element
      walker.currentNode = focusedElement;
      let nextElement = (e.shiftKey ? walker.previousNode() : walker.nextNode()) as HTMLElement;

      // If there is no next element, or it is outside the current scope, move focus to the
      // next element after the node to restore to instead.
      if ((!nextElement || !isElementInScope(nextElement, scope)) && nodeToRestore) {
        walker.currentNode = nodeToRestore;
        nextElement = (e.shiftKey ? walker.previousNode() : walker.nextNode()) as HTMLElement;

        e.preventDefault();
        if (nextElement) {
          nextElement.focus();
        } else {
          // If there is no next element, blur the focused element to move focus to the body.
          focusedElement.blur();
        }
      }
    };

    if (!contain) {
      document.addEventListener('keydown', onKeyDown, false);
    }

    return () => {
      if (!contain) {
        document.removeEventListener('keydown', onKeyDown, false);
      }

      if (restoreFocus && nodeToRestore && isElementInScope(document.activeElement, scope)) {
        requestAnimationFrame(() => {
          if (document.body.contains(nodeToRestore)) {
            focusElement(nodeToRestore);
          }
        });
      }
    };
  }, [scopeRef, restoreFocus, contain]);
}
