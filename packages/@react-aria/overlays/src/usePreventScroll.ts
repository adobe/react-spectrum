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

import {chain, getScrollParent, isIOS, useLayoutEffect, willOpenKeyboard} from '@react-aria/utils';

interface PreventScrollOptions {
  /** Whether the scroll lock is disabled. */
  isDisabled?: boolean
}

const visualViewport = typeof document !== 'undefined' && window.visualViewport;

// The number of active usePreventScroll calls. Used to determine whether to revert back to the original page style/scroll position
let preventScrollCount = 0;
let restore;

/**
 * Prevents scrolling on the document body on mount, and
 * restores it on unmount. Also ensures that content does not
 * shift due to the scrollbars disappearing.
 */
export function usePreventScroll(options: PreventScrollOptions = {}): void {
  let {isDisabled} = options;

  useLayoutEffect(() => {
    if (isDisabled) {
      return;
    }

    preventScrollCount++;
    if (preventScrollCount === 1) {
      if (isIOS()) {
        restore = preventScrollMobileSafari();
      } else {
        restore = preventScrollStandard();
      }
    }

    return () => {
      preventScrollCount--;
      if (preventScrollCount === 0) {
        restore();
      }
    };
  }, [isDisabled]);
}

// For most browsers, all we need to do is set `overflow: hidden` on the root element, and
// add some padding to prevent the page from shifting when the scrollbar is hidden.
function preventScrollStandard() {
  let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  return chain(
    scrollbarWidth > 0 &&
      // Use scrollbar-gutter when supported because it also works for fixed positioned elements.
      ('scrollbarGutter' in document.documentElement.style
        ? setStyle(document.documentElement, 'scrollbarGutter', 'stable')
        : setStyle(document.documentElement, 'paddingRight', `${scrollbarWidth}px`)),
    setStyle(document.documentElement, 'overflow', 'hidden')
  );
}

// Mobile Safari is a whole different beast. Even with overflow: hidden,
// it still scrolls the page in many situations:
//
// 1. When the bottom toolbar and address bar are collapsed, page scrolling is always allowed.
// 2. When the keyboard is visible, the viewport does not resize. Instead, the keyboard covers part of
//    it, so it becomes scrollable.
// 3. When tapping on an input, the page always scrolls so that the input is centered in the visual viewport.
//    This may cause even fixed position elements to scroll off the screen.
// 4. When using the next/previous buttons in the keyboard to navigate between inputs, the whole page always
//    scrolls, even if the input is inside a nested scrollable element that could be scrolled instead.
//
// In order to work around these cases, and prevent scrolling without jankiness, we do a few things:
//
// 1. Prevent default on `touchmove` events that are not in a scrollable element. This prevents touch scrolling
//    on the window.
// 2. Set `overscroll-behavior: contain` on nested scrollable regions so they do not scroll the page when at
//    the top or bottom. Work around a bug where this does not work when the element does not actually overflow
//    by preventing default in a `touchmove` event.
// 3. Prevent default on `touchend` events on input elements and handle focusing the element ourselves.
// 4. When focus moves to an input, create an off screen input and focus that temporarily. This prevents 
//    Safari from scrolling the page. After a small delay, focus the real input and scroll it into view
//    ourselves, without scrolling the whole page.
function preventScrollMobileSafari() {
  let scrollable: Element;
  let onTouchStart = (e: TouchEvent) => {
    // Store the nearest scrollable parent element from the element that the user touched.
    scrollable = getScrollParent(e.target as Element, true);
    if (scrollable === document.documentElement && scrollable === document.body) {
      return;
    }
  };

  // Prevent scrolling up when at the top and scrolling down when at the bottom
  // of a nested scrollable area, otherwise mobile Safari will start scrolling
  // the window instead.
  // This must be applied before the touchstart event as of iOS 26, so inject it as a <style> element.
  let style = document.createElement('style');
  style.textContent = `
@layer {
  * {
    overscroll-behavior: contain;
  }
}`.trim();
  document.head.prepend(style);

  let onTouchMove = (e: TouchEvent) => {
    // Prevent scrolling the window.
    if (!scrollable || scrollable === document.documentElement || scrollable === document.body) {
      e.preventDefault();
      return;
    }

    // overscroll-behavior should prevent scroll chaining, but currently does not
    // if the element doesn't actually overflow. https://bugs.webkit.org/show_bug.cgi?id=243452
    // This checks that both the width and height do not overflow, otherwise we might
    // block horizontal scrolling too. In that case, adding `touch-action: pan-x` to
    // the element will prevent vertical page scrolling. We can't add that automatically
    // because it must be set before the touchstart event.
    if (scrollable.scrollHeight === scrollable.clientHeight && scrollable.scrollWidth === scrollable.clientWidth) {
      e.preventDefault();
    }
  };

  let onBlur = (e: FocusEvent) => {
    let target = e.target as HTMLElement;
    let relatedTarget = e.relatedTarget as HTMLElement | null;
    if (!(target as any).reactAriaScrollStopper && relatedTarget && willOpenKeyboard(relatedTarget)) {
      // Create an off screen input element at the top of the page and temporarily focus 
      // that to avoid scrolling to the tapped input.
      let scrollStopper = document.createElement('input');
      (scrollStopper as any).reactAriaScrollStopper = true; // Mark so we don't handle blur on temp input.
      scrollStopper.dataset.reactAriaTopLayer = 'true'; // Prevent FocusScope from handling when focused.
      scrollStopper.style.position = 'fixed';
      scrollStopper.style.left = '0px';
      scrollStopper.style.top = '0px';
      scrollStopper.style.transform = 'translateY(-3000px) scale(0)';
      // Copy keyboard-related attributes for we get the correct size.
      for (let attr of ['autocorrect', 'autocomplete', 'autocapitalize', 'inputmode', 'spellcheck', 'type', 'pattern', 'enterkeyhint']) {
        if (relatedTarget.hasAttribute(attr)) {
          scrollStopper.setAttribute(attr, relatedTarget.getAttribute(attr)!);
        }
      }
      document.body.appendChild(scrollStopper);
      scrollStopper.focus({preventScroll: true});

      // After a delay, move focus to the tapped input without scrolling, and remove the temporary input.
      setTimeout(() => {
        if (document.activeElement === scrollStopper && relatedTarget.isConnected) {
          relatedTarget.focus({preventScroll: true});
          scrollIntoViewWhenReady(relatedTarget);
        }
        scrollStopper.remove();
      }, 32);
    } else if (!relatedTarget) {
      // When tapping the Done button on the keyboard, focus moves to the body.
      // FocusScope will then restore focus back to the input. Later when tapping
      // the same input again, it is already focused, so no blur event will fire,
      // resulting in the flow above never running and Safari's native scrolling occurring.
      // Instead, move focus to the parent focusable element (e.g. the dialog).
      let focusable = target.parentElement?.closest('[tabindex]') as HTMLElement | null;
      focusable?.focus({preventScroll: true});
    }
  };

  // Override programmatic focus to scroll into view without scrolling the whole page.
  let focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (opts) {
    focus.call(this, {...opts, preventScroll: true});
    if (!opts || !opts.preventScroll) {
      scrollIntoViewWhenReady(this);
    }
  };

  let removeEvents = chain(
    addEvent(document, 'touchstart', onTouchStart, {passive: false, capture: true}),
    addEvent(document, 'touchmove', onTouchMove, {passive: false, capture: true}),
    addEvent(document, 'blur', onBlur, true)
  );

  return () => {
    removeEvents();
    style.remove();
    HTMLElement.prototype.focus = focus;
  };
}

