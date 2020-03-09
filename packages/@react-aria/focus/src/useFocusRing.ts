import { useState, HTMLAttributes } from "react";
import { useFocusVisible, useFocus, useFocusWithin } from "@react-aria/interactions";

interface FocusRingProps {
  within?: boolean,
  isTextInput?: boolean,
  autoFocus?: boolean
}

interface FocusRingAria {
  isFocused: boolean,
  isFocusVisible: boolean,
  focusProps: HTMLAttributes<HTMLElement>
}

export function useFocusRing(props: FocusRingProps = {}): FocusRingAria {
  let {within} = props;
  let [isFocused, setFocused] = useState(false);
  let [isFocusWithin, setFocusWithin] = useState(false);
  let {isFocusVisible} = useFocusVisible(props);
  let {focusProps} = useFocus({
    isDisabled: within,
    onFocusChange: setFocused,
    onFocus: e => e.continuePropagation(),
    onBlur: e => e.continuePropagation()
  });
  let {focusWithinProps} = useFocusWithin({
    isDisabled: !within,
    onFocusWithinChange: setFocusWithin,
    onFocusWithin: e => e.continuePropagation(),
    onBlurWithin: e => e.continuePropagation()
  });

  return {
    isFocused: within ? isFocusWithin : isFocused,
    isFocusVisible: (within ? isFocusWithin : isFocused) && isFocusVisible,
    focusProps: within ? focusWithinProps : focusProps
  };
}
