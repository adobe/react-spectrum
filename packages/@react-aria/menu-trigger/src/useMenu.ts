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

import {AllHTMLAttributes} from 'react';
import {ListLayout} from '@react-stately/collections';
import {MenuProps} from '@react-types/menu';
import {Orientation} from '@react-types/shared';
import {TreeState} from '@react-stately/tree';
import {useId} from '@react-aria/utils';
import {useSelectableCollection} from '@react-aria/selection';

interface MenuAria {
  menuProps: AllHTMLAttributes<HTMLElement>,
  menuItemProps: AllHTMLAttributes<HTMLElement>
}

interface MenuState<T> extends TreeState<T> {}

interface MenuLayout<T> extends ListLayout<T> {}

export function useMenu<T>(props: MenuProps<T>, state: MenuState<T>, layout: MenuLayout<T>, autoFocus, focusStrategy, setFocusStrategy): MenuAria {
  let {
    'aria-orientation': ariaOrientation = 'vertical' as Orientation,
    role = 'menu',
    id,
    selectionMode
  } = props;

  let menuId = useId(id);

  let {listProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout,
    autoFocus,
    focusStrategy,
    setFocusStrategy
  });

  let menuItemRole = 'menuitem';
  if (role === 'listbox') {
    menuItemRole = 'option';
  } else if (selectionMode === 'single') {
    menuItemRole = 'menuitemradio';
  } else if (selectionMode === 'multiple') {
    menuItemRole = 'menuitemcheckbox';
  }

  let menuItemRole = 'menuitem';
  if (role === 'listbox') {
    menuItemRole = 'option';
  } else if (selectionMode === 'single') {
    menuItemRole = 'menuitemradio';
  } else if (selectionMode === 'multiple') {
    menuItemRole = 'menuitemcheckbox';
  }

  return {
    menuProps: {
      ...listProps,
      id: menuId,
      role,
      'aria-orientation': ariaOrientation
    },
    menuItemProps: {
      role: menuItemRole
    }
  };
}
