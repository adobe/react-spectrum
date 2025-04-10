import {AriaSliderProps} from '@react-types/slider';
import {FocusRing} from '@react-aria-nutrient/focus';
import React from 'react';
import styles from './story-slider.css';
import {useNumberFormatter} from '@react-aria-nutrient/i18n';
import {useSlider, useSliderThumb} from '@react-aria-nutrient/slider';
import {useSliderState} from '@react-stately/slider';
import {VisuallyHidden} from '@react-aria-nutrient/visually-hidden';


interface StoryRangeSliderProps extends AriaSliderProps {
  showTip?: boolean,
  formatOptions?: Intl.NumberFormatOptions
}

export function StoryRangeSlider(props: StoryRangeSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const minInputRef = React.useRef<HTMLInputElement>(null);
  const maxInputRef = React.useRef<HTMLInputElement>(null);
  const formatter = useNumberFormatter(props.formatOptions);
  const state = useSliderState({...props, numberFormatter: formatter});

  if (state.values.length !== 2) {
    throw new Error('Must specify an array of two numbers');
  }

  const {
    trackProps, labelProps, groupProps, outputProps
  } = useSlider(props, state, trackRef);

  const {thumbProps: minThumbProps, inputProps: minInputProps} = useSliderThumb({
    index: 0,
    'aria-label': 'Minimum',
    isDisabled: props.isDisabled,
    trackRef,
    inputRef: minInputRef
  }, state);

  const {thumbProps: maxThumbProps, inputProps: maxInputProps} = useSliderThumb({
    index: 1,
    'aria-label': 'Maximum',
    isDisabled: props.isDisabled,
    trackRef,
    inputRef: maxInputRef
  }, state);

  return (
    <div {...groupProps} className={styles.slider}>
      <div className={styles.sliderLabel}>
        {props.label && <label {...labelProps} className={styles.label}>{props.label}</label>}
        <output {...outputProps} className={styles.value}>
          {state.getThumbValueLabel(0)}
          {' to '}
          {state.getThumbValueLabel(1)}
        </output>
      </div>
      <div className={styles.trackContainer}>
        {
          // We make rail and filledRail children of track. User can click on the track, the
          // rail, or the filledRail to drag by track
        }
        <div ref={trackRef} className={styles.track} {...trackProps}>
          <div className={styles.rail} />
          <div
            className={styles.filledRail}
            style={{
              left: `${state.getThumbPercent(0) * 100}%`,
              width: `${(state.getThumbPercent(1) - state.getThumbPercent(0)) * 100}%`
            }} />
        </div>
        <FocusRing within focusRingClass={styles.thumbFocusVisible} focusClass={styles.thumbFocused}>
          <div
            className={styles.thumb}
            style={{
              'left': `${state.getThumbPercent(0) * 100}%`
            }}>
            {
              // We put thumbProps on thumbHandle, so that you cannot drag by the tip
            }
            <div {...minThumbProps} className={styles.thumbHandle}>
              <VisuallyHidden><input className={styles.input} ref={minInputRef} {...minInputProps} /></VisuallyHidden>
            </div>
            {props.showTip && <div className={styles.tip}>{state.getThumbValueLabel(0)}</div>}
          </div>
        </FocusRing>
        <FocusRing within focusRingClass={styles.thumbFocusVisible} focusClass={styles.thumbFocused}>
          <div
            className={styles.thumb}
            {...maxThumbProps}
            style={{
              'left': `${state.getThumbPercent(1) * 100}%`
            }}>
            {
              // For fun, we put the thumbProps on the thumb container instead of just the handle.
              // This means you can drag the max thumb by the tip.
            }
            <div className={styles.thumbHandle}>
              <VisuallyHidden><input className={styles.input} ref={maxInputRef} {...maxInputProps} /></VisuallyHidden>
            </div>
            {props.showTip && <div className={styles.tip}>{state.getThumbValueLabel(1)} (can drag by tip)</div>}
          </div>
        </FocusRing>
      </div>
    </div>
  );
}
