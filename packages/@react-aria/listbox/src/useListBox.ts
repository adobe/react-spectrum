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

import {AriaLabelingProps, CollectionBase, DOMAttributes, DOMProps, FocusEvents, FocusStrategy, Key, KeyboardDelegate, LayoutDelegate, MultipleSelection, RefObject, SelectionBehavior} from '@react-types/shared';
import {filterDOMProps, mergeProps, useId} from '@react-aria/utils';
import {listData} from './utils';
import {ListState} from '@react-stately/list';
import {ReactNode} from 'react';
import {useFocusWithin} from '@react-aria/interactions';
import {useLabel} from '@react-aria/label';
import {useSelectableList} from '@react-aria/selection';

export interface ListBoxProps<T> extends CollectionBase<T>, MultipleSelection, FocusEvents {
  /** Whether to auto focus the listbox or an option. */
  autoFocus?: boolean | FocusStrategy,
  /** Whether focus should wrap around when the end/start is reached. */
  shouldFocusWrap?: boolean
}

export interface AriaListBoxPropsBase<T> extends ListBoxProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether pressing the escape key should clear selection in the listbox or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: 'clearSelection' | 'none'
}
export interface AriaListBoxProps<T> extends AriaListBoxPropsBase<T> {
  /**
   * An optional visual label for the listbox.
   */
  label?: ReactNode,
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior,
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean,
  /** Whether options should be focused when the user hovers over them. */
  shouldFocusOnHover?: boolean,
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: Key) => void
}

export interface ListBoxAria {
  /** Props for the listbox element. */
  listBoxProps: DOMAttributes,
  /** Props for the listbox's visual label element (if any). */
  labelProps: DOMAttributes
}

export interface AriaListBoxOptions<T> extends Omit<AriaListBoxProps<T>, 'children'> {
  /** Whether the listbox uses virtual scrolling. */
  isVirtualized?: boolean,

  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate,

  /**
   * A delegate object that provides layout information for items in the collection.
   * By default this uses the DOM, but this can be overridden to implement things like
   * virtualized scrolling.
   */
  layoutDelegate?: LayoutDelegate,

  /**
   * Whether the listbox items should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean,

  /**
   * The behavior of links in the collection.
   * - 'action': link behaves like onAction.
   * - 'selection': link follows selection interactions (e.g. if URL drives selection).
   * - 'override': links override all other interactions (link items are not selectable).
   * @default 'override'
   */
  linkBehavior?: 'action' | 'selection' | 'override'
}

/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 * @param props - Props for the listbox.
 * @param state - State for the listbox, as returned by `useListState`.
 */
export function useListBox<T>(props: AriaListBoxOptions<T>, state: ListState<T>, ref: RefObject<HTMLElement | null>): ListBoxAria {
  let domProps = filterDOMProps(props, {labelable: true});
  // Use props instead of state here. We don't want this to change due to long press.
  let selectionBehavior = props.selectionBehavior || 'toggle';
  let linkBehavior = props.linkBehavior || (selectionBehavior === 'replace' ? 'action' : 'override');
  if (selectionBehavior === 'toggle' && linkBehavior === 'action') {
    // linkBehavior="action" does not work with selectionBehavior="toggle" because there is no way
    // to initiate selection (checkboxes are not allowed inside a listbox). Link items will not be
    // selectable in this configuration.
    linkBehavior = 'override';
  }

  let {listProps} = useSelectableList({
    ...props,
    ref,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    linkBehavior
  });

  let {focusWithinProps} = useFocusWithin({
    onFocusWithin: props.onFocus,
    onBlurWithin: props.onBlur,
    onFocusWithinChange: props.onFocusChange
  });

  // Share list id and some props with child options.
  let id = useId(props.id);
  listData.set(state, {
    id,
    shouldUseVirtualFocus: props.shouldUseVirtualFocus,
    shouldSelectOnPressUp: props.shouldSelectOnPressUp,
    shouldFocusOnHover: props.shouldFocusOnHover,
    isVirtualized: props.isVirtualized,
    onAction: props.onAction,
    linkBehavior,
    // @ts-ignore
    UNSTABLE_itemBehavior: props['UNSTABLE_itemBehavior']
  });

  let {labelProps, fieldProps} = useLabel({
    ...props,
    id,
    // listbox is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: 'span'
  });

  return {
    labelProps,
    listBoxProps: mergeProps(domProps, focusWithinProps, state.selectionManager.selectionMode === 'multiple' ? {
      'aria-multiselectable': 'true'
    } : {}, {
      role: 'listbox',
      ...mergeProps(fieldProps, listProps)
    })
  };
}
