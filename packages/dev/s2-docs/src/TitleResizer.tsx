'use client';

import {useCallback, useRef} from 'react';
import {useLayoutEffect, useResizeObserver} from '@react-aria/utils';

export function TitleResizer() {
  let titleRef = useRef<HTMLHeadingElement>(null);

  // Size the title to fit the available space.
  let updateTitleFontSize = useCallback(() => {
    if (titleRef.current) {
      let fontSize = parseInt(window.getComputedStyle(titleRef.current).fontSize, 10);

      // Constrain font size to 58px, or 10% of the window width, whichever is smaller.
      let maxFontSize = Math.min(58, Math.round(window.innerWidth * 0.1));
      if (fontSize > maxFontSize) {
        fontSize = maxFontSize;
        titleRef.current.style.fontSize = maxFontSize + 'px';
      }

      // If the font size is less than the maximum font size,
      // increase the font size until it overflows.
      while (fontSize < maxFontSize && titleRef.current.scrollWidth <= titleRef.current.clientWidth) {
        fontSize++;
        titleRef.current.style.fontSize = fontSize + 'px';
      }

      // Reduce the font size until it doesn't overflow.
      while (fontSize > 10 && titleRef.current.scrollWidth > titleRef.current.clientWidth + 1) {
        fontSize--;
        titleRef.current.style.fontSize = fontSize + 'px';
      }
    }
  }, []);

  useLayoutEffect(() => {
    titleRef.current = document.querySelector('h1');
    updateTitleFontSize();
  }, [updateTitleFontSize]);

  useResizeObserver({
    ref: titleRef,
    onResize: updateTitleFontSize
  });

  return null;
}
