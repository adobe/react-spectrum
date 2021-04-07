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

// Keeps a ref count of all hidden elements. Added to when hiding an element, and
// subtracted from when showing it again. When it reaches zero, aria-hidden is removed.
let refCountMap = new WeakMap<Element, number>();

/**
 * Hides all elements in the DOM outside the given targets from screen readers using aria-hidden,
 * and returns a function to revert these changes. In addition, changes to the DOM are watched
 * and new elements outside the targets are automatically hidden.
 * @param targets - The elements that should remain visible.
 * @param root - Nothing will be hidden above this element.
 * @returns - A function to restore all hidden elements.
 */
export function ariaHideOutside(targets: HTMLElement[], root = document.body) {
  let visibleNodes = new Set<Element>(targets);
  let hiddenNodes = new Set<Element>();
  let walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        // If this node is a live announcer, add it to the set of nodes to keep visible.
        if ((node instanceof HTMLElement && node.dataset.liveAnnouncer === 'true')) {
          visibleNodes.add(node);
        }

        // Skip this node and its children if it is one of the target nodes, or a live announcer.
        // Also skip children of already hidden nodes, as aria-hidden is recursive.
        if (
          visibleNodes.has(node as Element) ||
          hiddenNodes.has(node.parentElement)
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        // VoiceOver on iOS has issues hiding elements with role="row". Hide the cells inside instead.
        // https://bugs.webkit.org/show_bug.cgi?id=222623
        if (node instanceof HTMLElement && node.getAttribute('role') === 'row') {
          return NodeFilter.FILTER_SKIP;
        }

        // Skip this node but continue to children if one of the targets is inside the node.
        if (targets.some(target => node.contains(target))) {
          return NodeFilter.FILTER_SKIP;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let hide = (node: Element) => {
    let refCount = refCountMap.get(node) ?? 0;

    // If already aria-hidden, and the ref count is zero, then this element
    // was already hidden and there's nothing for us to do.
    if (node.getAttribute('aria-hidden') === 'true' && refCount === 0) {
      return;
    }

    if (refCount === 0) {
      node.setAttribute('aria-hidden', 'true');
    }

    hiddenNodes.add(node);
    refCountMap.set(node, refCount + 1);
  };

  let node = walker.nextNode() as Element;
  while (node != null) {
    hide(node);
    node = walker.nextNode() as Element;
  }

  let observer = new MutationObserver(changes => {
    for (let change of changes) {
      if (change.type !== 'childList' || change.addedNodes.length === 0) {
        continue;
      }

      // If the parent element of the added nodes is not within one of the targets,
      // and not already inside a hidden node, hide all of the new children.
      if (![...visibleNodes, ...hiddenNodes].some(node => node.contains(change.target))) {
        for (let node of change.addedNodes) {
          if ((node instanceof HTMLElement && node.dataset.liveAnnouncer === 'true')) {
            visibleNodes.add(node);
          } else if (node instanceof Element) {
            hide(node);
          }
        }
      }
    }
  });

  observer.observe(root, {childList: true, subtree: true});

  return () => {
    observer.disconnect();

    for (let node of hiddenNodes) {
      let count = refCountMap.get(node);
      if (count === 1) {
        node.removeAttribute('aria-hidden');
        refCountMap.delete(node);
      } else {
        refCountMap.set(node, count - 1);
      }
    }
  };
}
