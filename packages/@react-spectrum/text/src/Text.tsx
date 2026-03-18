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

import {DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import React, {forwardRef, ReactNode} from 'react';
import {useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';

export interface TextProps extends DOMProps, StyleProps {
  /**
   * Text content.
   */
  children: ReactNode,
  /**
   * A slot to place the text in.
   * @default 'text'
   */
  slot?: string
}

/**
 * Text represents text with no specific semantic meaning.
 */
export const Text = forwardRef(function Text(props: TextProps, ref: DOMRef) {
  props = useSlotProps(props, 'text');
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  return (
    <span role="none" {...filterDOMProps(otherProps)} {...styleProps} ref={domRef}>
      {children}
    </span>
  );
});
