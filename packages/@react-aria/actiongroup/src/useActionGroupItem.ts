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

import {ActionGroupState} from '@react-stately/actiongroup';
import {Key, HTMLAttributes, RefObject} from 'react';
import {mergeProps} from '@react-aria/utils';
import {useSelectableItem} from '@react-aria/selection';

interface ActionGroupItemProps {
  key: Key
}

interface ActionGroupItemAria {
  buttonProps: HTMLAttributes<HTMLElement>
}

const BUTTON_ROLES = {
  'none': null,
  'single': 'radio',
  'multiple': 'checkbox'
};

export function useActionGroupItem<T>(props: ActionGroupItemProps, state: ActionGroupState<T>, ref: RefObject<HTMLElement>): ActionGroupItemAria {
  let selectionMode = state.selectionManager.selectionMode;
  let buttonProps = {
    role: BUTTON_ROLES[selectionMode]
  };

  if (selectionMode !== 'none') {
    let isSelected = state.selectionManager.isSelected(props.key);
    buttonProps['aria-checked'] = isSelected;
  }

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: props.key,
    itemRef: ref
  });

  return {
    buttonProps: mergeProps(itemProps, buttonProps)
  };
}
