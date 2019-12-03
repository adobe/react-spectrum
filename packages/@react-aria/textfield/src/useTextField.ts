import {AllHTMLAttributes, ChangeEvent} from 'react';
import {TextFieldProps} from '@react-types/textfield';

interface TextFieldAria {
  textFieldProps: AllHTMLAttributes<HTMLElement>
}

export function useTextField(
  props: TextFieldProps
): TextFieldAria {
  let {
    isDisabled = false,
    isRequired = false,
    isReadOnly = false,
    autoFocus = false,
    validationState,
    type = 'text',
    onChange = () => {}
  } = props;

  return {
    textFieldProps: {
      type,
      disabled: isDisabled,
      readOnly: isReadOnly,
      'aria-required': isRequired || undefined,
      'aria-invalid': validationState === 'invalid' || undefined,
      onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value, e),
      autoFocus
    }
  };
}
