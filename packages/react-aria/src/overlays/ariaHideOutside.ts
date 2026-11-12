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
import {getOwnerDocument, getOwnerWindow} from '../utils/domHelpers';
import {getParentElement, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {isShadowRoot} from '../utils/typeHelpers';
import {shadowDOM} from 'react-stately/private/flags/flags';

const supportsInert = typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;

function isAlwaysVisibleNode(node: HTMLElement | SVGElement): boolean {
  return node.dataset.liveAnnouncer === 'true' || node.dataset.reactAriaTopLayer !== undefined;
}

interface AriaHideOutsideOptions {
  root?: Element;
  shouldUseInert?: boolean;
}

type HideChannel = 'aria-hidden' | 'inert';

interface HiddenState {
  // The channel each active ariaHideOutside call (by id) hides this element with.
  calls: Map<number, HideChannel>;
  // The mark currently applied to the element, if any.
  applied: HideChannel | null;
  // The element's values before it was first hidden, restored once no call hides it.
  ariaHidden: string | null;
  inert: boolean;
}

// Tracks elements hidden by ariaHideOutside across concurrent calls, which may use different
// channels. Inert wins while any call uses it; otherwise aria-hidden is applied.
let hiddenStates = new WeakMap<Element, HiddenState>();
let nextCallId = 0;

function updateHidden(element: Element, state: HiddenState) {
  let channel: HideChannel | null = null;
  for (let callChannel of state.calls.values()) {
    channel = callChannel;
    if (channel === 'inert') {
      break;
    }
  }

  if (channel === state.applied) {
    return;
  }

  // Only undo the mark that was applied. The other one is left as the app has it.
  if (state.applied === 'inert') {
    (element as HTMLElement).inert = state.inert;
  } else if (state.applied === 'aria-hidden') {
    if (state.ariaHidden == null) {
      element.removeAttribute('aria-hidden');
    } else {
      element.setAttribute('aria-hidden', state.ariaHidden);
    }
  }

  if (channel === 'inert') {
    (element as HTMLElement).inert = true;
  } else if (channel === 'aria-hidden') {
    element.setAttribute('aria-hidden', 'true');
  }

  state.applied = channel;
  if (channel == null) {
    hiddenStates.delete(element);
  }
}

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
      let parentElement = getParentElement(node);
      if (
        hiddenNodes.has(node) ||
        visibleNodes.has(node) ||
        (parentElement &&
          hiddenNodes.has(parentElement) &&
          parentElement.getAttribute('role') !== 'row')
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
    let channel: HideChannel =
      shouldUseInert && node instanceof windowObj.HTMLElement ? 'inert' : 'aria-hidden';
    let state = hiddenStates.get(node);
    if (!state) {
      // If the app already hid this element with the same mark, there's nothing for us to do.
      let isHidden =
        channel === 'inert'
          ? (node as HTMLElement).inert
          : node.getAttribute('aria-hidden') === 'true';
      if (isHidden) {
        return;
      }

      state = {
        calls: new Map(),
        applied: null,
        ariaHidden: node.getAttribute('aria-hidden'),
        inert: Boolean((node as HTMLElement).inert)
      };
      hiddenStates.set(node, state);
    }

    state.calls.set(callId, channel);
    updateHidden(node, state);
    hiddenNodes.add(node);
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
      let state = hiddenStates.get(node);
      if (state?.calls.delete(callId)) {
        updateHidden(node, state);
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

export function keepVisible(element: Element): (() => void) | undefined {
  let observer = observerStack[observerStack.length - 1];
  if (observer && !observer.visibleNodes.has(element)) {
    observer.visibleNodes.add(element);
    return () => {
      observer.visibleNodes.delete(element);
    };
  }
}
