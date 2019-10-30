import {useControlledState} from '@react-stately/utils';

export function useMenuTriggerState(props/*: type me */)/*: type me */  {
  let [state, setState] = useControlledState(props.value, props.defaultValue, props.onChange);

  return [state, setState];
}
