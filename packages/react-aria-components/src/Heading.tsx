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

import {HeadingContext} from './RSPContexts';
import React, {ElementType, ForwardedRef, forwardRef, HTMLAttributes} from 'react';
import {useContextProps} from './utils';

export interface HeadingProps extends HTMLAttributes<HTMLElement> {
  level?: number
}

function Heading(props: HeadingProps, ref: ForwardedRef<HTMLHeadingElement>) {
  [props, ref] = useContextProps(props, ref, HeadingContext);
  let {children, level = 3, className, ...domProps} = props;
  let Element = `h${level}` as ElementType;

  return (
    <Element {...domProps} ref={ref} className={className ?? 'react-aria-Heading'}>
      {children}
    </Element>
  );
}

const _Heading = forwardRef(Heading);
export {_Heading as Heading};
