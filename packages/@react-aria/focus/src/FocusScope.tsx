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

  useEffect(() => {
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
  useRestoreFocus(restoreFocus);
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

export const FOCUSABLE_ELEMENT_SELECTOR = focusableElements.join(',') + ',[tabindex]';

focusableElements.push('[tabindex]:not([tabindex="-1"])');
export const TABBABLE_ELEMENT_SELECTOR = focusableElements.join(':not([tabindex="-1"]),');

function getFocusableElementsInScope(scope: HTMLElement[], opts: FocusManagerOptions): HTMLElement[] {
  let res = [];
  let selector = opts.tabbable ? TABBABLE_ELEMENT_SELECTOR : FOCUSABLE_ELEMENT_SELECTOR;
  for (let node of scope) {
    if (node.matches(selector)) {
      res.push(node);
    }
    res.push(...Array.from(node.querySelectorAll(selector)));
  }
  return res;
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
        focusedNode.current.focus();
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
      element.focus({preventScroll: true});
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

function useRestoreFocus(restoreFocus: boolean) {
  // useLayoutEffect instead of useEffect so the active element is saved synchronously instead of asynchronously.
  useLayoutEffect(() => {
    let nodeToRestore = document.activeElement as HTMLElement;
    return () => {
      if (restoreFocus && nodeToRestore) {
        requestAnimationFrame(() => {
          if (document.body.contains(nodeToRestore)) {
            focusElement(nodeToRestore);
          }
        });
      }
    };
  }, [restoreFocus]);
}
