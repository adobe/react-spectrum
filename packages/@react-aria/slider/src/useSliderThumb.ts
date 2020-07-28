import {BaseSliderProps, SliderThumbProps} from '@react-types/slider';
import {chain, focusWithoutScrolling, mergeProps, useDrag1D} from '@react-aria/utils';
import {computeOffsetToValue} from './utils';
import {DEFAULT_MAX_VALUE, DEFAULT_MIN_VALUE, DEFAULT_STEP_VALUE, SliderState} from '@react-stately/slider';
import {HTMLAttributes, useCallback, useEffect} from 'react';
import {useFocusable} from '@react-aria/focus';
import {useLabel} from '@react-aria/label';

interface SliderThumbAria {
  /** Props for the range input. */
  inputProps: HTMLAttributes<HTMLElement>;

  /** Props for the root thumb element; handles the dragging motion. */
  thumbProps: HTMLAttributes<HTMLElement>;
  
  /** Props for the label element for this thumb. */
  labelProps: HTMLAttributes<HTMLElement>;
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
  sliderProps: BaseSliderProps,
  thumbProps: SliderThumbProps,
  state: SliderState,
  trackRef: React.RefObject<HTMLElement>,
  inputRef: React.RefObject<HTMLInputElement>
): SliderThumbAria {
  const {
    maxValue = DEFAULT_MAX_VALUE,
    minValue = DEFAULT_MIN_VALUE,
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

  const isFocused = state.focusedIndex === index;

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
      state.setDragging(index, dragging);
      console.log('THUMB FOCUS');
      focusInput();
    },
    onPositionChange: (position) => {
      state.setValue(index, computeOffsetToValue(position, sliderProps, trackRef));
    },
    onIncrement: () => state.setValue(index, value + step),
    onDecrement: () => state.setValue(index, value - step),
    onIncrementToMax: () => state.setValue(index, maxValue),
    onDecrementToMin: () => state.setValue(index, minValue)
  });

  const {focusableProps} = useFocusable(
    mergeProps(thumbProps, {
      onFocus: () => state.setFocusedIndex(index),
      onBlur: () => state.setFocusedIndex(undefined)
    }),
    inputRef
  );

  return {
    inputProps: mergeProps(focusableProps, fieldProps, {
      type: 'range',
      tabIndex: allowDrag ? 0 : undefined,
      'aria-valuenow': value,
      'aria-valuemin': state.getMinValueForIndex(index),
      'aria-valuemax': state.getMaxValueForIndex(index),
      'aria-readonly': isReadOnly || undefined,
      'aria-disabled': isDisabled || undefined,
      'aria-orientation': 'horizontal',
      'aria-valuetext': state.getValueLabelForIndex(index),
      'aria-required': isRequired || undefined,
      'aria-invalid': validationState === 'invalid' || undefined,
      'aria-errormessage': thumbProps['aria-errormessage'],
      onKeyDown: allowDrag ? draggableProps.onKeyDown : undefined
    }),
    thumbProps: {
      onMouseDown: allowDrag ? chain(draggableProps.onMouseDown, () => focusInput()) : undefined,
      onMouseEnter: allowDrag ? draggableProps.onMouseEnter : undefined,
      onMouseOut: allowDrag ? draggableProps.onMouseOut : undefined
    },
    labelProps
  };
}
