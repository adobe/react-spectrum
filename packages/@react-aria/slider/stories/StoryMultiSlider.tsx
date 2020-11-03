import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SliderProps, SliderThumbProps} from '@react-types/slider';
import {SliderState, useSliderState} from '@react-stately/slider';
import styles from './story-slider.css';
import {usePress} from '@react-aria/interactions';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {VisuallyHidden} from '@react-aria/visually-hidden';


interface StoryMultiSliderProps extends SliderProps {
  children: React.ReactNode
}

export function StoryMultiSlider(props: StoryMultiSliderProps) {
  const {children} = props;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const state = useSliderState(props);
  const {
    trackProps, labelProps, containerProps
  } = useSlider(props, state, trackRef);

  const numThumbs = React.Children.count(children);
  if (numThumbs !== state.values.length) {
    throw new Error('You must have the same number of StoryThumb as the number of values in `defaultValue` or `value`.');
  }

  // Pressing the displayValue should focus the corresponding input.
  let {pressProps: outputPressProps} = usePress({
    onPress: (e) => e.target.ownerDocument && e.target.ownerDocument.getElementById(e.target.getAttribute('for')).focus()
  });

  return (
    <div {...containerProps} className={styles.slider}>
      <div className={styles.sliderLabel}>
        {props.label && <label {...labelProps} htmlFor={`${containerProps.id}-thumb-0`} className={styles.label}>{props.label}</label>}
        <div className={styles.value}>
          [
          {
            state.values.map((value, index) => (
              <output
                key={`${containerProps.id}-output-${index}`}
                {...outputPressProps}
                aria-live="off"
                aria-labelledby={`${(props.label ? labelProps.id : containerProps.id)} ${containerProps.id}-thumb-${index}`}
                htmlFor={`${containerProps.id}-thumb-${index}`}>
                {value}
                {index < state.values.length - 1 && ','}
              </output>
            ))
          }
          ]
        </div>
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
            id: `${containerProps.id}-thumb-${index}`,
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
  trackRef: React.RefObject<HTMLElement>,
  index: number
}

export function StoryThumb(props: StoryThumbProps) {
  if (!(props as any).__context) {
    throw new Error('Cannot use StoryThumb outside of a StoryMultiSlider!');
  }

  const {label, isDisabled, id} = props;
  const context = (props as any).__context as SliderStateContext;
  const {index, state, sliderProps} = context;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {inputProps, thumbProps, labelProps} = useSliderThumb({
    index,
    id,
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
