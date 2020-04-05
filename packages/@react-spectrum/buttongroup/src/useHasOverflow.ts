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
import {useProvider} from '@react-spectrum/provider';
import {useWindowWidth} from '@react-spectrum/utils';

interface UseHasOverflowOptions {
  skip: boolean
}

export function useHasOverflow(containerRef, options?: UseHasOverflowOptions) {
  let {scale} = useProvider();
  let windowWidth = useWindowWidth({debounce: 150});
  let [hasOverflow, setHasOverflow] = useState(false);
  let [totalChildWidth, setTotalChildWidth] = useState(0);

  // Only recalculate the size of the children if the scale changes.
  useEffect(() => {
    if (!options.skip && containerRef.current) {
      let children = Array.from(containerRef.current.children) as HTMLElement[];
      let widthOfAllChildren = children.reduce((aggregateWidth, child) => {
        let style = getComputedStyle(child);
        let outerWidth = child.getBoundingClientRect().width + parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
        return aggregateWidth + outerWidth;
      }, 0);
      setTotalChildWidth(widthOfAllChildren);
    }
  }, [containerRef, scale, options.skip]);

  // Check for overflow when the window width or the scale changes.
  useEffect(() => {
    if (!options.skip && containerRef.current) {
      const parentWidth = containerRef.current.parentElement.getBoundingClientRect().width;
      setHasOverflow(totalChildWidth > parentWidth);
    }
  }, [containerRef, totalChildWidth, options.skip, windowWidth, scale]);

  return hasOverflow;
}
