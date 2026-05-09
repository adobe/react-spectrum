import {createContext, useContext} from 'react';
import type {RadioGroupState} from 'react-stately/useRadioGroupState';

export interface RadioGroupContextValue {
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  name?: string;
  state: RadioGroupState;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}
