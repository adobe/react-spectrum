import React, { useRef, useCallback, useEffect, ReactNode, CSSProperties, useState, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { Rect, Size } from '@react-stately/collections';
import { DOMProps } from '@react-types/shared';

interface ScrollViewProps extends DOMProps {
  contentSize: Size,
  visibleRect: Rect,
  onVisibleRectChange: (rect: Rect) => void,
  children: ReactNode,
  innerStyle: CSSProperties
}

export function ScrollView(props: ScrollViewProps) {
  let {contentSize, visibleRect, onVisibleRectChange, children, innerStyle, ...otherProps} = props;
  let ref = useRef<HTMLDivElement>();
  let state = useRef({
    scrollTop: 0,
    scrollLeft: 0,
    scrollEndTime: 0,
    scrollTimeout: null,
    width: 0,
    height: 0
  }).current;

  let [isScrolling, setScrolling] = useState(false);
  let onScroll = useCallback((e) => {
    flushSync(() => {
      state.scrollTop = e.currentTarget.scrollTop;
      state.scrollLeft = e.currentTarget.scrollLeft;
      onVisibleRectChange(new Rect(state.scrollLeft, state.scrollTop, state.width, state.height));

      if (!isScrolling) {
        setScrolling(true);
      }

      // So we don't constantly call clearTimeout and setTimeout,
      // keep track of the current timeout time and only reschedule
      // the timer when it is getting close.
      let now = Date.now();
      if (state.scrollEndTime <= now + 50) {
        state.scrollEndTime = now + 300;

        clearTimeout(state.scrollTimeout);
        state.scrollTimeout = setTimeout(() => {
          setScrolling(false);
          state.scrollTimeout = null;
        }, 300);
      }
    });
  }, [onVisibleRectChange]);
  
  useEffect(() => {
    // TODO: resize observer
    // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    let updateSize = () => {
      let dom = ref.current;
      if (!dom) {
        return;
      }

      let w = dom.offsetWidth;
      let h = dom.offsetHeight;

      if (state.width !== w || state.height !== h) {
        state.width = w;
        state.height = h;
        onVisibleRectChange(new Rect(state.scrollLeft, state.scrollTop, w, h));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize, false);
    return () => {
      window.removeEventListener('resize', updateSize, false);
    };
  }, []);

  useLayoutEffect(() => {
    let dom = ref.current;
    if (!dom) {
      return;
    }

    if (visibleRect.x !== state.scrollLeft) {
      state.scrollLeft = visibleRect.x;
      dom.scrollLeft = visibleRect.x;
    }

    if (visibleRect.y !== state.scrollTop) {
      state.scrollTop = visibleRect.y;
      dom.scrollTop = visibleRect.y;
    }
  }, [visibleRect.x, visibleRect.y]);

  return (
    <div {...otherProps} style={{position: 'relative', overflow: 'auto'}} ref={ref} onScroll={onScroll}>
      <div style={{width: contentSize.width, height: contentSize.height, pointerEvents: isScrolling ? 'none' : 'auto', ...innerStyle}}>
        {children}
      </div>
    </div>
  );
}
