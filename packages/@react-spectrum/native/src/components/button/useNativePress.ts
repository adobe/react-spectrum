import {useCallback, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {PressEventHandlers} from './types';

interface NativePressOptions extends PressEventHandlers {
  isDisabled?: boolean;
}

export function useNativePress(options: NativePressOptions) {
  let {isDisabled, onPress, onPressChange, onPressEnd, onPressStart, onPressUp} = options;
  let [isPressed, setPressed] = useState(false);

  let setPressedState = useCallback(
    (value: boolean) => {
      setPressed(value);
      onPressChange?.(value);
    },
    [onPressChange]
  );

  let pressProps = {
    onPress(event: GestureResponderEvent) {
      if (!isDisabled) {
        onPress?.(event);
        onPressUp?.(event);
      }
    },
    onPressIn(event: GestureResponderEvent) {
      if (!isDisabled) {
        setPressedState(true);
        onPressStart?.(event);
      }
    },
    onPressOut(event: GestureResponderEvent) {
      if (!isDisabled) {
        setPressedState(false);
        onPressEnd?.(event);
      }
    }
  };

  return {isPressed, pressProps};
}
