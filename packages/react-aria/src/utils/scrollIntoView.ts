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

import {getScrollParents} from './getScrollParents';
import {isIOS} from './platform';

interface ScrollIntoViewOpts {
  /** The position to align items along the block axis in. */
  block?: ScrollLogicalPosition;
  /** The position to align items along the inline axis in. */
  inline?: ScrollLogicalPosition;
}

interface ScrollIntoViewportOpts {
  /** The optional containing element of the target to be centered in the viewport. */
  containingElement?: Element | null;
}

// Helper function to check if the element is an instance of HTMLElement or SVGElement
function isRenderElement(el: unknown): el is HTMLElement | SVGElement {
  return el instanceof HTMLElement || el instanceof SVGElement;
}

// Shadow DOM compatible contains utility running purely on baseline loops to satisfy strict lint setups
function safeContains(parent: Element, child: Node): boolean {
  let current: Node | null = child;
  while (current) {
    if (current === parent) {
      return true;
    }
    const root = current.getRootNode?.();
    if (root instanceof ShadowRoot) {
      current = root.host;
    } else {
      current = current.parentNode;
    }
  }
  return false;
}

// Helper to determine if a containing element is fully within an ancestor wrapper's bounds
function isContainerObscured(containerRect: DOMRect, parent: Element): boolean {
  if (
    parent === document.body ||
    parent === document.documentElement ||
    parent === document.scrollingElement
  ) {
    return false;
  }

  if (!isRenderElement(parent)) {
    return false;
  }

  const parentRect = parent.getBoundingClientRect();
  return (
    containerRect.top < parentRect.top ||
    containerRect.left < parentRect.left ||
    containerRect.bottom > parentRect.bottom ||
    containerRect.right > parentRect.right
  );
}

// Check ancestry chain for any container boundaries clipping visibility without exceeding max-depth limits
function checkAncestorsObscureContainer(
  containingElement: Element,
  containerRect: DOMRect
): boolean {
  let containerParents = getScrollParents(containingElement, true);
  for (let parent of containerParents) {
    if (isContainerObscured(containerRect, parent as Element)) {
      return true;
    }
  }
  return false;
}

