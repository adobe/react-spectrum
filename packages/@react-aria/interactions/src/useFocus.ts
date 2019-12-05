import {createEventHandler} from './createEventHandler';
import {FocusEvent, FocusEvents} from '@react-types/shared';
import {HTMLAttributes} from 'react';

interface FocusProps extends FocusEvents {
  isDisabled?: boolean
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
    onFocus = createEventHandler((e: FocusEvent) => {
      if (e.target === e.currentTarget) {
        if (props.onFocus) {
          props.onFocus(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(true);
        }
      }
    });
  }

  if (props.onBlur || props.onFocusChange) {
    onBlur = createEventHandler((e: FocusEvent) => {
      if (e.target === e.currentTarget) {
        if (props.onBlur) {
          props.onBlur(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(false);
        }
      }
    });
  }
  
  return {
    focusProps: {
      onFocus,
      onBlur
    }
  };
}
