import {AllHTMLAttributes} from 'react';
import {RadioGroupState} from '@react-stately/radio';
import {RadioProps} from '@react-types/radio';
import {useFocusable} from '@react-aria/focus';

interface RadioAriaProps extends RadioProps {
  isRequired?: boolean,
  isReadOnly?: boolean,
  name?: string
}

interface RadioAria {
  inputProps: AllHTMLAttributes<HTMLInputElement>
}

export function useRadio(props: RadioAriaProps, state: RadioGroupState): RadioAria {
  let {
    value,
    isRequired,
    isReadOnly,
    isDisabled,
    name,
    autoFocus
  } = props;
  let {
    selectedRadio,
    setSelectedRadio
  } = state;

  let checked = selectedRadio === value;

  let onChange = (e) => {
    e.stopPropagation();

    setSelectedRadio(value);
  };

  let {focusableProps} = useFocusable(props);

  return {
    inputProps: {
      type: 'radio',
      name,
      disabled: isDisabled,
      readOnly: isReadOnly,
      required: isRequired,
      checked,
      'aria-checked': checked,
      onChange,
      autoFocus,
      ...focusableProps
    }
  };
}
