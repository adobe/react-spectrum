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

import {createShadowTreeWalker} from '../utils/shadowdom/ShadowTreeWalker';

import {getOwnerDocument, getOwnerWindow, isShadowRoot} from '../utils/domHelpers';
import {nodeContains} from '../utils/shadowdom/DOMFunctions';
import {shadowDOM} from 'react-stately/private/flags/flags';

const supportsInert = typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;

function isAlwaysVisibleNode(node: HTMLElement | SVGElement): boolean {
  return node.dataset.liveAnnouncer === 'true' || node.dataset.reactAriaTopLayer !== undefined;
}

interface AriaHideOutsideOptions {
  root?: Element;
  shouldUseInert?: boolean;
}

type HideMark = 'inert' | 'aria-hidden';

interface HiddenState {
  // The mark each active ariaHideOutside call wants for this element, keyed by call id.
  marks: Map<number, HideMark>;
  // The element's own values from before the first call hid it, restored when no calls remain.
  ariaHidden: string | null;
  inert: boolean;
}

// Tracks every element hidden by ariaHideOutside. The mark that is actually applied is
// recomputed whenever a call adds or removes its entry: any 'inert' entry wins, otherwise
// the element gets aria-hidden="true". When no entries are left, the original values are
// put back. This lets calls that hide with inert (e.g. usePopover, useModalOverlay) and
// calls that hide with aria-hidden (e.g. useComboBox) overlap on the same element.
let hiddenStateMap = new WeakMap<Element, HiddenState>();
let nextCallId = 0;
interface ObserverWrapper {
  visibleNodes: Set<Element>;
  hiddenNodes: Set<Element>;
  observe: () => void;
  disconnect: () => void;
}
let observerStack: Array<ObserverWrapper> = [];

/**
 * Hides all elements in the DOM outside the given targets from screen readers using aria-hidden,
 * and returns a function to revert these changes. In addition, changes to the DOM are watched
 * and new elements outside the targets are automatically hidden.
 *
 * @param targets - The elements that should remain visible.
 * @param root - Nothing will be hidden above this element.
 * @returns - A function to restore all hidden elements.
 */
