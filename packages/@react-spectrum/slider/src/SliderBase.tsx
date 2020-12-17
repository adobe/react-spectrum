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

import {classNames, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import React, {CSSProperties, ReactNode, RefObject, useRef} from 'react';
import {SliderState, useSliderState} from '@react-stately/slider';
import {SpectrumBarSliderBase} from '@react-types/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useNumberFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useSlider} from '@react-aria/slider';

export interface SliderBaseChildArguments {
  inputRef: RefObject<HTMLInputElement>,
  trackRef: RefObject<HTMLElement>,
  state: SliderState
}

export interface SliderBaseProps<T = number[]> extends SpectrumBarSliderBase<T> {
  children: (opts: SliderBaseChildArguments) => ReactNode,
  classes?: string[] | Object,
  style?: CSSProperties
}

function SliderBase(props: SliderBaseProps, ref: FocusableRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    isDisabled,
    children,
    classes,
    style,
    labelPosition = 'top',
    valueLabel,
    showValueLabel = !!props.label,
    formatOptions,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);

  // Assumes that DEFAULT_MIN_VALUE and DEFAULT_MAX_VALUE are both positive, this value needs to be passed to useSliderState, so
  // getThumbMinValue/getThumbMaxValue cannot be used here.
  // `Math.abs(Math.sign(a) - Math.sign(b)) === 2` is true if the values have a different sign and neither is null.
  let alwaysDisplaySign = props.minValue != null && props.maxValue != null && Math.abs(Math.sign(props.minValue) - Math.sign(props.maxValue)) === 2;
  if (alwaysDisplaySign) {
    if (formatOptions != null) {
      if (!('signDisplay' in formatOptions)) {
        formatOptions = {
          ...formatOptions,
          // @ts-ignore
          signDisplay: 'exceptZero'
        };
      }
    } else {
      // @ts-ignore
      formatOptions = {signDisplay: 'exceptZero'};
    }
  }

  const formatter = useNumberFormatter(formatOptions);
  const state = useSliderState({...props, numberFormatter: formatter});
  let trackRef = useRef();
  let {
    containerProps,
    trackProps,
    labelProps,
    outputProps
  } = useSlider(props, state, trackRef);

  let inputRef = useRef();
  let domRef = useFocusableRef(ref, inputRef);

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
        displayValue = `${state.getThumbValueLabel(0)} – ${state.getThumbValueLabel(1)}`;
        maxLabelLength = 2 + 2 * Math.max(
          maxLabelLength,
          [...formatter.format(state.getThumbMinValue(1))].length, [...formatter.format(state.getThumbMaxValue(1))].length
        );
        break;
      default:
        throw new Error('Only sliders with 1 or 2 handles are supported!');
    }
  }

  let labelNode = (
    <label
      className={classNames(styles, 'spectrum-Slider-label')}
      {...labelProps}>
      {props.label}
    </label>
  );

  let valueNode = (
    <output
      {...outputProps}
      className={classNames(styles, 'spectrum-Slider-value')}
      style={maxLabelLength && {width: `${maxLabelLength}ch`, minWidth: `${maxLabelLength}ch`}}>
      {displayValue}
    </output>
  );

  return (
    <div
      ref={domRef}
      className={classNames(styles,
        'spectrum-Slider',
        {
          'spectrum-Slider--positionTop': labelPosition === 'top',
          'spectrum-Slider--positionSide': labelPosition === 'side',
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
          trackRef,
          inputRef,
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

const _SliderBase = React.forwardRef(SliderBase);
export {_SliderBase as SliderBase};
