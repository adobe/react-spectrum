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

import {classNames, passthroughStyle, responsiveDimensionValue, StyleHandlers, useBreakpoint, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {FlexProps} from '@react-types/layout';
import React, {forwardRef} from 'react';
import styles from './flex-gap.css';

const flexStyleProps: StyleHandlers = {
  direction: ['flexDirection', passthroughStyle],
  wrap: ['flexWrap', flexWrapValue],
  justifyContent: ['justifyContent', flexAlignValue],
  alignItems: ['alignItems', flexAlignValue],
  alignContent: ['alignContent', flexAlignValue]
};

/**
 * A layout container using flexbox. Provides Spectrum dimension values, and supports the gap
 * property to define consistent spacing between items.
 */
export const Flex = forwardRef(function Flex(props: FlexProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    ...otherProps
  } = props;
  let breakpointProvider = useBreakpoint();
  let matchedBreakpoints = breakpointProvider?.matchedBreakpoints || ['base'];
  let {styleProps} = useStyleProps(otherProps);
  let {styleProps: flexStyle} = useStyleProps(otherProps, flexStyleProps);
  let domRef = useDOMRef(ref);

  let style = {
    ...styleProps.style,
    ...flexStyle.style
  };

  if (props.gap != null) {
    style.gap = responsiveDimensionValue(props.gap, matchedBreakpoints);
  }

  if (props.columnGap != null) {
    style.columnGap = responsiveDimensionValue(props.columnGap, matchedBreakpoints);
  }

  if (props.rowGap != null) {
    style.rowGap = responsiveDimensionValue(props.rowGap, matchedBreakpoints);
  }

  return (
    <div {...filterDOMProps(otherProps)} className={classNames(styles, 'flex', styleProps.className)} style={style} ref={domRef}>
      {children}
    </div>
  );
});

/**
 * Normalize 'start' and 'end' alignment values to 'flex-start' and 'flex-end'
 * in flex containers for browser compatibility.
 */
function flexAlignValue(value) {
  if (value === 'start') {
    return 'flex-start';
  }

  if (value === 'end') {
    return 'flex-end';
  }

  return value;
}

/**
 * Takes a boolean and translates it to flex wrap or nowrap.
 */
function flexWrapValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'wrap' : 'nowrap';
  }

  return value;
}
