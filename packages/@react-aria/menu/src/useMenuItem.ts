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

import {AllHTMLAttributes, RefObject} from 'react';
import {MenuItemProps} from '@react-types/menu';
import {mergeProps, useId} from '@react-aria/utils';
import {TreeState} from '@react-stately/tree';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

interface MenuItemAria {
  menuItemProps: AllHTMLAttributes<HTMLElement>
}

interface MenuState<T> extends TreeState<T> {}

export function useMenuItem<T>(props: MenuItemProps<T>, ref: RefObject<HTMLElement>, state: MenuState<T>, onClose?: () => void, closeOnSelect?: boolean): MenuItemAria {
  let {
    isSelected,
    isDisabled,
    key,
    role = 'menuitem'
  } = props;

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: key,
    itemRef: ref
  });

  let ariaProps = {
    'aria-disabled': isDisabled,
    id: useId(),
    role
  };

  if (role === 'option') {
    ariaProps['aria-selected'] = isSelected ? 'true' : 'false';
  } else if (role === 'menuitemradio' || role === 'menuitemcheckbox') {
    ariaProps['aria-checked'] = isSelected ? 'true' : 'false';
  }

  let onKeyDown = (e) => {
    switch (e.key) {
      case ' ':
        if (!isDisabled) {
          if (role === 'menuitem') {
            if (closeOnSelect) {
              onClose && onClose();
            }
          }
        }
        break;
      case 'Enter':
        if (!isDisabled) {
          onClose && onClose();
        }
        break;
    }
  }; 

  let onPress = (e) => {
    if (e.pointerType !== 'keyboard') {
      if (closeOnSelect) {
        onClose && onClose();
      }
    }
  };

  let onMouseOver = () => state.selectionManager.setFocusedKey(key);
  let {pressProps} = usePress(mergeProps({onPress, onKeyDown, isDisabled}, itemProps));

  return {
    menuItemProps: {
      ...ariaProps,
      ...pressProps,
      onMouseOver
    }
  };
}
