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
import {RefObject, useCallback, useEffect, useRef} from 'react';

const AUTOSCROLL_AREA_SIZE = 20;

export function useAutoScroll(ref: RefObject<Element>) {
  let scrollableRef = useRef<Element>(null);
  useEffect(() => {
    if (ref.current) {
      scrollableRef.current = isScrollable(ref.current) ? ref.current : getScrollParent(ref.current);
    }
  }, [ref]);

  let state = useRef({
    timer: null,
    dx: 0,
    dy: 0
  }).current;

  useEffect(() => {
    return () => {
      if (state.timer) {
        cancelAnimationFrame(state.timer);
        state.timer = null;
      }
    };
  // state will become a new object, so it's ok to use in the dependency array for unmount
  }, [state]);

  let scroll = useCallback(() => {
    scrollableRef.current.scrollLeft += state.dx;
    scrollableRef.current.scrollTop += state.dy;

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
        state.timer = null;
      }
    }
  };
}
