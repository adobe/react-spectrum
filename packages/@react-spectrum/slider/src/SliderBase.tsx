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

import {BaseSliderProps, SpectrumSliderTicksBase} from '@react-types/slider';
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {LabelPosition, Orientation, StyleProps, ValueBase} from '@react-types/shared';
import React, {CSSProperties, HTMLAttributes, MutableRefObject, ReactNode, useRef} from 'react';
import {SliderState, useSliderState} from '@react-stately/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useLocale, useNumberFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useSlider, useSliderThumb} from '@react-aria/slider';

export interface SliderBaseChildArguments {
  inputRefs: MutableRefObject<undefined>[],
  thumbProps: HTMLAttributes<HTMLElement>[],
  inputProps: HTMLAttributes<HTMLElement>[],
  ticks: ReactNode,
  state: SliderState
}

export interface SliderBaseProps extends BaseSliderProps, ValueBase<number[]>, SpectrumSliderTicksBase, StyleProps {
  children: (SliderBaseChildArguments) => ReactNode,
  formatOptions?: Intl.NumberFormatOptions,
  classes?: string[] | Object,
  style?: CSSProperties,
  count: 1 | 2,
  // SpectrumBarSliderBase:
  orientation?: Orientation,
  labelPosition?: LabelPosition,
  valueLabel?: ReactNode,
  showValueLabel?: boolean
}

function SliderBase(props: SliderBaseProps) {
  props = useProviderProps(props);
  let {
    tickCount, showTickLabels, tickLabels, isDisabled, count,
    children, classes, style,
    labelPosition = 'top', valueLabel, showValueLabel = !!props.label,
    formatOptions,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);
  let {direction} = useLocale();

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

  let state = useSliderState({...props, formatOptions});
  let trackRef = useRef();
  let {
    containerProps,
    trackProps,
    labelProps
  } = useSlider({...props, direction}, state, trackRef);

  let inputRefs = [];
  let thumbProps = [];
  let inputProps = [];
  for (let i = 0; i < count; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    inputRefs[i] = useRef();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let v = useSliderThumb({
      index: i,
      isReadOnly: props.isReadOnly,
      isDisabled: props.isDisabled,
      trackRef,
      inputRef: inputRefs[i],
      direction
    }, state);

    inputProps[i] = v.inputProps;
    thumbProps[i] = v.thumbProps;
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

  let formatter = useNumberFormatter(formatOptions);

  let displayValue = valueLabel;
  let maxLabelLength = undefined;
  if (!displayValue) {
    maxLabelLength = Math.max([...formatter.format(state.getThumbMinValue(0))].length, [...formatter.format(state.getThumbMaxValue(0))].length);
    switch (state.values.length) {
      case 1:
        displayValue = state.getThumbValueLabel(0);
        break;
      case 2:
        // This should really use the NumberFormat#formatRange proposal...
        // https://github.com/tc39/ecma402/issues/393
        // https://github.com/tc39/proposal-intl-numberformat-v3#formatrange-ecma-402-393
        displayValue = `${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`;

        maxLabelLength = 2 + 2 * Math.max(
          maxLabelLength,
          [...formatter.format(state.getThumbMinValue(1))].length, [...formatter.format(state.getThumbMaxValue(1))].length
        );
        break;
      default:
        throw new Error('Only sliders with 1 or 2 handles are supported!');
    }
  }

  let labelNode = <label className={classNames(styles, 'spectrum-Slider-label')} {...labelProps}>{props.label}</label>;
  let valueNode = (<div
    className={classNames(styles, 'spectrum-Slider-value')}
    // TODO really?
    role="textbox"
    aria-readonly="true"
    aria-labelledby={labelProps.id}
    style={{width: maxLabelLength && `${maxLabelLength}ch`}}>
    {displayValue}
  </div>);

  return (
    <div
      className={classNames(styles,
        'spectrum-Slider',
        {
          'spectrum-Slider--label-side': labelPosition === 'side',
          'is-disabled': isDisabled
        },
        classes,
        styleProps.className)}
      style={{
        ...style,
        ...styleProps.style
      }}
      {...containerProps}>
      {(props.label) &&
        <div className={classNames(styles, 'spectrum-Slider-labelContainer')} role="presentation">
          {props.label && labelNode}
          {labelPosition === 'top' && showValueLabel && valueNode}
        </div>
      }
      <div className={classNames(styles, 'spectrum-Slider-controls')} ref={trackRef} {...trackProps} role="presentation">
        {children({
          inputRefs,
          thumbProps,
          inputProps,
          ticks,
          state
        })}
      </div>
      {labelPosition === 'side' &&
        <div className={classNames(styles, 'spectrum-Slider-labelContainer')} role="presentation">
          {showValueLabel && valueNode}
        </div>
      }
    </div>
  );
}

// TODO forwardref?
export {SliderBase};
