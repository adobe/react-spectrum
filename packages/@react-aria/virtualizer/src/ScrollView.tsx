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
import {getScrollLeft} from './utils';
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
import {Rect, Size} from '@react-stately/virtualizer';
import {useEffectEvent, useEvent, useLayoutEffect, useObjectRef, useResizeObserver} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';

interface ScrollViewProps extends HTMLAttributes<HTMLElement> {
  contentSize: Size,
  onVisibleRectChange: (rect: Rect) => void,
  children?: ReactNode,
  innerStyle?: CSSProperties,
  onScrollStart?: () => void,
  onScrollEnd?: () => void,
  scrollDirection?: 'horizontal' | 'vertical' | 'both'
}

function ScrollView(props: ScrollViewProps, ref: ForwardedRef<HTMLDivElement | null>) {
  ref = useObjectRef(ref);
  let {scrollViewProps, contentProps} = useScrollView(props, ref);

  return (
    <div role="presentation" {...scrollViewProps} ref={ref}>
      <div role="presentation" {...contentProps}>
        {props.children}
      </div>
    </div>
  );
}

const ScrollViewForwardRef = React.forwardRef(ScrollView);
export {ScrollViewForwardRef as ScrollView};

export function useScrollView(props: ScrollViewProps, ref: RefObject<HTMLElement | null>) {
  let {
    contentSize,
    onVisibleRectChange,
    innerStyle,
    onScrollStart,
    onScrollEnd,
    scrollDirection = 'both',
    ...otherProps
  } = props;

  let state = useRef({
    scrollTop: 0,
    scrollLeft: 0,
    scrollEndTime: 0,
    scrollTimeout: null,
    width: 0,
    height: 0,
    isScrolling: false
  }).current;
  let {direction} = useLocale();

  let [isScrolling, setScrolling] = useState(false);
  let onScroll = useCallback((e) => {
    if (e.target !== e.currentTarget) {
      return;
    }

    if (props.onScroll) {
      props.onScroll(e);
    }

    flushSync(() => {
      let scrollTop = e.currentTarget.scrollTop;
      let scrollLeft = getScrollLeft(e.currentTarget, direction);

      // Prevent rubber band scrolling from shaking when scrolling out of bounds
      state.scrollTop = Math.max(0, Math.min(scrollTop, contentSize.height - state.height));
      state.scrollLeft = Math.max(0, Math.min(scrollLeft, contentSize.width - state.width));

      onVisibleRectChange(new Rect(state.scrollLeft, state.scrollTop, state.width, state.height));

      if (!state.isScrolling) {
        state.isScrolling = true;
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
      if (state.scrollEndTime <= now + 50) {
        state.scrollEndTime = now + 300;

        clearTimeout(state.scrollTimeout);
        state.scrollTimeout = setTimeout(() => {
          state.isScrolling = false;
          setScrolling(false);
          state.scrollTimeout = null;

          window.dispatchEvent(new Event('tk.connect-observer'));
          if (onScrollEnd) {
            onScrollEnd();
          }
        }, 300);
      }
    });
  }, [props, direction, state, contentSize, onVisibleRectChange, onScrollStart, onScrollEnd]);

  // Attach event directly to ref so RAC Virtualizer doesn't need to send props upward.
  useEvent(ref, 'scroll', onScroll);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      clearTimeout(state.scrollTimeout);
      if (state.isScrolling) {
        window.dispatchEvent(new Event('tk.connect-observer'));
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let updateSize = useEffectEvent((flush: typeof flushSync) => {
    let dom = ref.current;
    if (!dom) {
      return;
    }

    let isTestEnv = process.env.NODE_ENV === 'test' && !process.env.VIRT_ON;
    let isClientWidthMocked = Object.getOwnPropertyNames(window.HTMLElement.prototype).includes('clientWidth');
    let isClientHeightMocked = Object.getOwnPropertyNames(window.HTMLElement.prototype).includes('clientHeight');
    let clientWidth = dom.clientWidth;
    let clientHeight = dom.clientHeight;
    let w = isTestEnv && !isClientWidthMocked ? Infinity : clientWidth;
    let h = isTestEnv && !isClientHeightMocked ? Infinity : clientHeight;

    if (state.width !== w || state.height !== h) {
      state.width = w;
      state.height = h;
      flush(() => {
        onVisibleRectChange(new Rect(state.scrollLeft, state.scrollTop, w, h));
      });

      // If the clientWidth or clientHeight changed, scrollbars appeared or disappeared as
      // a result of the layout update. In this case, re-layout again to account for the
      // adjusted space. In very specific cases this might result in the scrollbars disappearing
      // again, resulting in extra padding. We stop after a maximum of two layout passes to avoid
      // an infinite loop. This matches how browsers behavior with native CSS grid layout.
      if (!isTestEnv && clientWidth !== dom.clientWidth || clientHeight !== dom.clientHeight) {
        state.width = dom.clientWidth;
        state.height = dom.clientHeight;
        flush(() => {
          onVisibleRectChange(new Rect(state.scrollLeft, state.scrollTop, state.width, state.height));
        });
      }
    }
  });

  let didUpdateSize = useRef(false);
  useLayoutEffect(() => {
    // React doesn't allow flushSync inside effects, so queue a microtask.
    // We also need to wait until all refs are set (e.g. when passing a ref down from a parent).
    queueMicrotask(() => {
      if (!didUpdateSize.current) {
        didUpdateSize.current = true;
        updateSize(flushSync);
      }
    });
  }, [updateSize]);
  useEffect(() => {
    if (!didUpdateSize.current) {
      // If useEffect ran before the above microtask, we are in a synchronous render (e.g. act).
      // Update the size here so that you don't need to mock timers in tests.
      didUpdateSize.current = true;
      updateSize(fn => fn());
    }
  }, [updateSize]);
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
  } else if (scrollDirection === 'vertical' || contentSize.width === state.width) {
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
