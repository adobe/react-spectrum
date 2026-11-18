import {DOMAttributes, FocusableElement} from '@react-types/shared';
import {FocusEvent, useCallback, useRef, useState} from 'react';
import {getEventTarget, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {isFocusVisible, useFocusVisibleListener} from '../interactions/useFocusVisible';
import {isVirtualFocusEvent} from './virtualFocus';
import {useFocus} from '../interactions/useFocus';
import {useFocusWithin} from '../interactions/useFocusWithin';

export interface AriaFocusRingProps {
  /**
   * Whether to show the focus ring when something
   * inside the container element has focus (true), or
   * only if the container itself has focus (false).
   *
   * @default 'false'
   */
  within?: boolean;

  /** Whether the element is a text input. */
  isTextInput?: boolean;

  /** Whether the element will be auto focused. */
  autoFocus?: boolean;
}

export interface FocusRingAria {
  /** Whether the element is currently focused. */
  isFocused: boolean;

  /** Whether keyboard focus should be visible. */
  isFocusVisible: boolean;

  /** Props to apply to the container element with the focus ring. */
  focusProps: DOMAttributes;
}

/**
 * Determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard,
 * not with a mouse, touch, or other input methods.
 */
export function useFocusRing(props: AriaFocusRingProps = {}): FocusRingAria {
  let {autoFocus = false, isTextInput, within} = props;
  let state = useRef({
    isFocused: false,
    isFocusVisible: autoFocus || isFocusVisible(),
    // Whether virtual focus (aria-activedescendant) has moved outside the container
    // while real focus stays within it, e.g. to an option in an Autocomplete.
    isVirtuallyFocusedOutside: false
  });
  let [isFocused, setFocused] = useState(false);
  let [isFocusVisibleState, setFocusVisible] = useState(
    // oxlint-disable-next-line react/react-compiler
    () => state.current.isFocused && state.current.isFocusVisible
  );

  let updateState = useCallback(
    () =>
      setFocusVisible(
        state.current.isFocused &&
          state.current.isFocusVisible &&
          !state.current.isVirtuallyFocusedOutside
      ),
    []
  );

  let onFocusChange = useCallback(
    isFocused => {
      state.current.isFocused = isFocused;
      state.current.isFocusVisible = isFocusVisible();
      state.current.isVirtuallyFocusedOutside = false;
      setFocused(isFocused);
      updateState();
    },
    [updateState]
  );

  useFocusVisibleListener(
    isFocusVisible => {
      state.current.isFocusVisible = isFocusVisible;
      updateState();
    },
    [isTextInput, isFocused],
    {enabled: isFocused, isTextInput}
  );

  let {focusProps} = useFocus({
    isDisabled: within,
    onFocusChange
  });

  let {focusWithinProps} = useFocusWithin({
    isDisabled: !within,
    onFocusWithinChange: onFocusChange
  });

  // Hide the focus ring while virtual focus is outside the container (the virtually focused
  // element shows its own ring), and show it again once focus comes back inside.
  let onVirtualFocusChange = useCallback(
    (e: FocusEvent<FocusableElement>, isOutside: boolean) => {
      if (nodeContains(e.currentTarget, getEventTarget(e) as Element)) {
        state.current.isVirtuallyFocusedOutside = isOutside;
        updateState();
      }
    },
    [updateState]
  );

  let {onFocus: onFocusWithin, onBlur: onBlurWithin} = focusWithinProps;
  let onFocus = useCallback(
    (e: FocusEvent<FocusableElement>) => {
      onFocusWithin?.(e);
      onVirtualFocusChange(e, false);
    },
    [onFocusWithin, onVirtualFocusChange]
  );
  let onBlur = useCallback(
    (e: FocusEvent<FocusableElement>) => {
      onBlurWithin?.(e);
      if (
        isVirtualFocusEvent(e.nativeEvent) &&
        !nodeContains(e.currentTarget, e.relatedTarget as Element)
      ) {
        onVirtualFocusChange(e, true);
      }
    },
    [onBlurWithin, onVirtualFocusChange]
  );

  return {
    isFocused,
    isFocusVisible: isFocusVisibleState,
    focusProps: within ? {onFocus, onBlur} : focusProps
  };
}
