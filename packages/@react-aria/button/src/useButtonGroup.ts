import {AllHTMLAttributes, useState} from 'react';
import {ButtonGroupProps} from '@react-types/button';
import {FocusEvent} from '@react-types/shared';
import {useFocusWithin} from '@react-aria/interactions';
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
    role
  } = props;

  let [isFocusWithin, setFocusWithin] = useState(false);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: setFocusWithin
  });

  let tabIndex = isFocusWithin ? -1 : 0;

  return {
    buttonGroupProps: {
      id: useId(id),
      role: role || BUTTON_GROUP_ROLES[selectionMode],
      tabIndex: isDisabled ? null : tabIndex,
      'aria-orientation': orientation,
      'aria-disabled': isDisabled,
      ...focusWithinProps
    },
    buttonProps: {
      role: BUTTON_ROLES[selectionMode],
      onFocus: (e: FocusEvent) => {e.continuePropagation();}
    }
  };
}