// Extracted utility to shift parents smoothly while avoiding max-depth nesting limits
function scrollContainerParents(containingElement: Element): void {
  let parentParents = getScrollParents(containingElement, true);
  for (let parent of parentParents) {
    if (
      parent !== document.body &&
      parent !== document.documentElement &&
      parent !== document.scrollingElement &&
      isRenderElement(parent)
    ) {
      scrollIntoView(parent as HTMLElement, containingElement as HTMLElement, {
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }
}

/**
 * Scrolls `scrollView` so that `element` is visible.
 * Similar to `element.scrollIntoView({block: 'nearest'})` (not supported in Edge),
 * but doesn't affect parents above `scrollView`.
 */
export function scrollIntoView(
  scrollView: HTMLElement,
  element: HTMLElement,
  opts: ScrollIntoViewOpts = {}
): void {
  let {block = 'nearest', inline = 'nearest'} = opts;

  if (scrollView === element) {
    return;
  }

  let y = scrollView.scrollTop;
  let x = scrollView.scrollLeft;

  let target = element.getBoundingClientRect();
  let view = scrollView.getBoundingClientRect();
  let itemStyle = window.getComputedStyle(element);
  let viewStyle = window.getComputedStyle(scrollView);
  let root = document.scrollingElement || document.documentElement;
  let isRoot = scrollView === root;

  let viewTop = scrollView === root ? 0 : view.top;
  let viewBottom = scrollView === root ? scrollView.clientHeight : view.bottom;
  let viewLeft = scrollView === root ? 0 : view.left;
  let viewRight = scrollView === root ? scrollView.clientWidth : view.right;

  let scrollMarginTop = parseFloat(itemStyle.scrollMarginTop) || 0;
  let scrollMarginBottom = parseFloat(itemStyle.scrollMarginBottom) || 0;
  let scrollMarginLeft = parseFloat(itemStyle.scrollMarginLeft) || 0;
  let scrollMarginRight = parseFloat(itemStyle.scrollMarginRight) || 0;

  let scrollPaddingTop = parseFloat(viewStyle.scrollPaddingTop) || 0;
  let scrollPaddingBottom = parseFloat(viewStyle.scrollPaddingBottom) || 0;
  let scrollPaddingLeft = parseFloat(viewStyle.scrollPaddingLeft) || 0;
  let scrollPaddingRight = parseFloat(viewStyle.scrollPaddingRight) || 0;

  let borderTopWidth = parseFloat(viewStyle.borderTopWidth) || 0;
  let borderBottomWidth = parseFloat(viewStyle.borderBottomWidth) || 0;
  let borderLeftWidth = parseFloat(viewStyle.borderLeftWidth) || 0;
  let borderRightWidth = parseFloat(viewStyle.borderRightWidth) || 0;

  let scrollAreaTop = target.top - scrollMarginTop;
  let scrollAreaBottom = target.bottom + scrollMarginBottom;
  let scrollAreaLeft = target.left - scrollMarginLeft;
  let scrollAreaRight = target.right + scrollMarginRight;

  let scrollBarOffsetX = scrollView === root ? 0 : borderLeftWidth + borderRightWidth;
  let scrollBarOffsetY = scrollView === root ? 0 : borderTopWidth + borderBottomWidth;
  let scrollBarWidth =
    scrollView === root ? 0 : scrollView.offsetWidth - scrollView.clientWidth - scrollBarOffsetX;
  let scrollBarHeight =
    scrollView === root ? 0 : scrollView.offsetHeight - scrollView.clientHeight - scrollBarOffsetY;

  let scrollPortTop = viewTop + (isRoot ? 0 : borderTopWidth) + scrollPaddingTop;
  let scrollPortBottom =
    viewBottom - (isRoot ? 0 : borderBottomWidth) - scrollPaddingBottom - scrollBarHeight;
  let scrollPortLeft = viewLeft + (isRoot ? 0 : borderLeftWidth) + scrollPaddingLeft;
  let scrollPortRight = viewRight - (isRoot ? 0 : borderRightWidth) - scrollPaddingRight;

  // IOS always positions the scrollbar on the right ¯\_(ツ)_/¯
  if (viewStyle.direction === 'rtl' && !isIOS()) {
    scrollPortLeft += scrollBarWidth;
  } else {
    scrollPortRight -= scrollBarWidth;
  }

  let shouldScrollBlock = scrollAreaTop < scrollPortTop || scrollAreaBottom > scrollPortBottom;
  let shouldScrollInline = scrollAreaLeft < scrollPortLeft || scrollAreaRight > scrollPortRight;

  if (shouldScrollBlock && block === 'start') {
    y += scrollAreaTop - scrollPortTop;
  } else if (shouldScrollBlock && block === 'center') {
    y += (scrollAreaTop + scrollAreaBottom) / 2 - (scrollPortTop + scrollPortBottom) / 2;
  } else if (shouldScrollBlock && block === 'end') {
    y += scrollAreaBottom - scrollPortBottom;
  } else if (shouldScrollBlock && block === 'nearest') {
    let start = scrollAreaTop - scrollPortTop;
    let end = scrollAreaBottom - scrollPortBottom;
    y += Math.abs(start) <= Math.abs(end) ? start : end;
  }

  if (shouldScrollInline && inline === 'start') {
    x += scrollAreaLeft - scrollPortLeft;
  } else if (shouldScrollInline && inline === 'center') {
    x += (scrollAreaLeft + scrollAreaRight) / 2 - (scrollPortLeft + scrollPortRight) / 2;
  } else if (shouldScrollInline && inline === 'end') {
    x += scrollAreaRight - scrollPortRight;
  } else if (shouldScrollInline && inline === 'nearest') {
    let start = scrollAreaLeft - scrollPortLeft;
    let end = scrollAreaRight - scrollPortRight;
    x += Math.abs(start) <= Math.abs(end) ? start : end;
  }

  if (process.env.NODE_ENV === 'test') {
    scrollView.scrollLeft = x;
    scrollView.scrollTop = y;
    return;
  }

  scrollView.scrollTo({left: x, top: y});
}

/**
 * Scrolls the `targetElement` so it is visible in the viewport. Accepts an optional
 * `opts.containingElement` that will be checked prior to scrolling the
 * targetElement into view. If scrolling is prevented on the body (e.g. targetElement is in a
 * popover), this will only scroll the scroll parents of the targetElement up to but not including
 * the body itself.
 */
export function scrollIntoViewport(
  targetElement: Element | null,
  opts: ScrollIntoViewportOpts = {}
): void {
  let {containingElement} = opts;
  if (!targetElement || !targetElement.isConnected) {
    return;
  }

  let root = document.scrollingElement || document.documentElement;
  let isScrollPrevented = window.getComputedStyle(root).overflow === 'hidden';

  if (!isScrollPrevented) {
    // Step 1: Handle internal scroll parents up to but not exceeding the container boundary
    let scrollParents = getScrollParents(targetElement, true);
    for (let scrollParent of scrollParents) {
      if (containingElement && !safeContains(containingElement, scrollParent)) {
        continue;
      }
      scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement, {
        block: 'nearest',
        inline: 'nearest'
      });
    }

    // Step 2: TRUE scrollIntoViewIfNeeded Approach
    if (containingElement) {
      let containerRect = containingElement.getBoundingClientRect();
      let targetRect = targetElement.getBoundingClientRect();

      let isTargetVisibleInContainer =
        targetRect.top >= containerRect.top &&
        targetRect.bottom <= containerRect.bottom &&
        targetRect.left >= containerRect.left &&
        targetRect.right <= containerRect.right;

      if (isTargetVisibleInContainer) {
        if (checkAncestorsObscureContainer(containingElement, containerRect)) {
          scrollContainerParents(containingElement);
        }

        // Return early to completely bypass and stop competing browser shifts!
        return;
      }
    }

    // Step 3: Fallback standard alignment ONLY if the row was hidden/out of view
    targetElement.scrollIntoView?.({block: 'nearest'});
  } else {
    // Isolated popup/modal overlay path
    let scrollParents = getScrollParents(targetElement, true);
    for (let scrollParent of scrollParents) {
      scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement, {
        block: 'nearest',
        inline: 'nearest'
      });
    }

    if (containingElement) {
      let containerParents = getScrollParents(containingElement, true);
      for (let parent of containerParents) {
        scrollIntoView(parent as HTMLElement, containingElement as HTMLElement, {
          block: 'nearest',
          inline: 'nearest'
        });
      }
      for (let scrollParent of getScrollParents(targetElement, true)) {
        scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement, {
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }
}
