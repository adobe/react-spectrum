import {AllHTMLAttributes} from 'react';
import {ButtonGroupProps} from '@react-types/button';
import {useId} from '@react-aria/utils';

const BUTTON_GROUP_ROLES = {
  'none': 'toolbar',
  'single': 'radiogroup',
  'multiple': 'toolbar'
};

const BUTTON_ROLES = {
  'none': null,
  'single': 'radio',
  'multiple': 'checkbox'
};

type Orientation = 'horizontal' | 'vertical';

export interface ButtonGroupAria {
  buttonGroupProps: AllHTMLAttributes<HTMLElement>,
  buttonProps: AllHTMLAttributes<HTMLElement>,
}
export function useButtonGroup(props: ButtonGroupProps): ButtonGroupAria {
  let {
    id,
    selectionMode = 'single',
    isDisabled,
    orientation = 'horizontal' as Orientation,
    role,
    tabIndex = 0
  } = props;

  return {
    buttonGroupProps: {
      id: useId(id),
      role: role || BUTTON_GROUP_ROLES[selectionMode],
      tabIndex: isDisabled ? null : tabIndex,
      'aria-orientation': orientation,
      'aria-disabled': isDisabled
    },
    buttonProps: {
      role: BUTTON_ROLES[selectionMode]
    }
  };
}
