import {HTMLAttributes, useRef, useState} from 'react';
import {useFocus, useFocusEmitter, useFocusWithin} from '@react-aria/interactions';

interface FocusRingProps {
  /**
   * Whether to show the focus ring when something
   * inside the container element has focus (true), or
   * only if the container itself has focus (false).
   * @default 'false'
   */
  within?: boolean,

  /** Whether the element is a text input. */
  isTextInput?: boolean,

  /** Whether the element will be auto focused. */
  autoFocus?: boolean
}

interface FocusRingAria {
  /** Whether the element is currently focused. */
  isFocused: boolean,

  /** Whether keyboard focus should be visible. */
  isFocusVisible: boolean,

  /** Props to apply to the container element with the focus ring. */
  focusProps: HTMLAttributes<HTMLElement>
}

/**
 * Determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard,
 * not with a mouse, touch, or other input methods.
 */
export function useFocusRing(props: FocusRingProps = {}): FocusRingAria {
  let {within} = props;
  let [isFocused, setFocused] = useState(false);
  let [isFocusWithin, setFocusWithin] = useState(false);
  let [isFocusVisible, setFocusVisible] = useState(false);
  let lastKnownVisibleState = useRef(false);

  useFocusEmitter((isFocusVisible) => {
    lastKnownVisibleState.current = isFocusVisible;
    // rerender only if component is focused or component is losing focus
    if (isFocused || (lastKnownVisibleState.current && !isFocusVisible)) {
      setFocusVisible(lastKnownVisibleState.current);
    }
  }, [isFocused]);

  let {focusProps} = useFocus({
    isDisabled: within,
    onFocusChange: setFocused
  });
  let {focusWithinProps} = useFocusWithin({
    isDisabled: !within,
    onFocusWithinChange: setFocusWithin
  });

  return {
    isFocused: within ? isFocusWithin : isFocused,
    isFocusVisible: (within ? isFocusWithin : isFocused) && isFocusVisible,
    focusProps: within ? focusWithinProps : focusProps
  };
}
