import {DOMProps} from '@react-types/shared';
import {InputHTMLAttributes} from 'react';
import {SwitchProps} from '@react-types/switch';
import {ToggleState} from '@react-types/toggle';
import {useFocusable} from '@react-aria/focus';

export interface ToggleAria {
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function useToggle(props: SwitchProps & DOMProps, state: ToggleState): ToggleAria {
  let {
    autoFocus = false,
    isDisabled = false,
    isRequired,
    isReadOnly,
    value,
    name,
    children,
    'aria-label': ariaLabel,
    validationState = 'valid'
  } = props;

  let onChange = (e) => {
    // since we spread props on label, onChange will end up there as well as in here.
    // so we have to stop propagation at the lowest level that we care about
    e.stopPropagation();
    state.setSelected(e.target.checked);
  };

  let hasChildren = children !== null;
  let hasAriaLabel = ariaLabel !== null;
  if (!hasChildren && !hasAriaLabel) {
    console.warn('If you do not provide children, you must specify an aria-label for accessibility');
  }
  let isInvalid = validationState === 'invalid';

  let {focusableProps} = useFocusable(props);

  return {
    inputProps: {
      'aria-label': ariaLabel,
      'aria-invalid': isInvalid,
      onChange,
      disabled: isDisabled,
      required: isRequired,
      readOnly: isReadOnly,
      value,
      name,
      type: 'checkbox',
      autoFocus,
      ...focusableProps
    }
  };
}
