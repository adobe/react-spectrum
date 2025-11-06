'use client';

import React, {useEffect, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function ScrollableToc({children}) {
  let [topMaskSize, setTopMaskSize] = useState(0);
  let [bottomMaskSize, setBottomMaskSize] = useState(0);
  let scrollRef = useRef<HTMLDivElement>(null);

  let updateMasks = (element: HTMLDivElement) => {
    let scrollTop = element.scrollTop;
    let scrollHeight = element.scrollHeight;
    let clientHeight = element.clientHeight;
    let distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    setTopMaskSize(Math.min(scrollTop, 32));
    setBottomMaskSize(Math.min(distanceFromBottom, 32));
  };

  useEffect(() => {
    if (scrollRef.current) {
      updateMasks(scrollRef.current);
    }
  }, [children]);

  return (
    <div
      ref={scrollRef}
      onScroll={e => updateMasks(e.currentTarget)}
      style={{
        maskImage: [
          topMaskSize > 0 ? `linear-gradient(to bottom, transparent, black ${topMaskSize}px)` : null,
          bottomMaskSize > 0 ? `linear-gradient(to top, transparent, black ${bottomMaskSize}px)` : null
        ].filter(Boolean).join(', ') || undefined
      }}
      className={style({
        overflowY: 'auto',
        flex: 1,
        minHeight: 0
      })}>
      {children}
    </div>
  );
}
