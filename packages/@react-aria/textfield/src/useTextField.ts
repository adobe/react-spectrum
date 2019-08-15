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
    validationState
  } = props;

  return {
    textFieldProps: {
      type: 'text',
      disabled: isDisabled,
      required: isRequired,
      readOnly: isReadOnly,
      'aria-invalid': validationState === 'invalid' || null,
      onChange: (e: ChangeEvent<HTMLInputElement>) => state.setValue(e.target.value, e),
      value: state.value,
      autoFocus
    }
  };
}
