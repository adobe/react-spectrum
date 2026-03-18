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

import {AriaLabelingProps, DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {clamp} from '@react-aria/utils';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import React, {CSSProperties} from 'react';
import styles from '@adobe/spectrum-css-temp/components/circleloader/vars.css';
import {useProgressBar} from '@react-aria/progress';

export interface ProgressCircleProps {
  /**
   * The current value (controlled).
   * @default 0
   */
  value?: number,
  /**
   * The smallest value allowed for the input.
   * @default 0
   */
  minValue?: number,
  /**
   * The largest value allowed for the input.
   * @default 100
   */
  maxValue?: number,
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean
}

export interface AriaProgressCircleProps extends ProgressCircleProps, DOMProps, AriaLabelingProps {}
export interface SpectrumProgressCircleProps extends AriaProgressCircleProps, StyleProps {
  /**
   * What the ProgressCircle's diameter should be.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L',
  /** The static color style to apply. Useful when the button appears over a color background. */
  staticColor?: 'white' | 'black',
  /**
   * The [visual style](https://spectrum.adobe.com/page/progress-circle/#Over-background-variant) of the ProgressCircle.
   *
   * @deprecated - use staticColor instead.
   */
  variant?: 'overBackground'
}

/**
 * ProgressCircles show the progression of a system operation such as downloading, uploading, or processing, in a visual way.
 * They can represent determinate or indeterminate progress.
 */
export const ProgressCircle = React.forwardRef(function ProgressCircle(props: SpectrumProgressCircleProps, ref: DOMRef<HTMLDivElement>) {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    size = 'M',
    staticColor,
    variant,
    isIndeterminate = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  value = clamp(value, minValue, maxValue);
  let {progressBarProps} = useProgressBar({...props, value});

  let subMask1Style: CSSProperties = {};
  let subMask2Style: CSSProperties = {};
  if (!isIndeterminate) {
    let percentage = (value - minValue) / (maxValue - minValue) * 100;
    let angle;
    if (percentage > 0 && percentage <= 50) {
      angle = -180 + (percentage / 50 * 180);
      subMask1Style.transform = `rotate(${angle}deg)`;
      subMask2Style.transform = 'rotate(-180deg)';
    } else if (percentage > 50) {
      angle = -180 + (percentage - 50) / 50 * 180;
      subMask1Style.transform = 'rotate(0deg)';
      subMask2Style.transform = `rotate(${angle}deg)`;
    }
  }

  if (!ariaLabel && !ariaLabelledby && process.env.NODE_ENV !== 'production') {
    console.warn('ProgressCircle requires an aria-label or aria-labelledby attribute for accessibility');
  }

  return (
    <div
      {...styleProps}
      {...progressBarProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-CircleLoader',
          {
            'spectrum-CircleLoader--indeterminate': isIndeterminate,
            'spectrum-CircleLoader--small': size === 'S',
            'spectrum-CircleLoader--large': size === 'L',
            'spectrum-CircleLoader--overBackground': variant === 'overBackground',
            'spectrum-CircleLoader--staticWhite': staticColor === 'white',
            'spectrum-CircleLoader--staticBlack': staticColor === 'black'
          },
          styleProps.className
        )
      }>
      <div className={classNames(styles, 'spectrum-CircleLoader-track')} />
      <div className={classNames(styles, 'spectrum-CircleLoader-fills')} >
        <div className={classNames(styles, 'spectrum-CircleLoader-fillMask1')} >
          <div
            className={classNames(styles, 'spectrum-CircleLoader-fillSubMask1')}
            data-testid="fillSubMask1"
            style={subMask1Style}>
            <div className={classNames(styles, 'spectrum-CircleLoader-fill')} />
          </div>
        </div>
        <div className={classNames(styles, 'spectrum-CircleLoader-fillMask2')} >
          <div
            className={classNames(styles, 'spectrum-CircleLoader-fillSubMask2')}
            data-testid="fillSubMask2"
            style={subMask2Style} >
            <div className={classNames(styles, 'spectrum-CircleLoader-fill')} />
          </div>
        </div>
      </div>
    </div>
  );
});
