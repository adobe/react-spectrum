import React, {useRef, useEffect, useContext} from 'react';

// import {FocusScope, useFocusScope} from 'react-events/focus-scope';
// export {FocusScope};

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

// This is a hacky DOM-based implementation of a FocusScope until this RFC lands in React:
// https://github.com/reactjs/rfcs/pull/109
// For now, it relies on the DOM tree order rather than the React tree order, and is probably
// less optimized for performance.
export function FocusScope({children}) {
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
  }, [children]);

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
  for (let node of scope) {
    res.push(...Array.from(node.querySelectorAll(opts.tabbable ? TABBABLE_ELEMENT_SELECTOR : FOCUSABLE_ELEMENT_SELECTOR)));
  }
  return res;
}
