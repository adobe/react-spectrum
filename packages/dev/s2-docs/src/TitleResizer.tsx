'use client';

import {useCallback, useRef} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

// TODO: this causes a flash when the headings change size, maybe we just move this code
// to client and append suppressHydrationWarning to the h1s
export function TitleResizer() {
  let titleRef = useRef<HTMLHeadingElement>(null);
  let raf = useRef<number | null>(null);

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

    if (titleRef.current == null) {
      return;
    }

    updateTitleFontSize();
    // Use ResizeObserver where available to detect size changes not related to window resizing, e.g. font loading.
    if (typeof ResizeObserver !== 'undefined') {
      let observer = new ResizeObserver(() => {
        if (!raf.current) {
          // Avoid updating the layout during the resize event and creating circular notifications.
          raf.current = requestAnimationFrame(() => {
            updateTitleFontSize();
            raf.current = null;
          });
        }
      });
      observer.observe(titleRef.current);

      return () => {
        observer.disconnect();
        if (raf.current) {
          cancelAnimationFrame(raf.current);
        }
      };
    } else {
      window.addEventListener('resize', updateTitleFontSize);
      return () => {
        window.removeEventListener('resize', updateTitleFontSize);
      };
    }
  }, [updateTitleFontSize]);

  return null;
}
