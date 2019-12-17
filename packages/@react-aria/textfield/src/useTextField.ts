import {ChangeEvent, InputHTMLAttributes, LabelHTMLAttributes} from 'react';
import {TextFieldProps} from '@react-types/textfield';
import {TextInputDOMProps} from '@react-types/shared';
import {useFocusable} from '@react-aria/focus';
import {useLabel} from '@react-aria/label';

interface TextFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  textFieldProps: InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>
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
  let {labelProps, fieldProps} = useLabel(props);

  return {
    labelProps,
    textFieldProps: {
      type,
      disabled: isDisabled,
      readOnly: isReadOnly,
      'aria-required': isRequired || undefined,
      'aria-invalid': validationState === 'invalid' || undefined,
      onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      autoFocus,
      ...focusableProps,
      ...fieldProps
    }
  };
}
