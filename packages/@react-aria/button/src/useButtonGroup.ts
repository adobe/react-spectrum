/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AllHTMLAttributes, useState} from 'react';
import {ButtonGroupKeyboardDelegate, ButtonGroupState} from '@react-stately/button';
import {ButtonGroupProps} from '@react-types/button';
import {FocusEvent} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {useFocusWithin} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';
import {useSelectableCollection} from '@react-aria/selection';

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
export function useButtonGroup(props: ButtonGroupProps, state: ButtonGroupState): ButtonGroupAria {
  let {
    id,
    selectionMode = 'single',
    isDisabled,
    orientation = 'horizontal' as Orientation,
    role
  } = props;

  let keyboardDelegate = new ButtonGroupKeyboardDelegate(state.buttonCollection);

  let {listProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate
  });

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
      ...mergeProps(focusWithinProps, listProps)
    },
    buttonProps: {
      role: BUTTON_ROLES[selectionMode],
      onFocus: (e: FocusEvent) => {e.continuePropagation();}
    }
  };
}
