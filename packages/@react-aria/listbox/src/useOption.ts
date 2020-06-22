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
import {isFocusVisible, useHover, usePress} from '@react-aria/interactions';
import {ListState} from '@react-stately/list';
import {mergeProps, useSlotId} from '@react-aria/utils';
import {useSelectableItem} from '@react-aria/selection';

interface OptionAria {
  /** Props for the option element. */
  optionProps: HTMLAttributes<HTMLElement>,

  /** Props for the main text element inside the option. */
  labelProps: HTMLAttributes<HTMLElement>,

  /** Props for the description text element inside the option, if any. */
  descriptionProps: HTMLAttributes<HTMLElement>
}

interface AriaOptionProps {
  /** Whether the option is disabled. */
  isDisabled?: boolean,

  /** Whether the option is selected. */
  isSelected?: boolean,

  /** A screen reader only label for the option. */
  'aria-label'?: string,

  /** The unique key for the option. */
  key?: Key,

  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean,

  /** Whether the option should be focused when the user hovers over it. */
  shouldFocusOnHover?: boolean,

  /** Whether the option is contained in a virtual scrolling listbox. */
  isVirtualized?: boolean
}

const isSafariMacOS =
  typeof window !== 'undefined' && window.navigator != null
    ? /^Mac/.test(window.navigator.platform) &&
      /Safari/.test(window.navigator.userAgent) &&
      !/Chrome/.test(window.navigator.userAgent)
    : false;

/**
 * Provides the behavior and accessibility implementation for an option in a listbox.
 * See `useListBox` for more details about listboxes.
 * @param props - props for the option
 * @param state - state for the listbox, as returned by `useListState`
 */
export function useOption<T>(props: AriaOptionProps, state: ListState<T>, ref: RefObject<HTMLElement>): OptionAria {
  let {
    isSelected,
    isDisabled,
    key,
    shouldSelectOnPressUp,
    shouldFocusOnHover,
    isVirtualized
  } = props;

  let labelId = useSlotId();
  let descriptionId = useSlotId();

  let optionProps = {
    role: 'option',
    'aria-disabled': isDisabled,
    'aria-selected': isSelected
  };

  // Safari with VoiceOver on macOS misreads options with aria-labelledby or aria-label as simply "text".
  // We should not map slots to the label and description on Safari and instead just have VoiceOver read the textContent. 
  if (!isSafariMacOS) {
    optionProps['aria-label'] = props['aria-label'],
    optionProps['aria-labelledby'] = labelId,
    optionProps['aria-describedby'] = descriptionId
  }

  if (isVirtualized) {
    optionProps['aria-posinset'] = state.collection.getItem(key).index + 1;
    optionProps['aria-setsize'] = state.collection.size;
  }

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    key,
    ref,
    shouldSelectOnPressUp,
    isVirtualized
  });

  let {pressProps} = usePress({...itemProps, isDisabled});

  let {hoverProps} = useHover({
    isDisabled: isDisabled || !shouldFocusOnHover,
    onHoverStart() {
      if (!isFocusVisible()) {
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(key);
      }
    }
  });

  return {
    optionProps: {
      ...optionProps,
      ...mergeProps(pressProps, hoverProps)
    },
    labelProps: {
      id: labelId
    },
    descriptionProps: {
      id: descriptionId
    }
  };
}
