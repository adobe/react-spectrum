import {FocusRing} from '@react-aria/focus';
import {SliderProps} from '@react-types/slider';
import React from 'react';
import styles from './story-slider.css';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {useSliderState} from '@react-stately/slider';
import {VisuallyHidden} from '@react-aria/visually-hidden';


interface StoryRangeSliderProps extends SliderProps {
  minLabel?: string;
  maxLabel?: string;
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
    trackProps, labelProps, labelId, containerProps
  } = useSlider(props, state, trackRef);

  const {thumbProps: minThumbProps, inputProps: minInputProps} = useSliderThumb(
    props, {...props, index: 0, labelId, 'aria-label': minLabel ?? 'Minimum'}, state, trackRef, minInputRef);

  const {thumbProps: maxThumbProps, inputProps: maxInputProps} = useSliderThumb(
    props, {...props, index: 1, labelId, 'aria-label': maxLabel ?? 'Maximum'}, state, trackRef, maxInputRef);

  return (
    <div {...containerProps} className={styles.slider}>
      <div className={styles.sliderLabel}>
        {props.label && <label {...labelProps} className={styles.label}>{props.label}</label>}
        <div className={styles.value}>
          {state.getValueLabelForIndex(0)}
          {' to '}
          {state.getValueLabelForIndex(1)}
        </div>
      </div>
      <div className={styles.trackContainer}>
        <div className={styles.rail} />
        <div 
          className={styles.filledRail} 
          style={{
            left: `${state.getOffsetPercentForIndex(0) * 100}%`,
            width: `${(state.getOffsetPercentForIndex(1) - state.getOffsetPercentForIndex(0)) * 100}%`
          }} />
        <div {...trackProps} ref={trackRef} className={styles.track} />
        <FocusRing within focusRingClass={styles.thumbFocusVisible} focusClass={styles.thumbFocused}>
          <div 
            {...minThumbProps} 
            className={styles.thumb}
            style={{
              'left': `${state.getOffsetPercentForIndex(0) * 100}%`
            }}>
            <VisuallyHidden isFocusable><input className={styles.input} ref={minInputRef} {...minInputProps} /></VisuallyHidden>
          </div>
        </FocusRing>
        <FocusRing within focusRingClass={styles.thumbFocusVisible} focusClass={styles.thumbFocused}>
          <div 
            {...maxThumbProps} 
            className={styles.thumb}
            style={{
              'left': `${state.getOffsetPercentForIndex(1) * 100}%`
            }}>
            <VisuallyHidden isFocusable><input className={styles.input} ref={maxInputRef} {...maxInputProps} /></VisuallyHidden>
          </div>
        </FocusRing>
      </div>
    </div>
  );
}
