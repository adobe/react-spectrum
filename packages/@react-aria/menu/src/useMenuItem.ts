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

import {AllHTMLAttributes, Key, RefObject} from 'react';
import {chain, mergeProps} from '@react-aria/utils';
import {PressEvent} from '@react-types/shared';
import {TreeState} from '@react-stately/tree';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

interface MenuItemAria {
  menuItemProps: AllHTMLAttributes<HTMLElement>
}

interface MenuState<T> extends TreeState<T> {}

interface MenuItemProps {
  isDisabled?: boolean,
  isSelected?: boolean,
  key?: Key,
  ref?: RefObject<HTMLElement>,
  onClose?: () => void,
  closeOnSelect?: boolean,
  isVirtualized?: boolean,
  onPress: (e: PressEvent) => void
}

export function useMenuItem<T>(props: MenuItemProps, state: MenuState<T>): MenuItemAria {
  let {
    isSelected,
    isDisabled,
    key,
    onClose,
    closeOnSelect,
    ref,
    isVirtualized,
    onPress: onMenuItemPress
  } = props;

  let role = 'menuitem';
  if (state.selectionManager.selectionMode === 'single') {
    role = 'menuitemradio';
  } else if (state.selectionManager.selectionMode === 'multiple') {
    role = 'menuitemcheckbox';
  }

  let ariaProps = {
    'aria-disabled': isDisabled,
    role
  };

  if (state.selectionManager.selectionMode !== 'none') {
    ariaProps['aria-checked'] = isSelected;
  }

  if (isVirtualized) {
    ariaProps['aria-posinset'] = state.collection.getItem(key).index;
    ariaProps['aria-setsize'] = state.collection.size;
  }

  let onKeyDown = (e) => {
    switch (e.key) {
      case ' ':
        if (!isDisabled && state.selectionManager.selectionMode === 'none' && closeOnSelect && onClose) {
          onClose();
        }
        break;
      case 'Enter':
        if (!isDisabled && onClose) {
          onClose();
        }
        break;
    }
  };

  let onPress = (e) => {
    if (e.pointerType !== 'keyboard' && closeOnSelect && onClose) {
      onClose();
    }
  };

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: key,
    itemRef: ref
  });

  let {pressProps} = usePress(mergeProps({onPress: chain(onMenuItemPress, onPress), onKeyDown, isDisabled}, itemProps));
  let onMouseOver = () => state.selectionManager.setFocusedKey(key);

  return {
    menuItemProps: {
      ...ariaProps,
      ...pressProps,
      onMouseOver
    }
  };
}
