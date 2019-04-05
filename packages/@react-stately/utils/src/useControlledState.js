import {useCallback, useRef, useState} from 'react';

export function useControlledState(value, defaultValue, onChange) {
  let [stateValue, setStateValue] = useState(defaultValue);
  let ref = useRef(value !== undefined);
  let wasControlled = ref.current;
  let isControlled = value !== undefined;

  if (wasControlled !== isControlled) {
    console.warn(`WARN: A component changed from ${wasControlled ? 'controlled' : 'uncontrolled'} to ${isControlled ? 'controlled' : 'uncontrolled'}.`);
  }

  ref.current = isControlled;

  let setValue = useCallback((value, ...args) => {
    if (!isControlled) {
      setStateValue(value);
    }

    onChange(value, ...args);
  }, [isControlled, onChange]);

  if (!isControlled) {
    value = stateValue;
  }

  return [value, setValue];
}
