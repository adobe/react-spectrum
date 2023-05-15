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

import {AriaButtonProps} from '@react-types/button';
import {AriaLabelingProps, DOMAttributes, DOMProps, FocusableElement} from '@react-types/shared';
import {filterDOMProps, mergeProps, useDescription, useId} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {KeyboardEvent, RefObject} from 'react';
import type {ListState} from '@react-stately/list';
import {TagProps} from '@react-types/tag';
import {useGridListItem} from '@react-aria/gridlist';
import {useInteractionModality} from '@react-aria/interactions';
import {useLocalizedStringFormatter} from '@react-aria/i18n';


export interface TagAria {
  /** Props for the tag visible label (if any). */
  labelProps: DOMAttributes,
  /** Props for the tag cell element. */
  gridCellProps: DOMAttributes,
  /** Props for the tag row element. */
  rowProps: DOMAttributes,
  /** Props for the tag remove button. */
  removeButtonProps: AriaButtonProps
}

export interface AriaTagProps<T> extends TagProps<T>, DOMProps, AriaLabelingProps {}

/**
 * Provides the behavior and accessibility implementation for a tag component.
 * @param props - Props to be applied to the tag.
 * @param state - State for the tag group, as returned by `useListState`.
 * @param ref - A ref to a DOM element for the tag.
 */
export function useTag<T>(props: AriaTagProps<T>, state: ListState<T>, ref: RefObject<FocusableElement>): TagAria {
  let {
    allowsRemoving,
    item,
    onRemove
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let labelId = useId();
  let buttonId = useId();

  let {rowProps, gridCellProps} = useGridListItem({
    node: item
  }, state, ref);

  // We want the group to handle keyboard navigation between tags.
  delete rowProps.onKeyDownCapture;

  let onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      onRemove(item.key);
      e.preventDefault();
    }
  };
  
  let modality: string = useInteractionModality();
  if (modality === 'virtual' &&  (typeof window !== 'undefined' && 'ontouchstart' in window)) {
    modality = 'touch';
  }
  let description = allowsRemoving && (modality === 'keyboard' || modality === 'virtual') ? stringFormatter.format('removeDescription') : '';
  let descProps = useDescription(description);

  let domProps = filterDOMProps(props);
  let isFocused = item.key === state.selectionManager.focusedKey;
  return {
    removeButtonProps: {
      'aria-label': stringFormatter.format('removeButtonLabel', {label: item.textValue}),
      'aria-labelledby': `${buttonId} ${labelId}`,
      id: buttonId,
      onPress: () => allowsRemoving && onRemove ? onRemove(item.key) : null,
      excludeFromTabOrder: true
    },
    labelProps: {
      id: labelId
    },
    rowProps: {
      ...rowProps,
      tabIndex: (isFocused || state.selectionManager.focusedKey == null) ? 0 : -1,
      onKeyDown: allowsRemoving ? onKeyDown : null,
      'aria-describedby': descProps['aria-describedby']
    },
    gridCellProps: mergeProps(domProps, gridCellProps, {
      'aria-errormessage': props['aria-errormessage'],
      'aria-label': props['aria-label']
    })
  };
}