export function ariaHideOutside(targets: Element[], options?: AriaHideOutsideOptions | Element) {
  let windowObj = getOwnerWindow(targets?.[0]);
  let opts = options instanceof windowObj.Element ? {root: options} : options;
  let root = opts?.root ?? document.body;
  let shouldUseInert = opts?.shouldUseInert && supportsInert;
  let visibleNodes = new Set<Element>(targets);
  let hiddenNodes = new Set<Element>();

  let callId = nextCallId++;

  let getMark = (element: Element): HideMark => {
    return shouldUseInert && element instanceof windowObj.HTMLElement ? 'inert' : 'aria-hidden';
  };

  let applyHiddenState = (element: Element, state: HiddenState) => {
    let useInert =
      element instanceof windowObj.HTMLElement && [...state.marks.values()].includes('inert');
    if (useInert) {
      // inert is stronger than aria-hidden (it also blocks focus and pointer events), so it wins.
      (element as HTMLElement).inert = true;
      restoreAttribute(element, state.ariaHidden);
    } else {
      element.setAttribute('aria-hidden', 'true');
      if (element instanceof windowObj.HTMLElement) {
        element.inert = state.inert;
      }
    }
  };

  let restoreOriginal = (element: Element, state: HiddenState) => {
    restoreAttribute(element, state.ariaHidden);
    if (element instanceof windowObj.HTMLElement) {
      element.inert = state.inert;
    }
  };

  let shadowRootsToWatch = new Set<ShadowRoot>();
  if (shadowDOM()) {
    // Find all shadow roots that enclose the targets, walking up the host chain
    // until we reach the tree that `root` lives in. Each enclosing ShadowRoot
    // needs its own MutationObserver because it does not cross shadow
    // boundaries, so the observer on `root` cannot see mutations inside them.
    let boundary = root.getRootNode();
    for (let target of targets) {
      let current = target.getRootNode();
      while (isShadowRoot(current) && current !== boundary) {
        shadowRootsToWatch.add(current);
        current = current.host.getRootNode();
      }
    }
  }

  let walk = (root: Element) => {
    // Keep live announcer and top layer elements (e.g. toasts) visible.
    for (let element of root.querySelectorAll(
      '[data-live-announcer], [data-react-aria-top-layer]'
    )) {
      visibleNodes.add(element);
    }

    let acceptNode = (node: Element) => {
      // Skip this node and its children if it is one of the target nodes, or a live announcer.
      // Also skip children of already hidden nodes, as aria-hidden is recursive. An exception is
      // made for elements with role="row" since VoiceOver on iOS has issues hiding elements with role="row".
      // For that case we want to hide the cells inside as well (https://bugs.webkit.org/show_bug.cgi?id=222623).
      if (
        hiddenNodes.has(node) ||
        visibleNodes.has(node) ||
        (node.parentElement &&
          hiddenNodes.has(node.parentElement) &&
          node.parentElement.getAttribute('role') !== 'row')
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      // Skip this node but continue to children if one of the targets is inside the node.
      for (let target of visibleNodes) {
        if (nodeContains(node, target)) {
          return NodeFilter.FILTER_SKIP;
        }
      }

      return NodeFilter.FILTER_ACCEPT;
    };

    let walker = createShadowTreeWalker(getOwnerDocument(root), root, NodeFilter.SHOW_ELEMENT, {
      acceptNode
    });

    // TreeWalker does not include the root.
    let acceptRoot = acceptNode(root);
    if (acceptRoot === NodeFilter.FILTER_ACCEPT) {
      hide(root);
    }

    if (acceptRoot !== NodeFilter.FILTER_REJECT) {
      let node = walker.nextNode() as Element;
      while (node != null) {
        hide(node);
        node = walker.nextNode() as Element;
      }
    }
  };

  let hide = (node: Element) => {
    let mark = getMark(node);
    let state = hiddenStateMap.get(node);
    if (!state) {
      // If the element was already hidden by the app with the mark this call would use,
      // there's nothing for us to do. An element the app only set aria-hidden on still
      // gets inert from an inert call, so it can't take focus behind a modal.
      let alreadyHidden =
        mark === 'inert'
          ? (node as HTMLElement).inert
          : node.getAttribute('aria-hidden') === 'true';
      if (alreadyHidden) {
        return;
      }

      state = {
        marks: new Map(),
        ariaHidden: node.getAttribute('aria-hidden'),
        inert: node instanceof windowObj.HTMLElement ? node.inert : false
      };
      hiddenStateMap.set(node, state);
    }

    state.marks.set(callId, mark);
    hiddenNodes.add(node);
    applyHiddenState(node, state);
  };

  // If there is already a MutationObserver listening from a previous call,
  // disconnect it so the new on takes over.
  if (observerStack.length) {
    observerStack[observerStack.length - 1].disconnect();
  }

  walk(root);

  let observer = new MutationObserver(changes => {
    for (let change of changes) {
      if (change.type !== 'childList') {
        continue;
      }

      // If the parent element of the added nodes is not within one of the targets,
      // and not already inside a hidden node, hide all of the new children.
      if (
        change.target.isConnected &&
        ![...visibleNodes, ...hiddenNodes].some(node => nodeContains(node, change.target))
      ) {
        for (let node of change.addedNodes) {
          if (
            (node instanceof HTMLElement || node instanceof SVGElement) &&
            isAlwaysVisibleNode(node)
          ) {
            visibleNodes.add(node);
          } else if (node instanceof Element) {
            walk(node);
          }
        }
      }

      if (shadowDOM()) {
        // if any of the observed shadow roots were removed, stop observing them
        for (let shadowRoot of shadowRootsToWatch) {
          if (!shadowRoot.isConnected) {
            observer.disconnect();
            break;
          }
        }
      }
    }
  });

  observer.observe(root, {childList: true, subtree: true});
  let shadowObservers = new Set<MutationObserver>();
  if (shadowDOM()) {
    for (let shadowRoot of shadowRootsToWatch) {
      // Disconnect single target instead of all https://github.com/whatwg/dom/issues/126
      let shadowObserver = new MutationObserver(changes => {
        for (let change of changes) {
          if (change.type !== 'childList') {
            continue;
          }

          // If the parent element of the added nodes is not within one of the targets,
          // and not already inside a hidden node, hide all of the new children.
          if (
            change.target.isConnected &&
            ![...visibleNodes, ...hiddenNodes].some(node => nodeContains(node, change.target))
          ) {
            for (let node of change.addedNodes) {
              if (
                (node instanceof HTMLElement || node instanceof SVGElement) &&
                isAlwaysVisibleNode(node)
              ) {
                visibleNodes.add(node);
              } else if (node instanceof Element) {
                walk(node);
              }
            }
          }

          if (shadowDOM()) {
            // if any of the observed shadow roots were removed, stop observing them
            for (let shadowRoot of shadowRootsToWatch) {
              if (!shadowRoot.isConnected) {
                observer.disconnect();
                break;
              }
            }
          }
        }
      });
      shadowObserver.observe(shadowRoot, {childList: true, subtree: true});
      shadowObservers.add(shadowObserver);
    }
  }

  let observerWrapper: ObserverWrapper = {
    visibleNodes,
    hiddenNodes,
    observe() {
      observer.observe(root, {childList: true, subtree: true});
    },
    disconnect() {
      observer.disconnect();
    }
  };

  observerStack.push(observerWrapper);

  return (): void => {
    observer.disconnect();
    if (shadowDOM()) {
      for (let shadowObserver of shadowObservers) {
        shadowObserver.disconnect();
      }
    }

    for (let node of hiddenNodes) {
      let state = hiddenStateMap.get(node);
      if (!state || !state.marks.delete(callId)) {
        continue;
      }

      if (state.marks.size === 0) {
        restoreOriginal(node, state);
        hiddenStateMap.delete(node);
      } else {
        applyHiddenState(node, state);
      }
    }

    // Remove this observer from the stack, and start the previous one.
    if (observerWrapper === observerStack[observerStack.length - 1]) {
      observerStack.pop();
      if (observerStack.length) {
        observerStack[observerStack.length - 1].observe();
      }
    } else {
      observerStack.splice(observerStack.indexOf(observerWrapper), 1);
    }
  };
}

function restoreAttribute(element: Element, value: string | null) {
  if (value == null) {
    element.removeAttribute('aria-hidden');
  } else {
    element.setAttribute('aria-hidden', value);
  }
}

export function keepVisible(element: Element): (() => void) | undefined {
  let observer = observerStack[observerStack.length - 1];
  if (observer && !observer.visibleNodes.has(element)) {
    observer.visibleNodes.add(element);
    return () => {
      observer.visibleNodes.delete(element);
    };
  }
}
