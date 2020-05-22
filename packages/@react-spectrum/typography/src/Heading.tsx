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

import {DOMRef} from '@react-types/shared';
import {filterDOMProps, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {HeadingProps} from '@react-types/typography';
import React, {forwardRef} from 'react';

function Heading(props: HeadingProps, ref: DOMRef<HTMLHeadingElement>) {
  props = useSlotProps(props, 'heading');
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  return (
    <h1 {...filterDOMProps(otherProps)} {...styleProps} ref={domRef}>
      {children}
    </h1>
  );
}

const _Heading = forwardRef(Heading);
export {_Heading as Heading};
