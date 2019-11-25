import {AllHTMLAttributes} from 'react';
import {ButtonGroupProps} from '@react-types/button';
import {useId} from '@react-aria/utils';

export interface ButtonGroupAria {
  buttonGroupProps: AllHTMLAttributes<HTMLElement>,
  buttonProps: AllHTMLAttributes<HTMLElement>,
}

export function useButtonGroup(props: ButtonGroupProps): ButtonGroupAria {
  let {
    id,
    allowsMultipleSelection, // TODO: replace with selectionMode,
    isDisabled,
    orientation = 'horizontal' as 'horizontal',
    role
  } = props;

  if (!role) {
    role = allowsMultipleSelection ? 'toolbar' : 'radiogroup';
  }

  return {
    buttonGroupProps: {
      id: useId(id),
      role,
      'aria-orientation': orientation,
      'aria-disabled': isDisabled
    },
    buttonProps: {
      role: allowsMultipleSelection ? 'checkbox' : 'radio'
    }
  };
}
