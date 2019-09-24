import { CollectionView } from './CollectionView';
import { LayoutInfo, Rect, ReusableView } from './';
import React, { useLayoutEffect, useState, useRef, useEffect, useCallback } from 'react';
import { Point } from './Point';
import { Size } from './Size';
import { flushSync } from 'react-dom';

export function ReactCollectionView({renderItem, layout, data, ...otherProps}) {
  let [visibleViews, setVisibleViews] = useState([]);
  let [visibleRect, setVisibleRect] = useState(new Rect());
  let [contentSize, setContentSize] = useState(new Size());
  let [isAnimating, setAnimating] = useState(false);
  let startTime = useRef(performance.now());
  let averagePerf = useRef([0, 0]);
  let averageTime = useRef([0, 0]);
  let collectionView = useRef(null);
  let velocity = useRef(5);
  let overscan = useRef([0, 0]);
  if (!collectionView.current) {
    collectionView.current = new CollectionView();
  }

  // ViewManager, SelectionManager, DragDropManager

  collectionView.current.delegate = {
    setVisibleViews,
    setVisibleRect,
    setContentSize,
    renderView: renderItem,
    renderWrapper: (reusableView: ReusableView) => {
      return (
        <div key={reusableView.key} role="presentation" style={layoutInfoToStyle(reusableView.layoutInfo)}>
          {reusableView.content}
        </div>
      );
    },
    beginAnimations: () => setAnimating(true),
    endAnimations: () => setAnimating(false)
  };

  collectionView.current.layout = layout;
  collectionView.current.data = data;
  if (collectionView.current.visibleRect.height === 0)
    collectionView.current.visibleRect = visibleRect;

  useLayoutEffect(() => {
    // collectionView.current.afterRender();
    let time = performance.now() - startTime.current;
    if (time < 500) {
      averagePerf.current[0]++;
      averagePerf.current[1] += (time - averagePerf.current[1]) / averagePerf.current[0];  
    }

    // px / us

    if (visibleRect.height === 0)
      return;
    let o = Math.abs(velocity.current * (averageTime.current[1] + averagePerf.current[1]));
    let prev = overscan.current[1];

    overscan.current[0]++;
    overscan.current[1] += (o - overscan.current[1]) / overscan.current[0];

    overscan.current[1] = Math.min(visibleRect.height * 2, overscan.current[1]);

    if (prev === 0) {
      console.log('initail render')
      collectionView.current.visibleRect = getOverscannedRect(visibleRect);
    }

    // console.log(Math.ceil(overscan.current[1] / 100) * 100, o, velocity.current, averageTime.current[1], averagePerf.current[1], Math.ceil(averageTime.current[1] / FRAME_DURATION))
  });

  let onVisibleRectChange = (rect: Rect) => { 
    let time = performance.now() - startTime.current;
    if (time < 500) {
      averageTime.current[0]++;
      averageTime.current[1] += (time - averageTime.current[1]) / averageTime.current[0];

      if (rect.y !== visibleRect.y && time > 0) {
        velocity.current = (rect.y - visibleRect.y) / time;
      }
    }
   
    setVisibleRect(rect);
    collectionView.current.visibleRect = getOverscannedRect(rect);
  };

  let getOverscannedRect = (rect) => {
    let overscanned = rect.copy();
    let o = Math.round(overscan.current[1] / 100) * 100;
    // console.log(o, overscan.current[1], velocity.current, averageTime.current[1], averagePerf.current[1])
    if (velocity.current > 0) {
      overscanned.y -= o * 0.2;
      overscanned.height += o + o * 0.2;
    } else {
      overscanned.y -= o;
      overscanned.height += o + o * 0.2;
    }

    startTime.current = performance.now();
    return overscanned;
  }

  // console.log('RENDER', visibleViews, visibleRect, contentSize)
  
  return (
    <ScrollView 
      {...otherProps}
      contentSize={contentSize}
      visibleRect={visibleRect}
      onVisibleRectChange={onVisibleRectChange}>
      {visibleViews}
    </ScrollView>
  );
}

