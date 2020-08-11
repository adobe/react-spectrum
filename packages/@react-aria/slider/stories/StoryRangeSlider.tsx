import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SliderProps} from '@react-types/slider';
import styles from './story-slider.css';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {useSliderState} from '@react-stately/slider';
import {VisuallyHidden} from '@react-aria/visually-hidden';


interface StoryRangeSliderProps extends SliderProps {
  minLabel?: string,
  maxLabel?: string
}

export function StoryRangeSlider(props: StoryRangeSliderProps) {
  const {minLabel, maxLabel} = props;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const minInputRef = React.useRef<HTMLInputElement>(null);
  const maxInputRef = React.useRef<HTMLInputElement>(null);
  const state = useSliderState(props);

  if (state.values.length !== 2) {
    throw new Error('Must specify an array of two numbers');
  }

  const {
    trackProps, labelProps, containerProps
  } = useSlider(props, state, trackRef);

  const {thumbProps: minThumbProps, inputProps: minInputProps} = useSliderThumb({
    index: 0,
    'aria-label': minLabel ?? 'Minimum',
    isReadOnly: props.isReadOnly,
    isDisabled: props.isDisabled,
    trackRef,
    inputRef: minInputRef
  }, state);

  const {thumbProps: maxThumbProps, inputProps: maxInputProps} = useSliderThumb({
    index: 1,
    'aria-label': maxLabel ?? 'Maximum',
    isReadOnly: props.isReadOnly,
    isDisabled: props.isDisabled,
    trackRef,
    inputRef: maxInputRef
  }, state);

  return (
    <div {...containerProps} className={styles.slider}>
      <div className={styles.sliderLabel}>
        {props.label && <label {...labelProps} className={styles.label}>{props.label}</label>}
        <div className={styles.value}>
          {state.getThumbValueLabel(0)}
          {' to '}
          {state.getThumbValueLabel(1)}
        </div>
      </div>
      <div className={styles.trackContainer}>
        <div className={styles.rail} />
        <div
          className={styles.filledRail}
          style={{
            left: `${state.getThumbPercent(0) * 100}%`,
            width: `${(state.getThumbPercent(1) - state.getThumbPercent(0)) * 100}%`
          }} />
        <div {...trackProps} ref={trackRef} className={styles.track} />
        <FocusRing within focusRingClass={styles.thumbFocusVisible} focusClass={styles.thumbFocused}>
          <div
            {...minThumbProps}
            className={styles.thumb}
            style={{
              'left': `${state.getThumbPercent(0) * 100}%`
            }}>
            <VisuallyHidden isFocusable><input className={styles.input} ref={minInputRef} {...minInputProps} /></VisuallyHidden>
          </div>
        </FocusRing>
        <FocusRing within focusRingClass={styles.thumbFocusVisible} focusClass={styles.thumbFocused}>
          <div
            {...maxThumbProps}
            className={styles.thumb}
            style={{
              'left': `${state.getThumbPercent(1) * 100}%`
            }}>
            <VisuallyHidden isFocusable><input className={styles.input} ref={maxInputRef} {...maxInputProps} /></VisuallyHidden>
          </div>
        </FocusRing>
      </div>
    </div>
  );
}
