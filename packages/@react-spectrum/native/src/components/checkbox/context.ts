import {createContext, useContext} from 'react';
import type {CheckboxGroupState} from 'react-stately/useCheckboxGroupState';

export interface CheckboxGroupContextValue {
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  name?: string;
  state: CheckboxGroupState;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroupContext() {
  return useContext(CheckboxGroupContext);
}
