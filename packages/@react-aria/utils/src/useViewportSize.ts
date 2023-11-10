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

interface ViewportSize {
  width: number,
  height: number
}

// @ts-ignore
let visualViewport = typeof document !== 'undefined' && window.visualViewport;

export function useViewportSize(): ViewportSize {
  let isSSR = useIsSSR();
  let [size, setSize] = useState(() => isSSR ? {width: 0, height: 0} : getViewportSize());

  useEffect(() => {
    // Use visualViewport api to track available height even on iOS virtual keyboard opening
    let onResize = () => {
      setSize(size => {
        let newSize = getViewportSize();
        if (newSize.width === size.width && newSize.height === size.height) {
          return size;
        }
        return newSize;
      });
    };

    if (!visualViewport) {
      window.addEventListener('resize', onResize);
    } else {
      visualViewport.addEventListener('resize', onResize);
    }

    return () => {
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
    width: visualViewport?.width || window.innerWidth,
    height: visualViewport?.height || window.innerHeight
  };
}
