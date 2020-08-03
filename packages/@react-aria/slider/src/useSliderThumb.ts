import {BaseSliderProps, SliderThumbProps} from '@react-types/slider';
import {ChangeEvent, HTMLAttributes, useCallback, useEffect} from 'react';
import {computeOffsetToValue} from './utils';
import {DEFAULT_STEP_VALUE, SliderState} from '@react-stately/slider';
import {focusWithoutScrolling, mergeProps, useDrag1D} from '@react-aria/utils';
import {useFocusable} from '@react-aria/focus';
import {useLabel} from '@react-aria/label';

interface SliderThumbAria {
  /** Props for the range input. */
  inputProps: HTMLAttributes<HTMLElement>,

  /** Props for the root thumb element; handles the dragging motion. */
  thumbProps: HTMLAttributes<HTMLElement>,
  
  /** Props for the label element for this thumb. */
  labelProps: HTMLAttributes<HTMLElement>
}

interface SliderThumbOptions {
  sliderProps: BaseSliderProps,
  thumbProps: SliderThumbProps,
  trackRef: React.RefObject<HTMLElement>,
  inputRef: React.RefObject<HTMLInputElement>
}

/**
 * Provides behavior and accessibility for a thumb of a slider component.
 * 
 * @param sliderProps Props used for the Slider component.
 * @param thumbProps Props used for this specific thumb.
 * @param state Slider state, created via `useSliderState`.
 * @param trackRef Ref for the track element.
 * @param inputRef Ref for the range input element.
 */
export function useSliderThumb(
  opts: SliderThumbOptions,
  state: SliderState,
): SliderThumbAria {
  const {sliderProps, thumbProps, trackRef, inputRef} = opts;
  const {
    step = DEFAULT_STEP_VALUE,
    isReadOnly: isSliderReadOnly,
    isDisabled: isSliderDisabled
  } = sliderProps;

  const {
    index,
    isRequired,
    isDisabled,
    isReadOnly,
    validationState,
    labelId
  } = thumbProps;

  const {labelProps, fieldProps} = useLabel({
    ...thumbProps,
    'aria-labelledby': `${labelId} ${thumbProps['aria-labelledby'] ?? ''}`.trim()
  });

  const value = state.values[index];
  const allowDrag = !(isSliderDisabled || isSliderReadOnly || isDisabled || isReadOnly);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      focusWithoutScrolling(inputRef.current);
    }
  }, [inputRef]);

  const isFocused = state.focusedThumb === index;

  useEffect(() => {
    if (isFocused) {
      focusInput();
    }
  }, [isFocused, focusInput]);

  const draggableProps = useDrag1D({
    containerRef: trackRef as any,
    reverse: false,
    orientation: 'horizontal',
    onDrag: (dragging) => {
      state.setThumbDragging(index, dragging);
      focusInput();
    },
    onPositionChange: (position) => {
      state.setThumbValue(index, computeOffsetToValue(position, sliderProps, trackRef));
    }
  });

  const {focusableProps} = useFocusable(
    mergeProps(thumbProps, {
      onFocus: () => state.setFocusedThumb(index),
      onBlur: () => state.setFocusedThumb(undefined)
    }),
    inputRef
  );

  // We install mouse handlers for the drag motion on the thumb div, but 
  // not the key handler for moving the thumb with the slider.  Instead,
  // we focus the range input, and let the browser handle the keyboard
  // interactions; we then listen to input's onChange to update state.
  return {
    inputProps: mergeProps(focusableProps, fieldProps, {
      type: 'range',
      tabIndex: allowDrag ? 0 : undefined,
      min: state.getThumbMinValue(index),
      max: state.getThumbMaxValue(index),
      step: step,
      value: value,
      readOnly: isReadOnly,
      disabled: isDisabled,
      'aria-orientation': 'horizontal',
      'aria-valuetext': state.getThumbValueLabel(index),
      'aria-required': isRequired || undefined,
      'aria-invalid': validationState === 'invalid' || undefined,
      'aria-errormessage': thumbProps['aria-errormessage'],
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        state.setThumbValue(index, parseFloat(e.target.value));
      }
    }),
    thumbProps: allowDrag ? mergeProps({
      onMouseDown: draggableProps.onMouseDown,
      onMouseEnter: draggableProps.onMouseEnter,
      onMouseOut: draggableProps.onMouseOut
    }, {
      onMouseDown: focusInput
    }) : {},
    labelProps
  };
}
