import {ChangeEvent, HTMLAttributes, useCallback, useEffect} from 'react';
import {focusWithoutScrolling, mergeProps, useDrag1D} from '@react-aria/utils';
import {sliderIds} from './utils';
import {SliderState} from '@react-stately/slider';
import {SliderThumbProps} from '@react-types/slider';
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

interface SliderThumbOptions extends SliderThumbProps {
  trackRef: React.RefObject<HTMLElement>,
  inputRef: React.RefObject<HTMLInputElement>
}

/**
 * Provides behavior and accessibility for a thumb of a slider component.
 *
 * @param opts Options for this Slider thumb.
 * @param state Slider state, created via `useSliderState`.
 */
export function useSliderThumb(
  opts: SliderThumbOptions,
  state: SliderState,
): SliderThumbAria {
  const {
    index,
    isRequired,
    isDisabled,
    isReadOnly,
    validationState,
    trackRef,
    inputRef
  } = opts;

  let labelId = sliderIds.get(state);
  const {labelProps, fieldProps} = useLabel({
    ...opts,
    'aria-labelledby': `${labelId} ${opts['aria-labelledby'] ?? ''}`.trim()
  });

  const value = state.values[index];
  const allowDrag = !(isDisabled || isReadOnly);

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
      const percent = position / trackRef.current.offsetWidth;
      state.setThumbPercent(index, percent);
    }
  });

  const {focusableProps} = useFocusable(
    mergeProps(opts, {
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
      step: state.step,
      value: value,
      readOnly: isReadOnly,
      disabled: isDisabled,
      'aria-orientation': 'horizontal',
      'aria-valuetext': state.getThumbValueLabel(index),
      'aria-required': isRequired || undefined,
      'aria-invalid': validationState === 'invalid' || undefined,
      'aria-errormessage': opts['aria-errormessage'],
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
