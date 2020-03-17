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

import {HTMLAttributes, RefObject} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {PressProps} from '@react-aria/interactions';
import {SelectState} from '@react-stately/select';
import {useLabel} from '@react-aria/label';
import {useMenuTrigger} from '@react-aria/menu';
import {useTypeSelect} from '@react-aria/selection';

interface SelectProps {
  triggerRef: RefObject<HTMLElement>,
  isDisabled?: boolean,
  keyboardDelegate: KeyboardDelegate
}

interface SelectAria {
  labelProps: HTMLAttributes<HTMLElement>,
  triggerProps: HTMLAttributes<HTMLElement> & PressProps,
  menuProps: HTMLAttributes<HTMLElement>
}

export function useSelect<T>(props: SelectProps, state: SelectState<T>): SelectAria {
  let {
    triggerRef,
    isDisabled,
    keyboardDelegate
  } = props;

  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      ref: triggerRef,
      type: 'listbox',
      isDisabled
    },
    state
  );

  let {typeSelectProps} = useTypeSelect({
    keyboardDelegate: keyboardDelegate,
    selectionManager: state.selectionManager,
    onTypeSelect(key) {
      state.setSelectedKey(key);
    }
  });

  let {labelProps, fieldProps} = useLabel({
    ...props,
    labelElementType: 'span'
  });

  let triggerProps = mergeProps(mergeProps(menuTriggerProps, fieldProps), typeSelectProps);
  triggerProps['aria-labelledby'] = `${triggerProps['aria-labelledby']} ${triggerProps.id}`;

  menuProps['aria-labelledby'] = fieldProps['aria-labelledby'];

  return {
    labelProps,
    triggerProps,
    menuProps
  };
}
