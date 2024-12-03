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

import {classNames, SlotProvider, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef, RefObject} from '@react-types/shared';
import React, {CSSProperties, ReactNode, useRef} from 'react';
import {SliderState, useSliderState} from '@react-stately/slider';
import {SpectrumBarSliderBase} from '@react-types/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useNumberFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useSlider} from '@react-aria/slider';

export interface SliderBaseChildArguments {
  inputRef: RefObject<HTMLInputElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  state: SliderState
}

export interface SliderBaseProps<T = number[]> extends SpectrumBarSliderBase<T> {
  children: (opts: SliderBaseChildArguments) => ReactNode,
  classes?: string[] | Object,
  style?: CSSProperties
}

export const SliderBase = React.forwardRef(function SliderBase(props: SliderBaseProps, ref: FocusableRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    isDisabled,
    children,
    classes,
    style,
    labelPosition = 'top',
    getValueLabel,
    showValueLabel = !!props.label,
    formatOptions,
    minValue = 0,
    maxValue = 100,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);

  // `Math.abs(Math.sign(a) - Math.sign(b)) === 2` is true if the values have a different sign.
  let alwaysDisplaySign = Math.abs(Math.sign(minValue) - Math.sign(maxValue)) === 2;
  if (alwaysDisplaySign) {
    if (formatOptions != null) {
      if (!('signDisplay' in formatOptions)) {
        formatOptions = {
          ...formatOptions,
          signDisplay: 'exceptZero'
        };
      }
    } else {
      formatOptions = {signDisplay: 'exceptZero'};
    }
  }

  const formatter = useNumberFormatter(formatOptions);
  const state = useSliderState({
    ...props,
    numberFormatter: formatter,
    minValue,
    maxValue
  });
  let trackRef = useRef<HTMLDivElement | null>(null);
  let {
    groupProps,
    trackProps,
    labelProps,
    outputProps
  } = useSlider(props, state, trackRef);

  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);

  let displayValue = '';
  let maxLabelLength: number | null = null;

  if (typeof getValueLabel === 'function') {
    displayValue = getValueLabel(state.values);
    switch (state.values.length) {
      case 1:
        maxLabelLength = Math.max(
          getValueLabel([minValue]).length,
          getValueLabel([maxValue]).length
        );
        break;
      case 2:
        // Try all possible combinations of min and max values.
        maxLabelLength = Math.max(
          getValueLabel([minValue, minValue]).length,
          getValueLabel([minValue, maxValue]).length,
          getValueLabel([maxValue, minValue]).length,
          getValueLabel([maxValue, maxValue]).length
        );
        break;
      default:
        throw new Error('Only sliders with 1 or 2 handles are supported!');
    }
  } else {
    maxLabelLength = Math.max([...formatter.format(minValue)].length, [...formatter.format(maxValue)].length);
    switch (state.values.length) {
      case 1:
        displayValue = state.getThumbValueLabel(0);
        break;
      case 2:
        // This should really use the NumberFormat#formatRange proposal...
        // https://github.com/tc39/ecma402/issues/393
        // https://github.com/tc39/proposal-intl-numberformat-v3#formatrange-ecma-402-393
        displayValue = `${state.getThumbValueLabel(0)} – ${state.getThumbValueLabel(1)}`;
        maxLabelLength = 3 + 2 * Math.max(
          maxLabelLength,
          [...formatter.format(minValue)].length, [...formatter.format(maxValue)].length
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
      style={maxLabelLength != null ? {width: `${maxLabelLength}ch`, minWidth: `${maxLabelLength}ch`} : undefined}>
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
      {...groupProps}>
      {(props.label) &&
        <div className={classNames(styles, 'spectrum-Slider-labelContainer')} role="presentation">
          {props.label && labelNode}
          {props.contextualHelp &&
            <SlotProvider
              slots={{
                actionButton: {
                  UNSAFE_className: classNames(styles, 'spectrum-Slider-contextualHelp')
                }
              }}>
              {props.contextualHelp}
            </SlotProvider>
          }
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
        <div className={classNames(styles, 'spectrum-Slider-valueLabelContainer')} role="presentation">
          {showValueLabel && valueNode}
        </div>
      }
    </div>
  );
});
