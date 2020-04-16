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
import {HTMLAttributes, RefObject} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {ListState} from '@react-stately/list';
import {useSelectableList} from '@react-aria/selection';

interface ListBoxAria {
  /** Props for the listbox element. */
  listBoxProps: HTMLAttributes<HTMLElement>
}

interface AriaListBoxProps {
  /** A ref to the listbox container element. */
  ref?: RefObject<HTMLDivElement>,

  /** Whether the listbox uses virtual scrolling. */
  isVirtualized?: boolean,

  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate,

  /** Whether the auto focus the listbox or an option. */
  autoFocus?: boolean | FocusStrategy,

  /** Whether focus should wrap around when the end/start is reached. */
  shouldFocusWrap?: boolean
}

/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 * @param props - props for the listbox
 * @param state - state for the listbox, as returned by `useListState`
 */
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
