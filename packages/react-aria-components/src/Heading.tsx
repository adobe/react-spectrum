/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextValue, dom, DOMRenderProps, useContextProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';

export interface HeadingProps extends HTMLAttributes<HTMLElement>, DOMRenderProps<'h1', undefined> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element.
   *
   * @default 'react-aria-Heading'
   */
  className?: string;
  /**
   * The heading level.
   *
   * @default 3
   */
  level?: number;
}

export const HeadingContext = createContext<ContextValue<HeadingProps, HTMLHeadingElement>>({});

export const Heading = forwardRef(function Heading(
  props: HeadingProps,
  ref: ForwardedRef<HTMLHeadingElement>
) {
  [props, ref] = useContextProps(props, ref, HeadingContext);
  let {children, level = 3, className, ...domProps} = props;
  let Element = dom[`h${level}`];

  return (
    <Element {...domProps} ref={ref} className={className ?? 'react-aria-Heading'}>
      {children}
    </Element>
  );
});
