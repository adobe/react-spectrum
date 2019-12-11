import {FocusEvents, KeyboardEvents} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {RefObject, useEffect} from 'react';
import {useFocus, useKeyboard} from '@react-aria/interactions';

interface FocusableProps extends FocusEvents, KeyboardEvents {
  isDisabled?: boolean,
  autoFocus?: boolean
}

export function useFocusable(props: FocusableProps, domRef?: RefObject<HTMLElement>) {
  let {focusProps} = useFocus(props);
  let {keyboardProps} = useKeyboard(props);

  useEffect(() => {
    if (props.autoFocus && domRef && domRef.current) {
      domRef.current.focus();
    }
  }, [props.autoFocus, domRef]);

  return {
    focusableProps: mergeProps(focusProps, keyboardProps)
  };
}
