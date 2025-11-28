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

import {flushSync} from 'react-dom';
import {getScrollLeft, getScrollTop} from './getScrollOffset';
import {isReactAct} from './platform';
import {Rect, Size} from '@react-stately/utils';
import {RefObject, useCallback, useRef, useState} from 'react';
import {useEvent} from './useEvent';
import {useLayoutEffect} from './useLayoutEffect';
import {useResizeObserver} from './useResizeObserver';

export interface ScrollObserverProps {
  /** Handler that is called when the scroll port changes. */
  onScrollPortChange?: (rect: Rect) => void,
  /** Handler that is called when the visible rect changes. */
  onVisibleRectChange?: (rect: Rect) => void,
  /** Handler that is called when the content size changes. */
  onContentSizeChange?: (size: Size) => void,
  /** Handler that is called when the scroll snap target changes. */
  onScrollSnapChange?: (e: Event) => void,
  /** Handler that is called when a scroll snap change is pending. */
  onScrollSnapChanging?: (e: Event) => void,
  /** Handler that is called when the element is scrolled. */
  onScroll?: (e: Event) => void,
  /** Handler that is called when scrolling starts. */
  onScrollStart?: () => void,
  /** Handler that is called when scrolling ends. */
  onScrollEnd?: () => void,
  /**
   * Whether the visible rect can overscroll the content size.
   * @default false
   */
  allowOverscroll?: boolean,
  /**
   * The box model to use for the size observer.
   * @default 'content-box'
   */
  box?: ResizeObserverBoxOptions
}

export function useScrollObserver(props: ScrollObserverProps, ref: RefObject<HTMLElement | null>): { updateSize: () => void } {
  let {box = 'content-box', allowOverscroll = false, onScrollEnd, onScrollStart, onScroll, onVisibleRectChange, onScrollPortChange, onContentSizeChange} = props;

  let isUpdating = useRef(false);
  let [update, setUpdate] = useState({});

  let state = useRef({
    y: 0,
    x: 0,
    width: 0,
    height: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    scrollEndTime: 0,
    scrollPaddingTop: 0,
    scrollPaddingBottom: 0,
    scrollPaddingLeft: 0,
    scrollPaddingRight: 0,
    scrollTimeout: undefined as ReturnType<typeof setTimeout> | undefined,
    isScrolling: false
  }).current;

  let handleSizeChange = useCallback(() => {
    onContentSizeChange?.(new Size(state.scrollWidth, state.scrollHeight));
  }, [state, onContentSizeChange]);

  let handleRectChange = useCallback(() => {
    onVisibleRectChange?.(new Rect(state.x, state.y, state.width, state.height));

    let x = state.x + state.scrollPaddingLeft;
    let y = state.y + state.scrollPaddingTop;
    let width = state.width - state.scrollPaddingLeft - state.scrollPaddingRight;
    let height = state.height - state.scrollPaddingTop - state.scrollPaddingBottom;

    onScrollPortChange?.(new Rect(x, y, width, height));
  }, [state, onVisibleRectChange, onScrollPortChange]);

  let handleScrollEnd = useCallback(() => flushSync(() => {
    state.isScrolling = false;
    state.scrollTimeout = undefined;
    onScrollEnd?.();
  }), [state, onScrollEnd]);

  let handleScroll = useCallback((e: Event) => flushSync(() => {
    if (!e.target || e.target !== e.currentTarget) { return; }

    if (!state.isScrolling) {
      state.isScrolling = true;
      onScrollStart?.();
    }

    // Pass ref.current to allow for mock proxy in tests.
    state.y = getScrollTop(ref.current!, allowOverscroll);
    state.x = getScrollLeft(ref.current!, allowOverscroll);

    onScroll?.(e);
    handleRectChange();

    // So we don't constantly call clearTimeout and setTimeout,
    // keep track of the current timeout time and only reschedule
    // the timer when it is getting close.
    if (state.scrollEndTime <= e.timeStamp + 50) {
      state.scrollEndTime = e.timeStamp + 300;
      clearTimeout(state.scrollTimeout);
      state.scrollTimeout = setTimeout(handleScrollEnd, 300);
    }
  }), [ref, state, allowOverscroll, handleRectChange, handleScrollEnd, onScroll, onScrollStart]);

  let updateSize = useCallback((flush = flushSync) => {
    if (!ref.current || isUpdating.current) { return; }

    isUpdating.current = true;

    let target = ref.current;
    let style = getComputedStyle(target);

    state.scrollPaddingTop = parseFloat(style.scrollPaddingTop) || 0;
    state.scrollPaddingBottom = parseFloat(style.scrollPaddingBottom) || 0;
    state.scrollPaddingLeft = parseFloat(style.scrollPaddingLeft) || 0;
    state.scrollPaddingRight = parseFloat(style.scrollPaddingRight) || 0;

    if (target.scrollWidth !== state.scrollWidth || target.scrollHeight !== state.scrollHeight) {
      state.scrollWidth = target.scrollWidth;
      state.scrollHeight = target.scrollHeight;
      flush(handleSizeChange);
    }

    // If the clientWidth or clientHeight changed, scrollbars appeared or disappeared as
    // a result of the layout update. In this case, re-layout again to account for the
    // adjusted space. In very specific cases this might result in the scrollbars disappearing
    // again, resulting in extra padding. We stop after a maximum of two layout passes to avoid
    // an infinite loop. This matches how browsers behave with native CSS grid layout.
    if (target.clientWidth !== state.width || target.clientHeight !== state.height) {
      state.width = target.clientWidth;
      state.height = target.clientHeight;
      flush(handleRectChange);

      if (target.clientWidth !== state.width || target.clientHeight !== state.height) {
        state.width = target.clientWidth;
        state.height = target.clientHeight;
        flush(handleRectChange);
      }
    }

    isUpdating.current = false;
  }, [ref, state, handleSizeChange, handleRectChange]);

  // Attach events directly to ref so props won't need to be sent upward.
  useEvent(ref, 'scroll', handleScroll);
  useEvent(ref, 'scrollsnapchange', props.onScrollSnapChange);
  useEvent(ref, 'scrollsnapchanging', props.onScrollSnapChanging);
  useResizeObserver({ref, box, onResize: updateSize});

  // React doesn't allow flushSync inside effects, so queue a microtask.
  // We also need to wait until all refs are set (e.g. when passing a ref down from a parent).
  // In `act` environments, update immediately so we don't need to mock timers in tests.
  // We currently need to do this in a seperate render, but within the same act.
  // https://github.com/adobe/react-spectrum/pull/7938#discussion_r2078228393
  let queueUpdate = useCallback(() => {
    if (isUpdating.current) { return; }

    return isReactAct() ? setUpdate({}) : queueMicrotask(updateSize);
  }, [updateSize]);

  // Will only run in tests, needs to be in separate effect so it is properly run in the next render in strict mode.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => updateSize(fn => fn()), [update]);

  return {updateSize: queueUpdate};
}
