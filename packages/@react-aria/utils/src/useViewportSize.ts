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

import {useEffect, useState} from 'react';
import {useIsSSR} from '@react-aria/ssr';
import {willOpenKeyboard} from './keyboard';

interface ViewportSize {
  width: number,
  height: number
}

let visualViewport = typeof document !== 'undefined' && window.visualViewport;

export function useViewportSize(): ViewportSize {
  let isSSR = useIsSSR();
  let [size, setSize] = useState(() => isSSR ? {width: 0, height: 0} : getViewportSize());

  useEffect(() => {
    let updateSize = (newSize: ViewportSize) => {
      setSize(size => {
        if (newSize.width === size.width && newSize.height === size.height) {
          return size;
        }
        return newSize;
      });
    };

    // Use visualViewport api to track available height even on iOS virtual keyboard opening
    let onResize = () => {
      // Ignore updates when zoomed.
      if (visualViewport && visualViewport.scale > 1) {
        return;
      }

      updateSize(getViewportSize());
    };

    // When closing the keyboard, iOS does not fire the visual viewport resize event until the animation is complete.
    // We can anticipate this and resize early by handling the blur event and using the layout size.
    let frame: number;
    let onBlur = (e: FocusEvent) => {
      if (visualViewport && visualViewport.scale > 1) {
        return;
      }

      if (willOpenKeyboard(e.target as Element)) {
        // Wait one frame to see if a new element gets focused.
        frame = requestAnimationFrame(() => {
          if (!document.activeElement || !willOpenKeyboard(document.activeElement)) {
            updateSize({width: document.documentElement.clientWidth, height: document.documentElement.clientHeight});
          }
        });
      }
    };

    updateSize(getViewportSize());

    window.addEventListener('blur', onBlur, true);

    if (!visualViewport) {
      window.addEventListener('resize', onResize);
    } else {
      visualViewport.addEventListener('resize', onResize);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('blur', onBlur, true);
      if (!visualViewport) {
        window.removeEventListener('resize', onResize);
      } else {
        visualViewport.removeEventListener('resize', onResize);
      }
    };
  }, []);

  return size;
}

function getViewportSize(): ViewportSize {
  return {
    // Multiply by the visualViewport scale to get the "natural" size, unaffected by pinch zooming.
    width: visualViewport ? visualViewport.width * visualViewport.scale : document.documentElement.clientWidth,
    height: visualViewport ? visualViewport.height * visualViewport.scale : document.documentElement.clientHeight
  };
}
