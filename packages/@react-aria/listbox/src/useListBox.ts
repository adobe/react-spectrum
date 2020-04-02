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

import {FocusStrategy} from '@react-types/listbox';
import {KeyboardDelegate} from '@react-types/shared';
import {HTMLAttributes, RefObject} from 'react';
import {ListState} from '@react-stately/list';
import {useSelectableList} from '@react-aria/selection';

interface ListBoxAria {
  listBoxProps: HTMLAttributes<HTMLElement>
}

interface AriaListBoxProps {
  ref?: RefObject<HTMLDivElement>,
  isVirtualized?: boolean,
  keyboardDelegate?: KeyboardDelegate,
  autoFocus?: boolean | FocusStrategy,
  shouldFocusWrap?: boolean
}

export function useListBox<T>(props: AriaListBoxProps, state: ListState<T>): ListBoxAria {
  let {listProps} = useSelectableList({
    ...props,
    selectionManager: state.selectionManager,
    collection: state.collection
  });

  return {
    listBoxProps: {
      role: 'listbox',
      'aria-multiselectable': state.selectionManager.selectionMode === 'multiple' ? 'true' : undefined,
      ...listProps
    }
  };
}
