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

import {AriaSliderProps} from '@react-types/slider';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from './story-slider.css';
import {useNumberFormatter} from '@react-aria/i18n';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {useSliderState} from '@react-stately/slider';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface StorySliderProps extends AriaSliderProps<number> {
  origin?: number,
  showTip?: boolean,
  formatOptions?: Intl.NumberFormatOptions
}

export function StorySlider(props: StorySliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const origin = props.origin ?? props.minValue ?? 0;

  const multiProps: AriaSliderProps<number[]> = {
    ...props,
    value: props.value == null ? undefined :  [props.value],
    defaultValue: props.defaultValue == null ? undefined : [props.defaultValue],
    onChange: props.onChange == null ? undefined : (vals: number[]) => props.onChange?.(vals[0]),
    onChangeEnd: props.onChangeEnd == null ? undefined : (vals: number[]) => props.onChangeEnd?.(vals[0])
  };
  const formatter = useNumberFormatter(props.formatOptions);
  const state = useSliderState({...multiProps, numberFormatter: formatter});
  const {
    groupProps,
    trackProps,
    labelProps,
    outputProps
  } = useSlider(multiProps, state, trackRef);

  const {thumbProps, inputProps} = useSliderThumb({
    index: 0,
    isDisabled: props.isDisabled,
    trackRef,
    inputRef
  }, state);

  const value = state.values[0];

  return (
    <div className={styles.slider} {...groupProps}>
      <div className={styles.sliderLabel}>
        {props.label && <label {...labelProps} className={styles.label}>{props.label}</label>}
        <output {...outputProps} className={styles.value}>{state.getThumbValueLabel(0)}</output>
      </div>
      <div className={styles.trackContainer}>
        {
          // We make rail, filledRail, and track siblings in the DOM, so that trackRef has no children.
          // User must click on the trackRef to drag by track, and so it comes last in the DOM.
        }
        <div className={styles.rail} />
        <div
          className={styles.filledRail}
          style={{
            left: `${state.getValuePercent(Math.min(value, origin)) * 100}%`,
            width: `${(state.getValuePercent(Math.max(value, origin)) - state.getValuePercent(Math.min(value, origin))) * 100}%`
          }} />
        <div ref={trackRef} className={styles.track} {...trackProps} />
        <FocusRing within focusRingClass={styles.thumbFocusVisible} focusClass={styles.thumbFocused}>
          <div
            className={styles.thumb}
            style={{
              'left': `${state.getThumbPercent(0) * 100}%`
            }}>
            {/* We put thumbProps on thumbHandle, so that you cannot drag by the tip */}
            <div {...thumbProps} className={styles.thumbHandle}>
              <VisuallyHidden><input className={styles.input} ref={inputRef} {...inputProps} /></VisuallyHidden>
            </div>
            {props.showTip && <div className={styles.tip}>{state.getThumbValueLabel(0)}</div>}
          </div>
        </FocusRing>
      </div>
    </div>
  );
}
