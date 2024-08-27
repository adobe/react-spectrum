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
import {DOMAttributes, FocusableElement, Node, RefObject} from '@react-types/shared';
import {filterDOMProps, mergeProps, useDescription, useId, useSyntheticLinkProps} from '@react-aria/utils';
import {hookData} from './useTagGroup';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {KeyboardEvent} from 'react';
import type {ListState} from '@react-stately/list';
import {SelectableItemStates} from '@react-aria/selection';
import {useGridListItem} from '@react-aria/gridlist';
import {useInteractionModality} from '@react-aria/interactions';
import {useLocalizedStringFormatter} from '@react-aria/i18n';


export interface TagAria extends Omit<SelectableItemStates, 'hasAction'> {
  /** Props for the tag row element. */
  rowProps: DOMAttributes,
  /** Props for the tag cell element. */
  gridCellProps: DOMAttributes,
  /** Props for the tag remove button. */
  removeButtonProps: AriaButtonProps,
  /** Whether the tag can be removed. */
  allowsRemoving: boolean
}

export interface AriaTagProps<T> {
  /** An object representing the tag. Contains all the relevant information that makes up the tag. */
  item: Node<T>
}

/**
 * Provides the behavior and accessibility implementation for a tag component.
 * @param props - Props to be applied to the tag.
 * @param state - State for the tag group, as returned by `useListState`.
 * @param ref - A ref to a DOM element for the tag.
 */
export function useTag<T>(props: AriaTagProps<T>, state: ListState<T>, ref: RefObject<FocusableElement | null>): TagAria {
  let {item} = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/tag');
  let buttonId = useId();

  let {onRemove} = hookData.get(state) || {};
  let {rowProps, gridCellProps, ...states} = useGridListItem({
    node: item
  }, state, ref);

  // We want the group to handle keyboard navigation between tags.
  delete rowProps.onKeyDownCapture;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {descriptionProps: _, ...stateWithoutDescription} = states;

  let onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (state.selectionManager.isSelected(item.key)) {
        onRemove?.(new Set(state.selectionManager.selectedKeys));
      } else {
        onRemove?.(new Set([item.key]));
      }
    }
  };

  let modality = useInteractionModality();
  if (modality === 'virtual' &&  (typeof window !== 'undefined' && 'ontouchstart' in window)) {
    modality = 'pointer';
  }
  let description = onRemove && (modality === 'keyboard' || modality === 'virtual') ? stringFormatter.format('removeDescription') : '';
  let descProps = useDescription(description);

  let isFocused = item.key === state.selectionManager.focusedKey;
  // @ts-ignore - data attributes are ok but TS doesn't know about them.
  let domProps = filterDOMProps(item.props);
  let linkProps = useSyntheticLinkProps(item.props);
  return {
    removeButtonProps: {
      'aria-label': stringFormatter.format('removeButtonLabel'),
      'aria-labelledby': `${buttonId} ${rowProps.id}`,
      isDisabled: state.disabledKeys.has(item.key) || item.props.isDisabled,
      id: buttonId,
      onPress: () => onRemove ? onRemove(new Set([item.key])) : null,
      excludeFromTabOrder: true
    },
    rowProps: mergeProps(rowProps, domProps, linkProps, {
      tabIndex: (isFocused || state.selectionManager.focusedKey == null) ? 0 : -1,
      onKeyDown: onRemove ? onKeyDown : undefined,
      'aria-describedby': descProps['aria-describedby']
    }),
    gridCellProps: mergeProps(gridCellProps, {
      'aria-errormessage': props['aria-errormessage'],
      'aria-label': props['aria-label']
    }),
    ...stateWithoutDescription,
    allowsRemoving: !!onRemove
  };
}
