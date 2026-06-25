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

// @ts-ignore
import {flushSync} from 'react-dom';
import {getEventTarget, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {getScrollLeft} from './utils';
import {Point, Rect, Size} from 'react-stately/useVirtualizerState';
import React, {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {useEffectEvent} from '../utils/useEffectEvent';
import {useLayoutEffect} from '../utils/useLayoutEffect';
import {useLocale} from '../i18n/I18nProvider';
import {useObjectRef} from '../utils/useObjectRef';
import {useResizeObserver} from '../utils/useResizeObserver';

interface ScrollViewProps extends Omit<HTMLAttributes<HTMLElement>, 'onScroll'> {
  contentSize: Size;
  onVisibleRectChange: (rect: Rect) => void;
  onSizeChange?: (size: Size) => void;
  children?: ReactNode;
  innerStyle?: CSSProperties;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  scrollDirection?: 'horizontal' | 'vertical' | 'both';
  onScroll?: (e: Event) => void;
  allowsWindowScrolling?: boolean;
}

function ScrollView(props: ScrollViewProps, refArg: ForwardedRef<HTMLDivElement | null>) {
  let ref = refArg;
  ref = useObjectRef(ref);
  let {scrollViewProps, contentProps} = useScrollView(props, ref);

  return (
    <div role="presentation" {...scrollViewProps} ref={ref}>
      <div {...contentProps}>{props.children}</div>
    </div>
  );
}

const ScrollViewForwardRef: React.ForwardRefExoticComponent<
  ScrollViewProps & React.RefAttributes<HTMLDivElement | null>
> = React.forwardRef(ScrollView);
export {ScrollViewForwardRef as ScrollView};

interface ScrollViewAria {
  isScrolling: boolean;
  scrollViewProps: HTMLAttributes<HTMLElement>;
  contentProps: HTMLAttributes<HTMLElement>;
}

export function useScrollView(
  props: ScrollViewProps,
  ref: RefObject<HTMLElement | null>
): ScrollViewAria {
  let {
    contentSize,
    onVisibleRectChange,
    onSizeChange,
    innerStyle,
    onScrollStart,
    onScrollEnd,
    scrollDirection = 'both',
    onScroll: onScrollProp,
    allowsWindowScrolling,
    ...otherProps
  } = props;

  let stateRef = useRef({
    // Internal scroll position of the scroll view.
    scrollPosition: new Point(),
    // Size of the scroll view.
    size: new Size(),
    // Offset of the scroll view relative to the window viewport.
    viewportOffset: new Point(),
    // Size of the window viewport.
    viewportSize: new Size(),
    scrollEndTime: 0,
    scrollTimeout: null as ReturnType<typeof setTimeout> | null,
    isScrolling: false,
    lastVisibleRect: new Rect()
  });
  let {direction} = useLocale();

  let updateVisibleRect = useCallback(() => {
    // Intersect the window viewport with the scroll view itself to find the actual visible rectangle.
    // This allows virtualized components to have unbounded height but still virtualize when scrolled with the page.
    // While there may be other scrollable elements between the <body> and the scroll view, we do not take
    // their sizes into account for performance reasons. Their scroll positions are accounted for in viewportOffset
    // though (due to getBoundingClientRect). This may result in more rows than absolutely necessary being rendered,
    // but no more than the entire height of the viewport which is good enough for virtualization use cases.
    let visibleRect = allowsWindowScrolling
      ? new Rect(
          stateRef.current.viewportOffset.x + stateRef.current.scrollPosition.x,
          stateRef.current.viewportOffset.y + stateRef.current.scrollPosition.y,
          Math.max(
            0,
            Math.min(
              stateRef.current.size.width - stateRef.current.viewportOffset.x,
              stateRef.current.viewportSize.width
            )
          ),
          Math.max(
            0,
            Math.min(
              stateRef.current.size.height - stateRef.current.viewportOffset.y,
              stateRef.current.viewportSize.height
            )
          )
        )
      : new Rect(
          stateRef.current.scrollPosition.x,
          stateRef.current.scrollPosition.y,
          stateRef.current.size.width,
          stateRef.current.size.height
        );
    // Don't emit updates if the visible area is zero and the last emitted area was also zero.
    if (visibleRect.area > 0 || stateRef.current.lastVisibleRect.area > 0) {
      onVisibleRectChange(visibleRect);
      stateRef.current.lastVisibleRect = visibleRect;
    }
  }, [allowsWindowScrolling, onVisibleRectChange]);

  let [isScrolling, setScrolling] = useState(false);

  let onScroll = useCallback(
    (e: Event) => {
      let target = getEventTarget(e) as Element;
      if (!nodeContains(target, ref.current!)) {
        return;
      }

      if (onScrollProp && target === ref.current) {
        onScrollProp(e);
      }

      if (target !== ref.current) {
        // An ancestor element or the window was scrolled. Update the position of the scroll view relative to the viewport.
        let boundingRect = ref.current!.getBoundingClientRect();
        let x = boundingRect.x < 0 ? -boundingRect.x : 0;
        let y = boundingRect.y < 0 ? -boundingRect.y : 0;
        if (x === stateRef.current.viewportOffset.x && y === stateRef.current.viewportOffset.y) {
          return;
        }

        stateRef.current.viewportOffset = new Point(x, y);
      } else {
        // The scroll view itself was scrolled. Update the local scroll position.
        // Prevent rubber band scrolling from shaking when scrolling out of bounds
        let scrollTop = target.scrollTop;
        let scrollLeft = getScrollLeft(target, direction);
        stateRef.current.scrollPosition = new Point(
          Math.max(0, Math.min(scrollLeft, contentSize.width - stateRef.current.size.width)),
          Math.max(0, Math.min(scrollTop, contentSize.height - stateRef.current.size.height))
        );
      }

      flushSync(() => {
        updateVisibleRect();

        if (!stateRef.current.isScrolling) {
          stateRef.current.isScrolling = true;
          setScrolling(true);

          // Pause typekit MutationObserver during scrolling.
          window.dispatchEvent(new Event('tk.disconnect-observer'));
          if (onScrollStart) {
            onScrollStart();
          }
        }

        // So we don't constantly call clearTimeout and setTimeout,
        // keep track of the current timeout time and only reschedule
        // the timer when it is getting close.
        let now = Date.now();
        if (stateRef.current.scrollEndTime <= now + 50) {
          stateRef.current.scrollEndTime = now + 300;

          if (stateRef.current.scrollTimeout != null) {
            clearTimeout(stateRef.current.scrollTimeout);
          }

          stateRef.current.scrollTimeout = setTimeout(() => {
            stateRef.current.isScrolling = false;
            setScrolling(false);
            stateRef.current.scrollTimeout = null;

            window.dispatchEvent(new Event('tk.connect-observer'));
            if (onScrollEnd) {
              onScrollEnd();
            }
          }, 300);
        }
      });
    },
    [onScrollProp, ref, direction, contentSize, updateVisibleRect, onScrollStart, onScrollEnd]
  );

  // Attach a document-level capturing scroll listener so we can account for scrollable ancestors.
  useEffect(() => {
    document.addEventListener('scroll', onScroll, true);
    return () => document.removeEventListener('scroll', onScroll, true);
  }, [onScroll]);

  useEffect(() => {
    let state = stateRef;
    return () => {
      if (state.current.scrollTimeout != null) {
        clearTimeout(state.current.scrollTimeout);
      }

      if (state.current.isScrolling) {
        window.dispatchEvent(new Event('tk.connect-observer'));
      }
    };
  }, []);

  let isUpdatingSize = useRef(false);
  let [scrollViewWidth, setScrollViewWidth] = useState(0);
  let updateSize = useCallback(
    (flush: typeof flushSync) => {
      let dom = ref.current;
      if (!dom || isUpdatingSize.current) {
        return;
      }

      // Prevent reentrancy when resize observer fires, triggers re-layout that results in
      // content size update, causing below layout effect to fire. This avoids infinite loops.
      isUpdatingSize.current = true;

      let isTestEnv = process.env.NODE_ENV === 'test' && !process.env.VIRT_ON;
      let isClientWidthMocked = Object.getOwnPropertyNames(window.HTMLElement.prototype).includes(
        'clientWidth'
      );
      let isClientHeightMocked = Object.getOwnPropertyNames(window.HTMLElement.prototype).includes(
        'clientHeight'
      );
      let clientWidth = dom.clientWidth;
      let clientHeight = dom.clientHeight;
      let w = isTestEnv && !isClientWidthMocked ? Infinity : clientWidth;
      let h = isTestEnv && !isClientHeightMocked ? Infinity : clientHeight;

      // Update the window viewport size.
      let viewportWidth = window.innerWidth;
      let viewportHeight = window.innerHeight;
      let viewportSizeChanged =
        stateRef.current.viewportSize.width !== viewportWidth ||
        stateRef.current.viewportSize.height !== viewportHeight;
      if (viewportSizeChanged) {
        stateRef.current.viewportSize = new Size(viewportWidth, viewportHeight);
      }

      if (
        stateRef.current.size.width !== w ||
        stateRef.current.size.height !== h ||
        viewportSizeChanged
      ) {
        stateRef.current.size = new Size(w, h);
        setScrollViewWidth(w);
        flush(() => {
          updateVisibleRect();
          onSizeChange?.(stateRef.current.size);
        });

        // If the clientWidth or clientHeight changed, scrollbars appeared or disappeared as
        // a result of the layout update. In this case, re-layout again to account for the
        // adjusted space. In very specific cases this might result in the scrollbars disappearing
        // again, resulting in extra padding. We stop after a maximum of two layout passes to avoid
        // an infinite loop. This matches how browsers behavior with native CSS grid layout.
        if ((!isTestEnv && clientWidth !== dom.clientWidth) || clientHeight !== dom.clientHeight) {
          stateRef.current.size = new Size(dom.clientWidth, dom.clientHeight);
          setScrollViewWidth(dom.clientWidth);
          flush(() => {
            updateVisibleRect();
            onSizeChange?.(stateRef.current.size);
          });
        }
      }

      isUpdatingSize.current = false;
    },
    [ref, updateVisibleRect, onSizeChange]
  );
  let updateSizeEvent = useEffectEvent(updateSize);

  // Track the size of the entire window viewport, which is used to bound the size of the virtualizer's visible rectangle.
  useLayoutEffect(() => {
    // Initialize viewportRect before updating size for the first time.
    stateRef.current.viewportSize = new Size(window.innerWidth, window.innerHeight);

    let onWindowResize = () => {
      updateSizeEvent(flushSync);
    };

    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  // Update visible rect when the content size changes, in case scrollbars need to appear or disappear.
  let lastContentSize = useRef<Size | null>(null);
  let [update, setUpdate] = useState({});
  // We only contain a call to setState in here for testing environments.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (
      !isUpdatingSize.current &&
      (lastContentSize.current == null || !contentSize.equals(lastContentSize.current))
    ) {
      // React doesn't allow flushSync inside effects, so queue a microtask.
      // We also need to wait until all refs are set (e.g. when passing a ref down from a parent).
      // If we are in an `act` environment, update immediately without a microtask so you don't need
      // to mock timers in tests. In this case, the update is synchronous already.
      // IS_REACT_ACT_ENVIRONMENT is used by React 18. Previous versions checked for the `jest` global.
      // https://github.com/reactwg/react-18/discussions/102
      if (
        // @ts-ignore
        typeof IS_REACT_ACT_ENVIRONMENT === 'boolean'
          ? // @ts-ignore
            IS_REACT_ACT_ENVIRONMENT
          : typeof jest !== 'undefined'
      ) {
        // This is so we update size in a separate render but within the same act. Needs to be setState instead of refs
        // due to strict mode.
        setUpdate({});
        lastContentSize.current = contentSize;
        return;
      } else {
        queueMicrotask(() => updateSizeEvent(flushSync));
      }
    }

    lastContentSize.current = contentSize;
  });

  // Will only run in tests, needs to be in separate effect so it is properly run in the next render in strict mode.
  useLayoutEffect(() => {
    updateSizeEvent(fn => fn());
  }, [update]);

  let onResize = useCallback(() => {
    updateSize(flushSync);
  }, [updateSize]);

  // Watch border-box instead of of content-box so that we don't go into
  // an infinite loop when scrollbars appear or disappear.
  useResizeObserver({ref, box: 'border-box', onResize});

  let style: React.CSSProperties = {
    // Reset padding so that relative positioning works correctly. Padding will be done in JS layout.
    padding: 0,
    ...otherProps.style
  };

  if (scrollDirection === 'horizontal') {
    style.overflowX = 'auto';
    style.overflowY = 'hidden';
  } else if (scrollDirection === 'vertical' || contentSize.width === scrollViewWidth) {
    // Set overflow-x: hidden if content size is equal to the width of the scroll view.
    // This prevents horizontal scrollbars from flickering during resizing due to resize observer
    // firing slower than the frame rate, which may cause an infinite re-render loop.
    style.overflowY = 'auto';
    style.overflowX = 'hidden';
  } else {
    style.overflow = 'auto';
  }

  innerStyle = {
    width: Number.isFinite(contentSize.width) ? contentSize.width : undefined,
    height: Number.isFinite(contentSize.height) ? contentSize.height : undefined,
    pointerEvents: isScrolling ? 'none' : 'auto',
    position: 'relative',
    ...innerStyle
  };

  return {
    isScrolling,
    scrollViewProps: {
      ...otherProps,
      style
    },
    contentProps: {
      role: 'presentation',
      style: innerStyle
    }
  };
}
