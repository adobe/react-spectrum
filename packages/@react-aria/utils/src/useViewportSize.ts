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

// Lazy import to avoid circular dependency issues
// useUNSAFE_PortalContext is only used if available
let portalContextModule: typeof import('@react-aria/overlays') | null = null;
function getPortalContext() {
  if (!portalContextModule) {
    try {
      portalContextModule = require('@react-aria/overlays');
    } catch {
      return null;
    }
  }
  return portalContextModule;
}

export function useViewportSize(): ViewportSize {
  let isSSR = useIsSSR();
  let portalModule = getPortalContext();
  let getContainerBounds = portalModule?.useUNSAFE_PortalContext?.()?.getContainerBounds;
  let containerBounds = getContainerBounds?.() || null;
  
  let [size, setSize] = useState(() => {
    if (isSSR) {
      return {width: 0, height: 0};
    }
    
    // If container bounds are provided, use those; otherwise use window viewport
    if (containerBounds) {
      return {width: containerBounds.width, height: containerBounds.height};
    }
    
    return getViewportSize();
  });

  useEffect(() => {
    // Use visualViewport api to track available height even on iOS virtual keyboard opening
    let onResize = () => {
      // Ignore updates when zoomed.
      if (visualViewport && visualViewport.scale > 1) {
        return;
      }

      setSize(size => {
        // Re-measure container bounds if available, otherwise use window viewport
        let newBounds = getContainerBounds?.();
        let newSize: ViewportSize;
        
        if (newBounds) {
          newSize = {width: newBounds.width, height: newBounds.height};
        } else {
          newSize = getViewportSize();
        }
        
        if (newSize.width === size.width && newSize.height === size.height) {
          return size;
        }
        return newSize;
      });
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
            setSize(size => {
              let newSize: ViewportSize;
              let newBounds = getContainerBounds?.();
              
              if (newBounds) {
                newSize = {width: newBounds.width, height: newBounds.height};
              } else {
                newSize = {width: window.innerWidth, height: window.innerHeight};
              }
              
              if (newSize.width === size.width && newSize.height === size.height) {
                return size;
              }
              return newSize;
            });
          }
        });
      }
    };

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
  }, [getContainerBounds]);

  return size;
}

function getViewportSize(): ViewportSize {
  return {
    // Multiply by the visualViewport scale to get the "natural" size, unaffected by pinch zooming.
    width: visualViewport ? visualViewport.width * visualViewport.scale : window.innerWidth,
    height: visualViewport ? visualViewport.height * visualViewport.scale : window.innerHeight
  };
}