function ScrollView({contentSize, visibleRect, onVisibleRectChange, children, ...otherProps}) {
  let ref = useRef();
  let lastScrollTop = useRef(0);
  let lastScrollLeft = useRef(0);
  let scrollEndTime = useRef(0);
  let scrollTimeout = useRef(null);
  let scrolling = useRef(false);
  let onScroll = useCallback((e) => {
    flushSync(() => {
      // console.log('scroll')
      lastScrollTop.current = e.currentTarget.scrollTop;
      lastScrollLeft.current = e.currentTarget.scrollLeft;
      onVisibleRectChange(new Rect(lastScrollLeft.current, lastScrollTop.current, visibleRect.width, visibleRect.height));

      // let updateScrollPosition = () => {
      //   lastScrollTop.current = ref.current.scrollTop;
      //   lastScrollLeft.current = ref.current.scrollLeft;
      //   onVisibleRectChange(new Rect(lastScrollLeft.current, lastScrollTop.current, visibleRect.width, visibleRect.height));
      // };
    
      // let frame = () => {
      //   updateScrollPosition();
      //   if (scrolling.current) {
      //     requestAnimationFrame(frame);
      //   }
      // };

      // updateScrollPosition();
      // requestAnimationFrame(updateScrollPosition);

      if (!scrolling.current) {
        // requestAnimationFrame(frame);
        // setScrolling(true);
        scrolling.current = true;
      }

      // So we don't constantly call clearTimeout and setTimeout,
      // keep track of the current timeout time and only reschedule
      // the timer when it is getting close.
      let now = Date.now();
      if (scrollEndTime.current <= now + 50) {
        scrollEndTime.current = now + 300;

        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          // setScrolling(false);
          scrolling.current = false;
        }, 300);
      }
    });
  }, [visibleRect.width, visibleRect.height, onVisibleRectChange, scrolling]);

  // useLayoutEffect(() => {
  //   if (visibleRect.y !== lastScrollTop || visibleRect.x !== lastScrollLeft) {
  //     ref.current.scrollTop = visibleRect.y;
  //     ref.current.scrollLeft = visibleRect.x;
  //   }
  // }, [visibleRect]);
  
  useEffect(() => {
    // TODO: resize observer
    // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    let updateSize = () => {
      let w = ref.current.offsetWidth;
      let h = ref.current.offsetHeight;

      if (w !== visibleRect.width || h !== visibleRect.height) {
        console.log('height change!')
        onVisibleRectChange(new Rect(visibleRect.x, visibleRect.y, ref.current.offsetWidth, ref.current.offsetHeight));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize, false);
    return () => {
      window.removeEventListener('resize', updateSize, false);
    };
  }, []);

  return (
    <div {...otherProps} style={{position: 'relative', overflow: 'auto'}} ref={ref} onScroll={onScroll}>
      <div style={{width: contentSize.width, height: contentSize.height, pointerEvents: scrolling ? 'none' : 'auto'}}>
        {children}
      </div>
    </div>
  );
}

function layoutInfoToStyle(layoutInfo: LayoutInfo) {
  // let transform = `translate3d(${layoutInfo.rect.x}px, ${layoutInfo.rect.y}px, 0)`;
  // if (layoutInfo.transform) {
  //   transform += ' ' + layoutInfo.transform;
  // }

  return {
    position: 'absolute',
    overflow: 'hidden',
    top: layoutInfo.rect.y,
    left: layoutInfo.rect.x,
    transition: 'all',
    WebkitTransition: 'all',
    WebkitTransitionDuration: 'inherit',
    transitionDuration: 'inherit',
    width: layoutInfo.rect.width + 'px',
    height: layoutInfo.rect.height + 'px',
    opacity: layoutInfo.opacity,
    zIndex: layoutInfo.zIndex,
    // WebkitTransform: transform,
    // transform: transform,
    contain: 'size layout style paint'
  };
}
