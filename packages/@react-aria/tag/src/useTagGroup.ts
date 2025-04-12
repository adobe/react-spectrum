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

import {AriaLabelingProps, CollectionBase, DOMAttributes, DOMProps, HelpTextProps, Key, KeyboardDelegate, LabelableProps, MultipleSelection, RefObject, SelectionBehavior} from '@react-types/shared';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {ListKeyboardDelegate} from '@react-aria/selection';
import type {ListState} from '@react-stately/list';
import {ReactNode, useEffect, useRef, useState} from 'react';
import {useField} from '@react-aria/label';
import {useFocusWithin} from '@react-aria/interactions';
import {useGridList} from '@react-aria/gridlist';
import {useLocale} from '@react-aria/i18n';

export interface TagGroupAria {
  /** Props for the tag grouping element. */
  gridProps: DOMAttributes,
  /** Props for the tag group's visible label (if any). */
  labelProps: DOMAttributes,
  /** Props for the tag group description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the tag group error message element, if any. */
  errorMessageProps: DOMAttributes
}

export interface AriaTagGroupProps<T> extends CollectionBase<T>, MultipleSelection, DOMProps, LabelableProps, AriaLabelingProps, Omit<HelpTextProps, 'errorMessage'> {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior,
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean,
  /** Handler that is called when a user deletes a tag.  */
  onRemove?: (keys: Set<Key>) => void,
  /** An error message for the field. */
  errorMessage?: ReactNode
}

export interface AriaTagGroupOptions<T> extends Omit<AriaTagGroupProps<T>, 'children'> {
  /**
   * An optional keyboard delegate to handle arrow key navigation,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate
}

interface HookData {
  onRemove?: (keys: Set<Key>) => void
}

export const hookData = new WeakMap<ListState<any>, HookData>();

/**
 * Provides the behavior and accessibility implementation for a tag group component.
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items, with support for keyboard navigation, selection, and removal.
 * @param props - Props to be applied to the tag group.
 * @param state - State for the tag group, as returned by `useListState`.
 * @param ref - A ref to a DOM element for the tag group.
 */
export function useTagGroup<T>(props: AriaTagGroupOptions<T>, state: ListState<T>, ref: RefObject<HTMLElement | null>): TagGroupAria {
  let {direction} = useLocale();
  let keyboardDelegate = props.keyboardDelegate || new ListKeyboardDelegate({
    collection: state.collection,
    ref,
    orientation: 'horizontal',
    direction,
    disabledKeys: state.disabledKeys,
    disabledBehavior: state.selectionManager.disabledBehavior
  });
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    labelElementType: 'span'
  });
  let {gridProps} = useGridList({
    ...props,
    ...fieldProps,
    keyboardDelegate,
    shouldFocusWrap: true,
    linkBehavior: 'override',
    keyboardNavigationBehavior: 'tab'
  }, state, ref);

  let [isFocusWithin, setFocusWithin] = useState(false);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: setFocusWithin
  });
  let domProps = filterDOMProps(props);

  // If the last tag is removed, focus the container.
  let prevCount = useRef(state.collection.size);
  useEffect(() => {
    if (ref.current && prevCount.current > 0 && state.collection.size === 0 && isFocusWithin) {
      ref.current.focus();
    }
    prevCount.current = state.collection.size;
  }, [state.collection.size, isFocusWithin, ref]);

  hookData.set(state, {onRemove: props.onRemove});

  return {
    gridProps: mergeProps(gridProps, domProps, {
      role: state.collection.size ? 'grid' : null,
      'aria-atomic': false,
      'aria-relevant': 'additions',
      'aria-live': isFocusWithin ? 'polite' : 'off',
      ...focusWithinProps,
      ...fieldProps
    }),
    labelProps,
    descriptionProps,
    errorMessageProps
  };
}
