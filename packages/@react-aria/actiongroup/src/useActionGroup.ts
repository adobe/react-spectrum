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

import {AriaActionGroupProps} from '@react-types/actiongroup';
import {createFocusManager} from '@react-aria/focus';
import {filterDOMProps} from '@react-aria/utils';
import {HTMLAttributes, RefObject} from 'react';
import {ListState} from '@react-stately/list';
import {Orientation} from '@react-types/shared';
import {useLocale} from '@react-aria/i18n';

const BUTTON_GROUP_ROLES = {
  'none': 'toolbar',
  'single': 'radiogroup',
  'multiple': 'toolbar'
};

export interface ActionGroupAria {
  actionGroupProps: HTMLAttributes<HTMLElement>
}

export function useActionGroup<T>(props: AriaActionGroupProps<T>, state: ListState<T>, ref: RefObject<HTMLElement>): ActionGroupAria {
  let {
    isDisabled,
    orientation = 'horizontal' as Orientation
  } = props;
  let allKeys = [...state.collection.getKeys()];
  if (!allKeys.some(key => !state.disabledKeys.has(key))) {
    isDisabled = true;
  }

  let {direction} = useLocale();
  let focusManager = createFocusManager(ref);
  let flipDirection = direction === 'rtl' && orientation === 'horizontal';
  let onKeyDown = (e) => {
    if (!e.currentTarget.contains(e.target)) {
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'ArrowRight' && flipDirection) {
          focusManager.focusPrevious({wrap: true});
        } else {
          focusManager.focusNext({wrap: true});
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'ArrowLeft' && flipDirection) {
          focusManager.focusNext({wrap: true});
        } else {
          focusManager.focusPrevious({wrap: true});
        }
        break;
    }
  };

  let role = BUTTON_GROUP_ROLES[state.selectionManager.selectionMode];
  return {
    actionGroupProps: {
      ...filterDOMProps(props, {labelable: true}),
      role,
      'aria-orientation': role === 'toolbar' ? orientation : null,
      'aria-disabled': isDisabled,
      onKeyDown
    }
  };
}
