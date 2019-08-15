import {TextFieldState} from '@react-types/textfield';
import {useControlledState} from '@react-stately/utils/src/useControlledState';
import {ValueBase} from '@react-types/shared';

export function useTextFieldState(props: ValueBase<string | number | string[]>): TextFieldState {
  let [value, setValue] = useControlledState(toString(props.value), toString(props.defaultValue) || '', props.onChange);

  return {
    value,
    setValue
  };
}

function toString(val) {
  if (val == null) {
    return;
  }
    
  return val.toString();
}
