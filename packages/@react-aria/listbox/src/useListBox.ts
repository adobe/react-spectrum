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

import {AriaListBoxProps} from '@react-types/listbox';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {HTMLAttributes, ReactNode, RefObject} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {listIds} from './utils';
import {ListState} from '@react-stately/list';
import {useId} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';
import {useSelectableList} from '@react-aria/selection';

interface ListBoxAria {
  /** Props for the listbox element. */
  listBoxProps: HTMLAttributes<HTMLElement>,
  /** Props for the listbox's visual label element (if any). */
  labelProps: HTMLAttributes<HTMLElement>
}

interface AriaListBoxOptions<T> extends Omit<AriaListBoxProps<T>, 'children'> {
  /** Whether the listbox uses virtual scrolling. */
  isVirtualized?: boolean,

  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate,

  /**
   * An optional visual label for the listbox.
   */
  label?: ReactNode
}

/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 * @param props - Props for the listbox.
 * @param state - State for the listbox, as returned by `useListState`.
 */
export function useListBox<T>(props: AriaListBoxOptions<T>, state: ListState<T>, ref: RefObject<HTMLElement>): ListBoxAria {
  let domProps = filterDOMProps(props, {labelable: true});
  let {listProps} = useSelectableList({
    ...props,
    ref,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys
  });

  let id = useId(props.id);
  listIds.set(state, id);

  let {labelProps, fieldProps} = useLabel({
    ...props,
    id,
    // listbox is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: 'span'
  });

  return {
    labelProps,
    listBoxProps: mergeProps(domProps, state.selectionManager.selectionMode === 'multiple' ? {
      'aria-multiselectable': 'true'
    } : {}, {
      role: 'listbox',
      ...mergeProps(fieldProps, listProps)
    })
  };
}
