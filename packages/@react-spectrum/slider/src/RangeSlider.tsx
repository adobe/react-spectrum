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

import {classNames} from '@react-spectrum/utils';
import {DEFAULT_MAX_VALUE, DEFAULT_MIN_VALUE} from '@react-stately/slider';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SliderBase, toPercent, useSliderBase, UseSliderBaseInputProps} from './SliderBase';
import {SpectrumRangeSliderProps} from '@react-types/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {VisuallyHidden} from '@adobe/react-spectrum';

function RangeSlider(props: SpectrumRangeSliderProps) {
  let {onChange, value, defaultValue, ...otherProps} = props;

  let ariaProps: UseSliderBaseInputProps = {
    ...otherProps,
    // Normalize `value: number[]` to `value: number`
    value: value != null ? [value.start, value.end] : undefined,
    defaultValue: defaultValue != null ? [defaultValue.start, defaultValue.end] :
      // make sure that useSliderState knows we have two handles
      [props.minValue ?? DEFAULT_MIN_VALUE, props.maxValue ?? DEFAULT_MAX_VALUE],
    onChange(v) {
      onChange?.({start: v[0], end: v[1]});
    }
  };

  let {inputRefs,
    thumbProps,
    inputProps, ticks,
    isHovered, ...containerProps} = useSliderBase(2, ariaProps);

  let {state, direction} = containerProps;

  let [leftSliderIndex, rightSliderIndex] = direction === 'ltr' ? [0, 1] : [1, 0];

  let leftTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{width: toPercent(state.getThumbPercent(leftSliderIndex), direction)}} />);
  let middleTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{left: toPercent(state.getThumbPercent(leftSliderIndex), direction), width: toPercent(Math.abs(state.getThumbPercent(0) - state.getThumbPercent(1)))}} />);
  let rightTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{left: toPercent(state.getThumbPercent(rightSliderIndex), direction), width: toPercent(1 - state.getThumbPercent(rightSliderIndex), direction)}} />);

  return (
    <SliderBase {...containerProps} classes={'spectrum-Slider--range'}>
      {leftTrack}
      {ticks}
      <FocusRing within focusRingClass={classNames(styles, 'is-focused')}>
        <div
          className={classNames(styles, 'spectrum-Slider-handle', {'is-hovered': isHovered})}
          style={{left: toPercent(state.getThumbPercent(leftSliderIndex), direction)}}
          {...thumbProps[leftSliderIndex]}
          role="presentation">
          <VisuallyHidden isFocusable>
            <input className={classNames(styles, 'spectrum-Slider-input')} ref={inputRefs[leftSliderIndex]} {...inputProps[leftSliderIndex]} />
          </VisuallyHidden>
        </div>
      </FocusRing>
      {middleTrack}
      <FocusRing within focusRingClass={classNames(styles, 'is-focused')}>
        <div
          className={classNames(styles, 'spectrum-Slider-handle', {'is-hovered': isHovered})}
          style={{left: toPercent(state.getThumbPercent(rightSliderIndex), direction)}}
          {...thumbProps[rightSliderIndex]}
          role="presentation">
          <VisuallyHidden isFocusable>
            <input className={classNames(styles, 'spectrum-Slider-input')} ref={inputRefs[rightSliderIndex]} {...inputProps[rightSliderIndex]} />
          </VisuallyHidden>
        </div>
      </FocusRing>
      {rightTrack}
    </SliderBase>);
}

// TODO forwardRef?
export {RangeSlider};
