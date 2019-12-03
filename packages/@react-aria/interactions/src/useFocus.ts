import {FocusEvent, HTMLAttributes} from 'react';

interface FocusProps {
  isDisabled?: boolean,
  onFocus?: (e: FocusEvent) => void,
  onBlur?: (e: FocusEvent) => void,
  onFocusChange?: (isFocused: boolean) => void
}

interface FocusResult {
  focusProps: HTMLAttributes<HTMLElement>
}

/**
 * Handles focus events for the immediate target (no children)
 */
export function useFocus(props: FocusProps): FocusResult {
  if (props.isDisabled) {
    return {focusProps: {}};
  }

  let onFocus, onBlur;
  if (props.onFocus || props.onFocusChange) {
    onFocus = (e: FocusEvent) => {
      if (e.target === e.currentTarget) {
        if (props.onFocus) {
          props.onFocus(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(true);
        }
      }
    };
  }

  if (props.onBlur || props.onFocusChange) {
    onBlur = (e: FocusEvent) => {
      if (e.target === e.currentTarget) {
        if (props.onBlur) {
          props.onBlur(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(false);
        }
      }
    };
  }
  
  return {
    focusProps: {
      onFocus,
      onBlur
    }
  };
}
