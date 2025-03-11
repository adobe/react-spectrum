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
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SliderProps, SliderThumbProps} from '@react-types/slider';
import {SliderState, useSliderState} from '@react-stately/slider';
import styles from './story-slider.css';
import {useNumberFormatter} from '@react-aria/i18n';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {VisuallyHidden} from '@react-aria/visually-hidden';


interface StoryMultiSliderProps extends SliderProps {
  children: React.ReactNode,
  formatOptions?: Intl.NumberFormatOptions
}

export function StoryMultiSlider(props: StoryMultiSliderProps) {
  const {children} = props;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const formatter = useNumberFormatter(props.formatOptions);
  const state = useSliderState({...props, numberFormatter: formatter});
  const {
    trackProps,
    labelProps,
    groupProps,
    outputProps
  } = useSlider(props, state, trackRef);

  const numThumbs = React.Children.count(children);
  if (numThumbs !== state.values.length) {
    throw new Error('You must have the same number of StoryThumb as the number of values in `defaultValue` or `value`.');
  }

  return (
    <div {...groupProps} className={styles.slider}>
      <div className={styles.sliderLabel}>
        {props.label && <label {...labelProps} className={styles.label}>{props.label}</label>}
        <output {...outputProps} className={styles.value}>
          {JSON.stringify(state.values)}
        </output>
      </div>
      {
        // We make rail and all thumbs children of the trackRef.  That means dragging on the thumb
        // will also trigger the dragging handlers on the track, so we need to make sure we don't
        // double-handle these events.
      }
      <div ref={trackRef} className={styles.track} {...trackProps}>
        <div className={styles.rail} />
        {React.Children.map(children, ((child, index) =>
          React.cloneElement(child as React.ReactElement, {
            __context: {
              sliderProps: props,
              state,
              trackRef,
              index
            }
          } as any)))}
      </div>
    </div>
  );
}


interface StoryThumbProps extends Omit<SliderThumbProps, 'index'> {
}

interface SliderStateContext {
  sliderProps: StoryMultiSliderProps,
  state: SliderState,
  trackRef: React.RefObject<Element | null>,
  index: number
}

export function StoryThumb(props: StoryThumbProps) {
  if (!(props as any).__context) {
    throw new Error('Cannot use StoryThumb outside of a StoryMultiSlider!');
  }

  const {label, isDisabled} = props;
  const context = (props as any).__context as SliderStateContext;
  const {index, state, sliderProps} = context;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {inputProps, thumbProps, labelProps} = useSliderThumb({
    index,
    ...props,
    isDisabled: sliderProps.isDisabled || props.isDisabled,
    trackRef: context.trackRef,
    inputRef
  }, state);

  return (
    <FocusRing within focusRingClass={styles.thumbFocusVisible} focusClass={styles.thumbFocused}>
      <div
        {...thumbProps}
        className={classNames(styles, 'thumb', 'thumbHandle', {thumbDisabled: isDisabled})}
        style={{
          'left': `${state.getThumbPercent(index) * 100}%`
        }}>
        <VisuallyHidden isFocusable><input className={styles.input} ref={inputRef} {...inputProps} /></VisuallyHidden>
        {label && <label {...labelProps}>{label}</label>}
      </div>
    </FocusRing>
  );
}
