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

import {DOMAttributes, FocusableElement, Key, RefObject} from '@react-types/shared';
import {ListState} from '@react-stately/list';
import {mergeProps, useEffectEvent} from '@react-aria/utils';
import {PressProps} from '@react-aria/interactions';
import {useEffect} from 'react';

export interface AriaActionGroupItemProps {
  key: Key
}

export interface ActionGroupItemAria {
  buttonProps: DOMAttributes & PressProps
}

const BUTTON_ROLES = {
  'none': undefined,
  'single': 'radio',
  'multiple': 'checkbox'
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useActionGroupItem<T>(props: AriaActionGroupItemProps, state: ListState<T>, ref?: RefObject<FocusableElement | null>): ActionGroupItemAria {
  let selectionMode = state.selectionManager.selectionMode;
  let buttonProps = {
    role: BUTTON_ROLES[selectionMode]
  };

  if (selectionMode !== 'none') {
    let isSelected = state.selectionManager.isSelected(props.key);
    buttonProps['aria-checked'] = isSelected;
  }

  let isFocused = props.key === state.selectionManager.focusedKey;
  let onRemovedWithFocus = useEffectEvent(() => {
    if (isFocused) {
      state.selectionManager.setFocusedKey(null);
    }
  });

  // If the focused item is removed from the DOM, reset the focused key to null.
  useEffect(() => {
    return () => {
      onRemovedWithFocus();
    };
  }, [onRemovedWithFocus]);

  return {
    buttonProps: mergeProps(buttonProps, {
      tabIndex: isFocused || state.selectionManager.focusedKey == null ? 0 : -1,
      onFocus() {
        state.selectionManager.setFocusedKey(props.key);
      },
      onPress() {
        state.selectionManager.select(props.key);
      }
    })
  };
}
