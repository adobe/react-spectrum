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

import {CSSProperties, HTMLAttributes, ReactNode, RefObject, useState} from 'react';
import {mergeProps} from './mergeProps';
import {Orientation, Size} from '@react-types/shared';
import {ScrollObserverProps, useScrollObserver} from './useScrollObserver';
import {useEffectEvent} from './useEffectEvent';
import {useLayoutEffect} from './useLayoutEffect';

export interface ScrollViewProps extends Omit<ScrollObserverProps, 'box'> {
  style?: CSSProperties,
  children?: ReactNode,
  contentSize?: Size,
  contentStyle?: CSSProperties,
  orientation?: Orientation | 'both'
}

export interface ScrollViewAria {
  isScrolling: boolean,
  scrollViewProps: HTMLAttributes<HTMLElement>,
  contentProps: HTMLAttributes<HTMLElement>
}

export function useScrollView(props: ScrollViewProps, ref: RefObject<HTMLElement | null>): ScrollViewAria {
  let {contentSize, orientation = 'both'} = props;

  let [isScrolling, setIsScrolling] = useState(false);

  // When content size is controlled, watch border-box instead of content-box so that 
  // we don't go into an infinite loop when scrollbars appear or disappear.
  let box: ResizeObserverBoxOptions = contentSize ? 'border-box' : 'content-box';

  let observer = useScrollObserver(mergeProps(props, {
    onScrollStart: () => setIsScrolling(true),
    onScrollEnd: () => setIsScrolling(false),
    box
  }), ref);

  // In controlled scenarios, we need to watch for content size changes ourselves.
  // We also need to resize before the first paint to avoid a flash of missing content.
  let updateContentSize = useEffectEvent(observer.updateSize);
  useLayoutEffect(() => updateContentSize(), [contentSize?.width, contentSize?.height]);

  let style: CSSProperties = {
    ...props.style
  };

  let contentStyle: CSSProperties = {
    width: contentSize?.width,
    height: contentSize?.height,
    display: contentSize ? undefined : 'contents',
    pointerEvents: isScrolling ? 'none' : 'auto',
    ...props.contentStyle
  };

  // TODO: Add back overflow-x: hidden ? I can't reproduce this anymore.
  if (orientation === 'horizontal') {
    style.overflowX = 'auto';
    style.overflowY = 'hidden';
  } else if (orientation === 'vertical') {
    style.overflowY = 'auto';
    style.overflowX = 'hidden';
  } else {
    style.overflow = 'auto';
  }

  return {
    isScrolling,
    scrollViewProps: {
      style
    },
    contentProps: {
      role: 'presentation',
      style: contentStyle
    }
  };
}
