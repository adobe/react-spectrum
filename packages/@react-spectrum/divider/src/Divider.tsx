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

import {classNames, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React, {ElementType} from 'react';
import {SpectrumDividerProps} from '@react-types/divider';
import styles from '@adobe/spectrum-css-temp/components/rule/vars.css';
import {useSeparator} from '@react-aria/separator';

let sizeMap = {
  S: 'small',
  M: 'medium',
  L: 'large'
};

/**
 * Dividers bring clarity to a layout by grouping and dividing content in close proximity.
 * They can also be used to establish rhythm and hierarchy.
 */
export const Divider = React.forwardRef(function Divider(props: SpectrumDividerProps, ref: DOMRef) {
  props = useSlotProps(props, 'divider');
  let {
    size = 'L',
    orientation = 'horizontal',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);
  let weight = sizeMap[size];

  let Element: ElementType = 'hr';
  if (orientation === 'vertical') {
    Element = 'div';
  }

  let {separatorProps} = useSeparator({
    ...props,
    elementType: Element
  });

  return (
    <Element
      {...styleProps}
      className={
        classNames(
          styles,
          'spectrum-Rule',
          `spectrum-Rule--${weight}`,
          {
            'spectrum-Rule--vertical': orientation === 'vertical',
            'spectrum-Rule--horizontal': orientation === 'horizontal'
          },
          styleProps.className
        )
      }
      // @ts-ignore https://github.com/Microsoft/TypeScript/issues/28892
      ref={domRef}
      {...separatorProps} />
  );
});
