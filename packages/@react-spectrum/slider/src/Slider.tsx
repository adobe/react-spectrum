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

import {classNames, useDOMRef} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {useRef} from 'react';
import {SliderProps, SpectrumSliderProps} from '@react-types/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {useSliderState} from '@react-stately/slider';
import {VisuallyHidden} from '@adobe/react-spectrum';

function Slider(props: SpectrumSliderProps, ref: DOMRef) {
  // needed?
  useDOMRef(ref);
  props = useProviderProps(props);

  let {
    labelPosition = 'top', isFilled, fillOffset, trackBackground, formatOptions, valueLabel, showValueLabel = !!props.label,
    onChange, value, defaultValue,
    tickCount, showTickLabels, tickLabels,
    ...otherProps} = props;

  let {hoverProps, isHovered} = useHover({/* isDisabled */ });

  let inputRef = useRef();
  let trackRef = useRef();

  // Assumes that DEFAULT_MIN_VALUE and DEFAULT_MAX_VALUE are both positive, this value needs to be passed to useSliderState, so
  // getThumbMinValue/getThumbMaxValue cannot be used here.
  let alwaysDisplaySign = props.minValue != null && props.maxValue != null && Math.sign(props.minValue) !== Math.sign(props.maxValue);

  if (alwaysDisplaySign) {
    if (formatOptions != null) {
      if (!('signDisplay' in formatOptions)) {
        // @ts-ignore
        formatOptions.signDisplay = 'exceptZero';
      }
    } else {
      // @ts-ignore
      formatOptions = {signDisplay: 'exceptZero'};
    }
  }

  let ariaProps: SliderProps = {
    ...otherProps,
    // @ts-ignore
    formatOptions: formatOptions,
    // Normalize `value: number[]` to `value: number`
    value: value != null ? [value] : undefined,
    defaultValue: defaultValue != null ? [defaultValue] : undefined,
    onChange(v) {
      onChange?.(v[0]);
    }
  };

  let state = useSliderState(ariaProps);
  let {
    containerProps,
    trackProps,
    labelProps
  } = useSlider(ariaProps, state, trackRef);
  let {thumbProps, inputProps} = useSliderThumb({
    index: 0,
    isReadOnly: props.isReadOnly,
    isDisabled: props.isDisabled,
    trackRef,
    inputRef
  }, state);

  fillOffset = fillOffset != null ? Math.max(state.getThumbMinValue(0), Math.min(fillOffset, state.getThumbMaxValue(0))) : fillOffset;

  let displayValue = valueLabel ?? state.getThumbValueLabel(0);
  let labelNode = <label className={classNames(styles, 'spectrum-Slider-label')} {...labelProps}>{props.label}</label>;
  let valueNode = <div className={classNames(styles, 'spectrum-Slider-value')} role="textbox" aria-readonly="true" aria-labelledby={labelProps.id}>{displayValue}</div>;

  let leftTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{
      width: `${state.getThumbPercent(0) * 100}%`,
      // TODO not sure if it has advantages, but this could also be implemented as CSS calc():
      // .track::before {
      //    background-size: calc((1/ (var(--width)/100)) * 100%);
      //    width: calc(var(--width) * 1%)M
      // }
      // @ts-ignore
      '--spectrum-track-background-size': `${(1 / state.getThumbPercent(0)) * 100}%`
    }} />);
  let rightTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{
      width: `${(1 - state.getThumbPercent(0)) * 100}%`,
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

  let ticks = null;
  if (tickCount > 0) {
    let tickList = [];
    for (let i = 0; i < tickCount; i++) {
      let tickLabel = tickLabels ? tickLabels[i] : state.getFormattedValue(state.getPercentValue(i / (tickCount - 1)));
      tickList.push(
        <div className={classNames(styles, 'spectrum-Slider-tick')} key={i}>
          {showTickLabels &&
            <div className={classNames(styles, 'spectrum-Slider-tickLabel')}>
              {tickLabel}
            </div>
          }
        </div>
      );
    }
    ticks = (<div className={classNames(styles, 'spectrum-Slider-ticks')}>
      {tickList}
    </div>);
  }


  return (
    <div
      className={classNames(styles,
        'spectrum-Slider',
        {
          'spectrum-Slider--filled': isFilled && fillOffset == null,
          'spectrum-Slider--label-side': labelPosition === 'side',
          'is-disabled': props.isDisabled
        })}
      style={
        // @ts-ignore
        {'--spectrum-slider-track-color': trackBackground}
      }
      {...containerProps}>
      {(props.label) &&
        <div className={classNames(styles, 'spectrum-Slider-labelContainer')}>
          {props.label && labelNode}
          {labelPosition === 'top' && showValueLabel && valueNode}
        </div>
      }
      <div className={classNames(styles, 'spectrum-Slider-controls')} ref={trackRef} {...mergeProps(trackProps, hoverProps)}>
        {leftTrack}
        {ticks}
        <FocusRing within focusRingClass={classNames(styles, 'is-focused')}>
          <div
            className={classNames(styles, 'spectrum-Slider-handle', {'is-hovered': isHovered})}
            style={{left: `${state.getThumbPercent(0) * 100}%`}}
            {...thumbProps}>
            <VisuallyHidden isFocusable>
              <input className={classNames(styles, 'spectrum-Slider-input')} ref={inputRef} {...inputProps} />
            </VisuallyHidden>
          </div>
        </FocusRing>
        {rightTrack}
        {filledTrack}
      </div>
      {labelPosition === 'side' &&
        <div className={classNames(styles, 'spectrum-Slider-labelContainer')}>
          {showValueLabel && valueNode}
        </div>
      }
    </div>);
}

const _Slider = React.forwardRef(Slider);
export {_Slider as Slider};
