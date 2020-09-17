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
import {SliderProps, SpectrumRangeSliderProps} from '@react-types/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {DEFAULT_MAX_VALUE, DEFAULT_MIN_VALUE, useSliderState} from '@react-stately/slider';
import {VisuallyHidden} from '@adobe/react-spectrum';

function RangeSlider(props: SpectrumRangeSliderProps, ref: DOMRef) {
  // needed?
  useDOMRef(ref);
  props = useProviderProps(props);

  let {
    labelPosition = 'top', formatOptions, valueLabel, showValueLabel = !!props.label,
    onChange, value, defaultValue,
    tickCount, showTickLabels, tickLabels,
    ...otherProps} = props;

  let {hoverProps, isHovered} = useHover({/* isDisabled */ });

  let inputMinRef = useRef();
  let inputMaxRef = useRef();
  let trackRef = useRef();

  // Assumes that DEFAULT_MIN_VALUE and DEFAULT_MAX_VALUE are both positive, this value needs to be passed to useSliderState, so
  // getThumbMinValue/getThumbMaxValue cannot be used here.
  // `Math.abs(Math.sign(a) - Math.sign(b)) === 2` is true if the values have a different sign and neither is null.
  let alwaysDisplaySign = props.minValue != null && props.maxValue != null && Math.abs(Math.sign(props.minValue) - Math.sign(props.maxValue)) === 2;

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
    value: value != null ? [value.start, value.end] : undefined,
    defaultValue: defaultValue != null ? [defaultValue.start, defaultValue.end] :
      // make sure that useSliderState knows we have two handles
      [props.minValue ?? DEFAULT_MIN_VALUE, props.maxValue ?? DEFAULT_MAX_VALUE],
    onChange(v) {
      onChange?.({start: v[0], end: v[1]});
    }
  };

  let state = useSliderState(ariaProps);
  let {
    containerProps,
    trackProps,
    labelProps
  } = useSlider(ariaProps, state, trackRef);
  let {thumbProps: minThumbProps, inputProps: minInputProps} = useSliderThumb({
    index: 0,
    isReadOnly: props.isReadOnly,
    isDisabled: props.isDisabled,
    trackRef,
    inputRef: inputMinRef
  }, state);
  let {thumbProps: maxThumbProps, inputProps: maxInputProps} = useSliderThumb({
    index: 1,
    isReadOnly: props.isReadOnly,
    isDisabled: props.isDisabled,
    trackRef,
    inputRef: inputMaxRef
  }, state);

  // TODO intl/rtl for ranges?
  let displayValue = valueLabel ?? `${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`;
  let labelNode = <label className={classNames(styles, 'spectrum-Slider-label')} {...labelProps}>{props.label}</label>;
  let valueNode = <div className={classNames(styles, 'spectrum-Slider-value')} role="textbox" aria-readonly="true" aria-labelledby={labelProps.id}>{displayValue}</div>;

  let leftTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{width: `${state.getThumbPercent(0) * 100}%`}} />);
  let middleTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{left: `${state.getThumbPercent(0) * 100}%`, width: `${(state.getThumbPercent(1) - state.getThumbPercent(0)) * 100}%`}} />);
  let rightTrack = (<div
    className={classNames(styles, 'spectrum-Slider-track')}
    style={{width: `${(1 - state.getThumbPercent(1)) * 100}%`}} />);

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
        'spectrum-Slider--range',
        {
          'spectrum-Slider--label-side': labelPosition === 'side',
          'is-disabled': props.isDisabled
        })}
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
            {...minThumbProps}>
            <VisuallyHidden isFocusable>
              <input className={classNames(styles, 'spectrum-Slider-input')} ref={inputMinRef} {...minInputProps} />
            </VisuallyHidden>
          </div>
        </FocusRing>
        {middleTrack}
        <FocusRing within focusRingClass={classNames(styles, 'is-focused')}>
          <div
            className={classNames(styles, 'spectrum-Slider-handle', {'is-hovered': isHovered})}
            style={{left: `${state.getThumbPercent(1) * 100}%`}}
            {...maxThumbProps}>
            <VisuallyHidden isFocusable>
              <input className={classNames(styles, 'spectrum-Slider-input')} ref={inputMaxRef} {...maxInputProps} />
            </VisuallyHidden>
          </div>
        </FocusRing>
        {rightTrack}
      </div>
      {labelPosition === 'side' &&
        <div className={classNames(styles, 'spectrum-Slider-labelContainer')}>
          {showValueLabel && valueNode}
        </div>
      }
    </div>);
}

const _RangeSlider = React.forwardRef(RangeSlider);
export {_RangeSlider as RangeSlider};
