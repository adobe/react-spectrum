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
    selectionMode = 'single',
    isDisabled,
    orientation = 'horizontal' as 'horizontal',
    role,
    tabIndex = 0
  } = props;

  if (!role) {
    role = selectionMode === 'single' ? 'radiogroup' : 'toolbar';
  }

  return {
    buttonGroupProps: {
      id: useId(id),
      role,
      tabIndex: isDisabled ? null : tabIndex,
      'aria-orientation': orientation,
      'aria-disabled': isDisabled
    },
    buttonProps: {
      role: selectionMode === 'single' ? 'radio' : 'checkbox'
    }
  };
}
