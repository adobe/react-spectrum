import {AllHTMLAttributes, ChangeEvent} from 'react';
import {TextFieldProps} from '@react-types/textfield';
import {TextInputDOMProps} from '@react-types/shared';
import {useFocusable} from '@react-aria/focus';

interface TextFieldAria {
  textFieldProps: AllHTMLAttributes<HTMLElement>
}

export function useTextField(
  props: TextFieldProps & TextInputDOMProps
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
  let {focusableProps} = useFocusable(props);

  return {
    textFieldProps: {
      type,
      disabled: isDisabled,
      readOnly: isReadOnly,
      'aria-required': isRequired || undefined,
      'aria-invalid': validationState === 'invalid' || undefined,
      onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value, e),
      autoFocus,
      ...focusableProps
    }
  };
}
