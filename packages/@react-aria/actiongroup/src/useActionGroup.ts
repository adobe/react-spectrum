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

import {ActionGroupKeyboardDelegate, ActionGroupState} from '@react-stately/actiongroup';
import {ActionGroupProps} from '@react-types/actiongroup';
import {AllHTMLAttributes, useMemo, useState} from 'react';
import {mergeProps} from '@react-aria/utils';
import {useFocusWithin} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';
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

export interface ActionGroupAria {
  actionGroupProps: AllHTMLAttributes<HTMLElement>,
  buttonProps: AllHTMLAttributes<HTMLElement>,
}
export function useActionGroup(props: ActionGroupProps, state: ActionGroupState): ActionGroupAria {
  let {
    id,
    selectionMode = 'single',
    isDisabled,
    orientation = 'horizontal' as Orientation,
    role
  } = props;

  let {direction} = useLocale();
  let keyboardDelegate = useMemo(() => new ActionGroupKeyboardDelegate(state.collection, direction, orientation), [state.collection, direction, orientation]);

  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate
  });

  let [isFocusWithin, setFocusWithin] = useState(false);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: setFocusWithin
  });

  let tabIndex = isFocusWithin ? -1 : 0;

  return {
    actionGroupProps: {
      id: useId(id),
      role: role || BUTTON_GROUP_ROLES[selectionMode],
      tabIndex: isDisabled ? null : tabIndex,
      'aria-orientation': orientation,
      'aria-disabled': isDisabled,
      ...mergeProps(focusWithinProps, collectionProps)
    },
    buttonProps: {
      role: BUTTON_ROLES[selectionMode]
    }
  };
}
