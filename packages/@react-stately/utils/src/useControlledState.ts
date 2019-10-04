import {useCallback, useRef, useState} from 'react';

export function useControlledState(
  value: any,
  defaultValue: any,
  onChange?: (value: any, ...args: any[]) => void
): [any, (value: any, ...args: any[]) => void]  {
  let [stateValue, setStateValue] = useState(value || defaultValue);
  let ref = useRef(value !== undefined);
  let wasControlled = ref.current;
  let isControlled = value !== undefined;
  // Internal state reference for useCallback
  let stateRef = useRef(stateValue);
  if (wasControlled !== isControlled) {
    console.warn(`WARN: A component changed from ${wasControlled ? 'controlled' : 'uncontrolled'} to ${isControlled ? 'controlled' : 'uncontrolled'}.`);
  }

  ref.current = isControlled;

  let setValue = useCallback((value, ...args) => {
    if (onChange) {
      if (stateRef.current !== value) {
        onChange(value, ...args);
      }
    }

    if (!isControlled) {
      setStateValue(value);
      stateRef.current = value;
    }

  }, [isControlled, onChange]);

  // If a controlled component's value prop changes, we need to update stateRef
  if (isControlled) {
    stateRef.current = value;
  } else {
    value = stateValue;
  }

  return [value, setValue];
}
