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

import {clamp} from '@react-aria/utils';
import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SliderBase, useSliderBase, UseSliderBaseInputProps} from './SliderBase';
import {SpectrumSliderProps} from '@react-types/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {VisuallyHidden} from '@adobe/react-spectrum';

function Slider(props: SpectrumSliderProps) {
  let {onChange, value, defaultValue, isFilled, fillOffset, trackBackground, ...otherProps} = props;

  let ariaProps: UseSliderBaseInputProps = {
    ...otherProps,
    // Normalize `value: number[]` to `value: number`
    value: value != null ? [value] : undefined,
    defaultValue: defaultValue != null ? [defaultValue] : undefined,
    onChange(v) {
      onChange?.(v[0]);
    }
  };

  let {inputRefs: [inputRef], thumbProps: [thumbProps], inputProps: [inputProps], ticks, isHovered, ...containerProps} = useSliderBase(1, ariaProps);
  let {state, direction} = containerProps;
  let isRTL = direction === 'rtl';

  fillOffset = fillOffset != null ? clamp(fillOffset, state.getThumbMinValue(0), state.getThumbMaxValue(0)) : fillOffset;

  let leftTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{
      width: `${(isRTL ? (1 - state.getThumbPercent(0)) : state.getThumbPercent(0)) * 100}%`,
      // TODO not sure if it has advantages, but this could also be implemented as CSS calc():
      // .track::before {
      //    background-size: calc((1/ (var(--width)/100)) * 100%);
      //    width: calc(var(--width) * 1%)M
      // }
      // @ts-ignore
      '--spectrum-track-background-size': `${(1 / state.getThumbPercent(0)) * 100}%`
    }} />);
  let handle = (<div
    className={classNames(styles, 'spectrum-Slider-handle', {'is-hovered': isHovered})}
    style={{left: `${(isRTL ? (1 - state.getThumbPercent(0)) : state.getThumbPercent(0)) * 100}%`}}
    {...thumbProps}
    role="presentation">
    <VisuallyHidden isFocusable>
      <input className={classNames(styles, 'spectrum-Slider-input')} ref={inputRef} {...inputProps} />
    </VisuallyHidden>
  </div>);
  let rightTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{
      width: `${(isRTL ? state.getThumbPercent(0) : (1 - state.getThumbPercent(0))) * 100}%`,
      // @ts-ignore
      '--spectrum-track-background-size': `${(1 / (1 - state.getThumbPercent(0))) * 100}%`,
      '--spectrum-track-background-position': '100%'
    }} />);

  let filledTrack = null;
  if (isFilled && fillOffset != null) {
    let width = state.getThumbPercent(0) - state.getValuePercent(fillOffset);
    let isRightOfOffset = width > 0;
    let left = isRightOfOffset ? state.getValuePercent(fillOffset) : state.getThumbPercent(0);
    filledTrack =
      (<div
        className={classNames(styles, 'spectrum-Slider-fill', {'spectrum-Slider-fill--right': isRightOfOffset})}
        style={{
          left: `${left * 100}%`,
          width: `${Math.abs(width) * 100}%`
        }} />);
  }

  return (
    <SliderBase
      {...containerProps}
      classes={{
        'spectrum-Slider--filled': isFilled && fillOffset == null
      }}
      style={
        // @ts-ignore
        {'--spectrum-slider-track-color': trackBackground}
      }>
      {leftTrack}
      {ticks}
      <FocusRing within focusRingClass={classNames(styles, 'is-focused')}>
        {handle}
      </FocusRing>
      {rightTrack}
      {filledTrack}
    </SliderBase>);
}

// TODO forwardRef?
export {Slider};
