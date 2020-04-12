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

import {HTMLAttributes, Key, RefObject} from 'react';
import {ListState} from '@react-stately/list';
import {useHover, usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';
import {useSlotId} from '@react-aria/utils';

interface OptionProps {
  isDisabled?: boolean,
  isSelected?: boolean,
  'aria-label'?: string,
  key?: Key,
  ref?: RefObject<HTMLElement>,
  shouldSelectOnPressUp?: boolean,
  shouldFocusOnHover?: boolean,
  isVirtualized?: boolean
}

interface OptionAria {
  /** Props for the option element */
  optionProps: HTMLAttributes<HTMLElement>,
  /** Props for the main text element inside the option */
  labelProps: HTMLAttributes<HTMLElement>,
  /** Props for the description text element inside the option, if any */
  descriptionProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for an option in a listbox.
 * See `useListBox` for more details about listboxes.
 * @param props - props for the option
 * @param state - state for the listbox, as returned by `useListState`
 */
export function useOption<T>(props: OptionProps, state: ListState<T>): OptionAria {
  let {
    isSelected,
    isDisabled,
    key,
    ref,
    shouldSelectOnPressUp,
    shouldFocusOnHover,
    isVirtualized
  } = props;

  let labelId = useSlotId();
  let descriptionId = useSlotId();

  let optionProps = {
    role: 'option',
    'aria-disabled': isDisabled,
    'aria-selected': isSelected,
    'aria-label': props['aria-label'],
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId
  };

  if (isVirtualized) {
    optionProps['aria-posinset'] = state.collection.getItem(key).index;
    optionProps['aria-setsize'] = state.collection.size;
  }

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: key,
    itemRef: ref,
    shouldSelectOnPressUp,
    isVirtualized
  });

  let {pressProps} = usePress({...itemProps, isDisabled});
  let {hoverProps} = useHover({
    isDisabled: isDisabled || !shouldFocusOnHover,
    onHover() {
      state.selectionManager.setFocused(true);
      state.selectionManager.setFocusedKey(key);
    }
  });

  return {
    optionProps: {
      ...optionProps,
      ...pressProps,
      ...hoverProps
    },
    labelProps: {
      id: labelId
    },
    descriptionProps: {
      id: descriptionId
    }
  };
}
