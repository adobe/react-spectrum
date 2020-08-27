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

import {classNames, dimensionValue, passthroughStyle, StyleHandlers, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {FlexProps} from '@react-types/layout';
import React, {forwardRef} from 'react';
import styles from './flex-gap.css';
import {useIsSSR} from '@react-aria/ssr';

const flexStyleProps: StyleHandlers = {
  direction: ['flexDirection', passthroughStyle],
  wrap: ['flexWrap', flexWrapValue],
  justifyContent: ['justifyContent', flexAlignValue],
  alignItems: ['alignItems', flexAlignValue],
  alignContent: ['alignContent', flexAlignValue]
};

function Flex(props: FlexProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {styleProps: flexStyle} = useStyleProps(otherProps, flexStyleProps);
  let domRef = useDOMRef(ref);
  let isSSR = useIsSSR();

  // If a gap property is specified, and there is no native support or we're in SSR, use a shim.
  // Two divs are required for this: the outer one contains most style properties, and the inner
  // one is the flex container. Each item inside the flex container gets a margin around it based
  // on the gap, and the flex container has a negative margin to counteract this. The outer container
  // is necessary to allow nesting of flex containers with gaps, so that the inner CSS variable doesn't
  // override the outer one.
  if ((props.gap || props.rowGap || props.columnGap) && (isSSR || !isFlexGapSupported())) {
    let style = {
      ...flexStyle.style,
      '--column-gap': props.columnGap != null ? dimensionValue(props.columnGap) : undefined,
      '--row-gap': props.rowGap != null ? dimensionValue(props.rowGap) : undefined,
      '--gap': props.gap != null ? dimensionValue(props.gap) : undefined
    };

    return (
      <div {...filterDOMProps(otherProps)} {...styleProps} className={classNames(styles, 'flex-container', styleProps.className)} ref={domRef}>
        <div className={classNames(styles, 'flex', 'flex-gap')} style={style}>
          {children}
        </div>
      </div>
    );
  }

  // If no gaps, or native support exists, then we only need to render a single div.
  let style = {
    ...styleProps.style,
    ...flexStyle.style
  };

  if (props.gap != null) {
    style.gap = dimensionValue(props.gap);
  }

  if (props.columnGap != null) {
    style.columnGap = dimensionValue(props.columnGap);
  }

  if (props.rowGap != null) {
    style.rowGap = dimensionValue(props.rowGap);
  }

  return (
    <div className={classNames(styles, 'flex', styleProps.className)} style={style} ref={domRef}>
      {children}
    </div>
  );
}

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


// Original licensing for the following method can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/Modernizr/Modernizr/blob/7efb9d0edd66815fb115fdce95fabaf019ce8db5/feature-detects/css/flexgap.js

let _isFlexGapSupported = null;
function isFlexGapSupported() {
  if (_isFlexGapSupported != null) {
    return _isFlexGapSupported;
  }

  if (typeof document === 'undefined') {
    return false;
  }

  // create flex container with row-gap set
  var flex = document.createElement('div');
  flex.style.display = 'flex';
  flex.style.flexDirection = 'column';
  flex.style.rowGap = '1px';

  // create two, elements inside it
  flex.appendChild(document.createElement('div'));
  flex.appendChild(document.createElement('div'));

  // append to the DOM (needed to obtain scrollHeight)
  document.body.appendChild(flex);
  _isFlexGapSupported = flex.scrollHeight === 1; // flex container should be 1px high from the row-gap
  flex.parentNode.removeChild(flex);

  return _isFlexGapSupported;
}

/**
 * A layout container using flexbox. Provides Spectrum dimension values, and supports the gap
 * property to define consistent spacing between items.
 */
const _Flex = forwardRef(Flex);
export {_Flex as Flex};
