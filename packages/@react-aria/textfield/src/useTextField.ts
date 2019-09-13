import {AllHTMLAttributes, ChangeEvent} from 'react';
import {TextFieldProps, TextFieldState} from '@react-types/textfield';

interface TextFieldAria {
  textFieldProps: AllHTMLAttributes<HTMLElement>
}

export function useTextField(
  props: TextFieldProps,
  state: TextFieldState
): TextFieldAria {
  let {
    isDisabled = false,
    isRequired = false,
    isReadOnly = false,
    autoFocus = false,
    validationState,
    type = 'text'
  } = props;

  return {
    textFieldProps: {
      type,
      disabled: isDisabled,
      required: isRequired,
      readOnly: isReadOnly,
      'aria-invalid': validationState === 'invalid' || undefined,
      onChange: (e: ChangeEvent<HTMLInputElement>) => state.setValue(e.target.value, e),
      value: state.value,
      autoFocus
    }
  };
}