// Sets a CSS property on an element, and returns a function to revert it to the previous value.
function setStyle(element: HTMLElement, style: string, value: string) {
  let cur = element.style[style];
  element.style[style] = value;

  return () => {
    element.style[style] = cur;
  };
}

// Adds an event listener to an element, and returns a function to remove it.
function addEvent<K extends keyof GlobalEventHandlersEventMap>(
  target: Document | Window,
  event: K,
  handler: (this: Document | Window, ev: GlobalEventHandlersEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  // internal function, so it's ok to ignore the difficult to fix type error
  // @ts-ignore
  target.addEventListener(event, handler, options);
  return () => {
    // @ts-ignore
    target.removeEventListener(event, handler, options);
  };
}

function scrollIntoViewWhenReady(target: Element) {
  if (!visualViewport || visualViewport.height < window.innerHeight) {
    // If the keyboard is already visible, scroll the target into view.
    scrollIntoView(target);
  } else {
    // Otherwise, wait for the visual viewport to resize before scrolling so we can
    // measure the correct position to scroll to.
    visualViewport.addEventListener('resize', () => scrollIntoView(target), {once: true});
  }
}

function scrollIntoView(target: Element) {
  let root = document.scrollingElement || document.documentElement;
  let nextTarget: Element | null = target;
  while (nextTarget && nextTarget !== root) {
    // Find the parent scrollable element and adjust the scroll position if the target is not already in view.
    let scrollable = getScrollParent(nextTarget);
    if (scrollable !== document.documentElement && scrollable !== document.body && scrollable !== nextTarget) {
      let scrollableRect = scrollable.getBoundingClientRect();
      let targetRect = nextTarget.getBoundingClientRect();
      if (targetRect.top < scrollableRect.top || targetRect.bottom > scrollableRect.top + nextTarget.clientHeight) {
        let bottom = scrollableRect.bottom;
        if (visualViewport) {
          bottom = Math.min(bottom, visualViewport.offsetTop + visualViewport.height);
        }

        // Center within the viewport.
        let adjustment = (targetRect.top - scrollableRect.top) - ((bottom - scrollableRect.top) / 2 - targetRect.height / 2);
        scrollable.scrollTo({
          // Clamp to the valid range to prevent over-scrolling.
          top: Math.max(0, Math.min(scrollable.scrollHeight - scrollable.clientHeight, scrollable.scrollTop + adjustment)),
          behavior: 'smooth'
        });
      }
    }

    nextTarget = scrollable.parentElement;
  }
}
