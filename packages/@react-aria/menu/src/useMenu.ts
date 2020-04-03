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
import {MenuProps} from '@react-types/menu';
import {TreeState} from '@react-stately/tree';
import {useSelectableList} from '@react-aria/selection';

interface MenuAria {
  menuProps: HTMLAttributes<HTMLElement>
}

interface MenuState<T> extends TreeState<T> {}

interface AriaMenuProps<T> extends MenuProps<T> {
  ref?: RefObject<HTMLElement>,
  isVirtualized?: boolean,
  keyboardDelegate?: KeyboardDelegate
}

export function useMenu<T>(props: AriaMenuProps<T>, state: MenuState<T>): MenuAria {
  let {
    shouldFocusWrap = true,
    ...otherProps
  } = props;

  let {listProps} = useSelectableList({
    ...otherProps,
    selectionManager: state.selectionManager,
    collection: state.collection,
    shouldFocusWrap
  });

  return {
    menuProps: {
      role: 'menu',
      ...listProps
    }
  };
}
