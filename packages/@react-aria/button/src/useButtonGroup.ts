import {AllHTMLAttributes} from 'react';
import {DOMProps} from '@react-types/shared';
import {MultipleSelectionBase} from '@react-types/shared';

export interface ButtonGroupProps extends DOMProps, MultipleSelectionBase {
  orientation?: 'horizontal' | 'vertical',
  isDisabled?: boolean
}

export interface ButtonGroupAria {
  buttonGroupProps: AllHTMLAttributes<HTMLElement>,
  buttonProps: AllHTMLAttributes<HTMLElement>,
}

export function useButtonGroup(props: ButtonGroupProps): ButtonGroupAria {
  let {
    allowsMultipleSelection, //TODO: change to selectionMode,
    isDisabled,
    orientation,
  } = props;

  return {
    buttonGroupProps: {
      role: allowsMultipleSelection ? 'group' : 'radiogroup',
      'aria-orientation': orientation,
      'aria-disabled': isDisabled
    },
    buttonProps: {
      role: allowsMultipleSelection ? 'checkbox' : 'radio'
    }
  };
}
