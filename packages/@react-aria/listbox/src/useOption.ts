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

import {chain, filterDOMProps, isMac, isWebKit, mergeProps, useLinkProps, useSlotId} from '@react-aria/utils';
import {DOMAttributes, FocusableElement, Key} from '@react-types/shared';
import {getItemCount} from '@react-stately/collections';
import {getItemId, listData} from './utils';
import {isFocusVisible, useHover} from '@react-aria/interactions';
import {ListState} from '@react-stately/list';
import {RefObject} from 'react';
import {SelectableItemStates, useSelectableItem} from '@react-aria/selection';

export interface OptionAria extends SelectableItemStates {
  /** Props for the option element. */
  optionProps: DOMAttributes,

  /** Props for the main text element inside the option. */
  labelProps: DOMAttributes,

  /** Props for the description text element inside the option, if any. */
  descriptionProps: DOMAttributes,

  /** Whether the option is currently focused. */
  isFocused: boolean,

  /** Whether the option is keyboard focused. */
  isFocusVisible: boolean
}

export interface AriaOptionProps {
  /**
   * Whether the option is disabled.
   * @deprecated
   */
  isDisabled?: boolean,

  /**
   * Whether the option is selected.
   * @deprecated
   */
  isSelected?: boolean,

  /** A screen reader only label for the option. */
  'aria-label'?: string,

  /** The unique key for the option. */
  key: Key,

  /**
   * Whether selection should occur on press up instead of press down.
   * @deprecated
   */
  shouldSelectOnPressUp?: boolean,

  /**
   * Whether the option should be focused when the user hovers over it.
   * @deprecated
   */
  shouldFocusOnHover?: boolean,

  /**
   * Whether the option is contained in a virtual scrolling listbox.
   * @deprecated
   */
  isVirtualized?: boolean,

  /**
   * Whether the option should use virtual focus instead of being focused directly.
   * @deprecated
   */
  shouldUseVirtualFocus?: boolean
}

/**
 * Provides the behavior and accessibility implementation for an option in a listbox.
 * See `useListBox` for more details about listboxes.
 * @param props - Props for the option.
 * @param state - State for the listbox, as returned by `useListState`.
 */
export function useOption<T>(props: AriaOptionProps, state: ListState<T>, ref: RefObject<FocusableElement>): OptionAria {
  let {
    key
  } = props;

  let data = listData.get(state);

  let isDisabled = props.isDisabled ?? state.selectionManager.isDisabled(key);
  let isSelected = props.isSelected ?? state.selectionManager.isSelected(key);
  let shouldSelectOnPressUp = props.shouldSelectOnPressUp ?? data?.shouldSelectOnPressUp;
  let shouldFocusOnHover = props.shouldFocusOnHover ?? data?.shouldFocusOnHover;
  let shouldUseVirtualFocus = props.shouldUseVirtualFocus ?? data?.shouldUseVirtualFocus;
  let isVirtualized = props.isVirtualized ?? data?.isVirtualized;

  let labelId = useSlotId();
  let descriptionId = useSlotId();

  let optionProps = {
    role: 'option',
    'aria-disabled': isDisabled || undefined,
    'aria-selected': state.selectionManager.selectionMode !== 'none' ? isSelected : undefined
  };

  // Safari with VoiceOver on macOS misreads options with aria-labelledby or aria-label as simply "text".
  // We should not map slots to the label and description on Safari and instead just have VoiceOver read the textContent.
  // https://bugs.webkit.org/show_bug.cgi?id=209279
  if (!(isMac() && isWebKit())) {
    optionProps['aria-label'] = props['aria-label'];
    optionProps['aria-labelledby'] = labelId;
    optionProps['aria-describedby'] = descriptionId;
  }

  let item = state.collection.getItem(key);
  if (isVirtualized) {
    let index = Number(item?.index);
    optionProps['aria-posinset'] = Number.isNaN(index) ? undefined : index + 1;
    optionProps['aria-setsize'] = getItemCount(state.collection);
  }

  let onAction = data?.onAction ? () => data?.onAction?.(key) : undefined;
  let {itemProps, isPressed, isFocused, hasAction, allowsSelection} = useSelectableItem({
    selectionManager: state.selectionManager,
    key,
    ref,
    shouldSelectOnPressUp,
    allowsDifferentPressOrigin: shouldSelectOnPressUp && shouldFocusOnHover,
    isVirtualized,
    shouldUseVirtualFocus,
    isDisabled,
    onAction: onAction || item?.props?.onAction ? chain(item?.props?.onAction, onAction) : undefined,
    linkBehavior: data?.linkBehavior
  });

  let {hoverProps} = useHover({
    isDisabled: isDisabled || !shouldFocusOnHover,
    onHoverStart() {
      if (!isFocusVisible()) {
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(key);
      }
    }
  });

  let domProps = filterDOMProps(item?.props);
  delete domProps.id;
  let linkProps = useLinkProps(item?.props);

  return {
    optionProps: {
      ...optionProps,
      ...mergeProps(domProps, itemProps, hoverProps, linkProps),
      id: getItemId(state, key)
    },
    labelProps: {
      id: labelId
    },
    descriptionProps: {
      id: descriptionId
    },
    isFocused,
    isFocusVisible: isFocused && isFocusVisible(),
    isSelected,
    isDisabled,
    isPressed,
    allowsSelection,
    hasAction
  };
}
