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
import {FocusableRef} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React from 'react';
import {SliderBase, SliderBaseChildArguments, SliderBaseProps} from './SliderBase';
import {SliderThumb} from './SliderThumb';
import {SpectrumRangeSliderProps} from '@react-types/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';

/**
 * RangeSliders allow users to quickly select a subset range. They should be used when the upper and lower bounds to the range are invariable.
 */
export const RangeSlider = React.forwardRef(function RangeSlider(props: SpectrumRangeSliderProps, ref: FocusableRef<HTMLDivElement>) {
  let {onChange, onChangeEnd, value, defaultValue, getValueLabel, ...otherProps} = props;

  let baseProps: Omit<SliderBaseProps<number[]>, 'children'> = {
    ...otherProps,
    value: value != null ? [value.start, value.end] : undefined,
    defaultValue: defaultValue != null
      ? [defaultValue.start, defaultValue.end]
      // make sure that useSliderState knows we have two handles
      : [props.minValue ?? 0, props.maxValue ?? 100],
    onChange(v) {
      onChange?.({start: v[0], end: v[1]});
    },
    onChangeEnd(v) {
      onChangeEnd?.({start: v[0], end: v[1]});
    },
    getValueLabel: getValueLabel ? ([start, end]) => getValueLabel({start, end}) : undefined
  };

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/slider');
  let {direction} = useLocale();

  return (
    <SliderBase {...baseProps} classes={'spectrum-Slider--range'} ref={ref}>
      {({trackRef, inputRef, state}: SliderBaseChildArguments) => {
        let cssDirection = direction === 'rtl' ? 'right' : 'left';
        return (
          <>
            <div
              className={classNames(styles, 'spectrum-Slider-track')}
              style={{width: `${state.getThumbPercent(0) * 100}%`}} />
            <SliderThumb
              index={0}
              aria-label={stringFormatter.format('minimum')}
              isDisabled={props.isDisabled}
              trackRef={trackRef}
              inputRef={inputRef}
              state={state}
              name={props.startName} />
            <div
              className={classNames(styles, 'spectrum-Slider-track')}
              style={{
                [cssDirection]: `${state.getThumbPercent(0) * 100}%`,
                width: `${Math.abs(state.getThumbPercent(0) - state.getThumbPercent(1)) * 100}%`
              }} />
            <SliderThumb
              index={1}
              aria-label={stringFormatter.format('maximum')}
              isDisabled={props.isDisabled}
              trackRef={trackRef}
              state={state}
              name={props.endName} />
            <div
              className={classNames(styles, 'spectrum-Slider-track')}
              style={{
                width: `${(1 - state.getThumbPercent(1)) * 100}%`
              }} />
          </>
        );
      }}
    </SliderBase>
  );
});
