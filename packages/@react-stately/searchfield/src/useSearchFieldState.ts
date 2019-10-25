import {useControlledState} from '@react-stately/utils';
import {ValueBase} from '@react-types/shared';

export interface SearchFieldState {
  value: string,
  setValue: (val: string, ...args: any) => void
}

export function useSearchFieldState(props: ValueBase<string | number | string[]>): SearchFieldState {
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
