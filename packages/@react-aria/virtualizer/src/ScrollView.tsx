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

import {ScrollViewProps as AriaScrollViewProps, mergeProps, ScrollViewAria, useScrollView as useAriaScrollView, useLayoutEffect, useObjectRef} from '@react-aria/utils';
import {forwardRefType, Orientation, Size} from '@react-types/shared';
import React, {CSSProperties, ForwardedRef, forwardRef, HTMLAttributes, ReactNode, RefObject, useMemo} from 'react';
import {useLocale} from '@react-aria/i18n';

interface ScrollViewProps extends Omit<AriaScrollViewProps, 'onScroll' | 'direction'>, Omit<HTMLAttributes<HTMLElement>, 'onScrollEnd'> {
  contentSize: Size,
  children?: ReactNode,
  /** @deprecated Use 'contentStyle' instead. */
  innerStyle?: CSSProperties,
  /** @deprecated Use 'orientation' instead. */
  scrollDirection?: Orientation | 'both'
}

export const ScrollView = /*#__PURE__*/ (forwardRef as forwardRefType)(function ScrollView(props: ScrollViewProps, ref: ForwardedRef<HTMLDivElement | null>) {
  ref = useObjectRef(ref);
  let {isScrolling, scrollViewProps, contentProps} = useScrollView(props, ref);

  return (
    <div role="presentation" ref={ref} {...scrollViewProps} data-scrolling={isScrolling || undefined}>
      <div {...contentProps}>
        {props.children}
      </div>
    </div>
  );
});

export function useScrollView(props: ScrollViewProps, ref: RefObject<HTMLElement | null>): ScrollViewAria {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {contentSize, onScrollStart, onScrollEnd, onScrollPortChange, onScrollSnapChange, onScrollSnapChanging, onVisibleRectChange, ...otherProps} = props;
  let {style, innerStyle, contentStyle = innerStyle, scrollDirection = 'both', orientation = scrollDirection, ...domProps} = otherProps;
  let {direction} = useLocale();

  // Reset padding so that relative positioning works correctly. Padding will be done in JS layout.
  let virtualizerStyle: CSSProperties = {
    padding: 0,
    ...style
  };

  let layoutStyle: CSSProperties = {
    position: 'relative',
    ...contentStyle
  };

  // Skip native event listener, since we forward props for backwards compatibility :(
  let viewProps = {...props, onScroll: undefined};
  let viewRef = useScrollViewRef(viewProps, ref);

  // Pause typekit MutationObserver during scrolling.
  let {isScrolling, scrollViewProps, contentProps} = useAriaScrollView(mergeProps(viewProps, {
    onScrollStart: () => window.dispatchEvent(new Event('tk.disconnect-observer')),
    onScrollEnd: () => window.dispatchEvent(new Event('tk.connect-observer')),
    style: virtualizerStyle,
    contentStyle: layoutStyle,
    orientation,
    direction
  }), viewRef);

  // Re-connect typekit MutationObserver on unmount.
  useLayoutEffect(() => () => {
    window.dispatchEvent(new Event('tk.connect-observer'));
  }, []);

  return {
    isScrolling,
    contentProps,
    scrollViewProps: {
      ...domProps,
      ...scrollViewProps
    }
  };
}

// In test environments, we auto-stub the dimensions of the visible rect to the entire contentSize, so that 
// consumers don't need to setup dimension stubs to test a virtualized component. Unfortunately, both scrollWidth 
// and scrollHeight are used to stub item dimensions, although our observer relies on scrollWidth >= clientWidth.
// This intercepts reads with a Proxy to provide reliable dimensions while avoiding leaks from Virtualizer's scope.
// See https://github.com/adobe/react-spectrum/pull/4835#discussion_r1284897591
function useScrollViewRef(props: ScrollViewProps, ref: RefObject<HTMLElement | null>): RefObject<HTMLElement | null> {
  let {contentSize} = props;
  return useMemo(() => {
    if (process.env.NODE_ENV !== 'test') { return ref; }

    let cache: HTMLElement | null = null;
    let proto = Object.getOwnPropertyNames(window.HTMLElement.prototype);

    return {
      get current() {
        if (!ref.current) { return null; }

        return cache ??= new Proxy(ref.current, {
          get(target, key, receiver) {
            switch (key) {
              case 'clientWidth': 
                return process.env.VIRT_ON || proto.includes(key) ? ref.current![key] : contentSize.width;
              case 'clientHeight': 
                return process.env.VIRT_ON || proto.includes(key) ? ref.current![key] : contentSize.height;
              case 'scrollWidth': 
                return contentSize.width;
              case 'scrollHeight': 
                return contentSize.height;
            }

            let value = Reflect.get(target, key, receiver);
            return typeof value === 'function' ? value.bind(target) : value;
          }
        });
      },
      set current(v: HTMLElement | null) {
        ref.current = v;
      }
    };
  }, [ref, contentSize.width, contentSize.height]);
}
