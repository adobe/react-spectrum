import {FocusEvent, HTMLAttributes, useRef} from 'react';

interface FocusWithinProps {
  isDisabled?: boolean,
  onFocusWithin?: (e: FocusEvent) => void,
  onBlurWithin?: (e: FocusEvent) => void,
  onFocusWithinChange?: (isFocusWithin: boolean) => void
}

interface FocusWithinResult {
  focusWithinProps: HTMLAttributes<HTMLElement>
}

/**
 * Handles focus events for the target and all children
 */
export function useFocusWithin(props: FocusWithinProps): FocusWithinResult {
  let state = useRef({
    isFocusWithin: false
  }).current;

  if (props.isDisabled) {
    return {focusWithinProps: {}};
  }

  let onFocus, onBlur;
  if (props.onFocusWithin || props.onFocusWithinChange) {
    onFocus = (e: FocusEvent) => {
      if (!state.isFocusWithin) {
        if (props.onFocusWithin) {
          props.onFocusWithin(e);
        }

        if (props.onFocusWithinChange) {
          props.onFocusWithinChange(true);
        }

        state.isFocusWithin = true;
      }
    };
  }

  if (props.onBlurWithin || props.onFocusWithinChange) {
    onBlur = (e: FocusEvent) => {
      if (state.isFocusWithin && !e.currentTarget.contains(e.relatedTarget as HTMLElement)) {
        if (props.onBlurWithin) {
          props.onBlurWithin(e);
        }

        if (props.onFocusWithinChange) {
          props.onFocusWithinChange(false);
        }

        state.isFocusWithin = false;
      }
    };
  }
  
  return {
    focusWithinProps: {
      onFocusCapture: onFocus,
      onBlurCapture: onBlur
    }
  };
}
