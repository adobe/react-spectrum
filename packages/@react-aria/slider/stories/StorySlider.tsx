import {BaseSliderProps, SliderProps} from '@react-types/slider';
import {DEFAULT_MIN_VALUE, useSliderState} from '@react-stately/slider';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from './story-slider.css';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {ValueBase} from '@react-types/shared';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface StorySliderProps extends BaseSliderProps, ValueBase<number> {
  origin?: number,
  onChangeEnd?: (value: number) => void,
  showTip?: boolean
}

export function StorySlider(props: StorySliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const origin = props.origin ?? props.minValue ?? DEFAULT_MIN_VALUE;

  const multiProps: SliderProps = {
    ...props,
    value: props.value == null ? undefined :  [props.value],
    defaultValue: props.defaultValue == null ? undefined : [props.defaultValue],
    onChange: props.onChange == null ? undefined : (vals: number[]) => props.onChange(vals[0]),
    onChangeEnd: props.onChangeEnd == null ? undefined : (vals: number[]) => props.onChangeEnd(vals[0])
  };

  const state = useSliderState(multiProps);
  const {
    containerProps,
    trackProps,
    labelProps
  } = useSlider(multiProps, state, trackRef);

  const {thumbProps, inputProps} = useSliderThumb({
    index: 0,
    isReadOnly: props.isReadOnly,
    isDisabled: props.isDisabled,
    trackRef,
    inputRef
  }, state);

  const value = state.values[0];

  return (
    <div className={styles.slider} {...containerProps}>
      <div className={styles.sliderLabel}>
        {props.label && <label {...labelProps} className={styles.label}>{props.label}</label>}
        <div className={styles.value}>{state.getThumbValueLabel(0)}</div>
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
            <div {...thumbProps} className={styles.thumbHandle} />
            {props.showTip && <div className={styles.tip}>{state.getThumbValueLabel(0)}</div>}
            <VisuallyHidden isFocusable><input className={styles.input} ref={inputRef} {...inputProps} /></VisuallyHidden>
          </div>
        </FocusRing>
      </div>
    </div>
  );
}
