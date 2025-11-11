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

  let maskImage: string | undefined;
  if (topMaskSize > 0 || bottomMaskSize > 0) {
    let parts: string[] = [];
    if (topMaskSize > 0) {
      parts.push('transparent 0px');
      parts.push(`black ${topMaskSize}px`);
    } else {
      parts.push('black 0px');
    }
    if (bottomMaskSize > 0) {
      parts.push(`black calc(100% - ${bottomMaskSize}px)`);
      parts.push('transparent 100%');
    } else {
      parts.push('black 100%');
    }
    maskImage = `linear-gradient(to bottom, ${parts.join(', ')})`;
  }

  return (
    <div
      ref={scrollRef}
      onScroll={e => updateMasks(e.currentTarget)}
      style={{
        maskImage
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
