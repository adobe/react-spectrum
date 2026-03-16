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

import {getScrollParent, isIOS, isScrollable, isWebKit} from '@react-aria/utils';
import {RefObject} from '@react-types/shared';
import {useCallback, useEffect, useRef} from 'react';

const AUTOSCROLL_AREA_SIZE = 20;

interface AutoScrollAria {
    move(x: number, y: number): void,
    stop(): void
}

export function useAutoScroll(ref: RefObject<Element | null>): AutoScrollAria {
  let scrollableRef = useRef<Element>(null);
  let scrollableX = useRef(true);
  let scrollableY = useRef(true);
  useEffect(() => {
    if (ref.current) {
      scrollableRef.current = isScrollable(ref.current) ? ref.current : getScrollParent(ref.current);
      let style = window.getComputedStyle(scrollableRef.current);
      scrollableX.current = /(auto|scroll)/.test(style.overflowX);
      scrollableY.current = /(auto|scroll)/.test(style.overflowY);
    }
  }, [ref]);

  let state = useRef<{timer: ReturnType<typeof requestAnimationFrame> | undefined, dx: number, dy: number}>({
    timer: undefined,
    dx: 0,
    dy: 0
  }).current;

  useEffect(() => {
    return () => {
      if (state.timer) {
        cancelAnimationFrame(state.timer);
        state.timer = undefined;
      }
    };
  // state will become a new object, so it's ok to use in the dependency array for unmount
  }, [state]);

  let scroll = useCallback(() => {
    if (scrollableX.current && scrollableRef.current) {
      scrollableRef.current.scrollLeft += state.dx;
    }
    if (scrollableY.current && scrollableRef.current) {
      scrollableRef.current.scrollTop += state.dy;
    }

    if (state.timer) {
      state.timer = requestAnimationFrame(scroll);
    }
  }, [scrollableRef, state]);

  return {
    move(x, y) {
      // Most browsers auto scroll natively, but WebKit on macOS does not (iOS does 🤷‍♂️).
      // https://bugs.webkit.org/show_bug.cgi?id=222636
      if (!isWebKit() || isIOS() || !scrollableRef.current) {
        return;
      }

      let box = scrollableRef.current.getBoundingClientRect();
      let left = AUTOSCROLL_AREA_SIZE;
      let top = AUTOSCROLL_AREA_SIZE;
      let bottom = box.height - AUTOSCROLL_AREA_SIZE;
      let right = box.width - AUTOSCROLL_AREA_SIZE;
      if (x < left || x > right || y < top || y > bottom) {
        if (x < left) {
          state.dx = x - left;
        } else if (x > right) {
          state.dx = x - right;
        }
        if (y < top) {
          state.dy = y - top;
        } else if (y > bottom) {
          state.dy = y - bottom;
        }

        if (!state.timer) {
          state.timer = requestAnimationFrame(scroll);
        }
      } else {
        this.stop();
      }
    },
    stop() {
      if (state.timer) {
        cancelAnimationFrame(state.timer);
        state.timer = undefined;
      }
    }
  };
}
