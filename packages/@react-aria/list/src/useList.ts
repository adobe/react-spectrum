/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {announce} from '@react-aria/live-announcer';
import {AriaListProps} from '@react-types/list';
import {filterDOMProps, mergeProps, useId, useUpdateEffect} from '@react-aria/utils';
import {HTMLAttributes, Key, RefObject, useMemo, useRef} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {KeyboardDelegate, Selection} from '@react-types/shared';
import {listMap} from './utils';
import {ListState} from '@react-stately/list';
import {useDescription} from '@react-aria/utils';
import {useInteractionModality} from '@react-aria/interactions';
import {useMessageFormatter} from '@react-aria/i18n';
import {useSelectableList} from '@react-aria/selection';

export interface AriaListOptions<T> extends Omit<AriaListProps<T>, 'children'> {
  /** Whether the list uses virtual scrolling. */
  isVirtualized?: boolean,
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate,
  /**
   * A function that returns the text that should be announced by assistive technology when a row is added or removed from selection.
   * @default (key) => state.collection.getItem(key)?.textValue
   */
  getRowText?: (key: Key) => string
}

export interface ListViewAria {
  /** Props for the grid element. */
  gridProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a list component.
 * A list displays data in a single columns and enables a user to navigate its contents via directional navigation keys.
 * @param props - Props for the list.
 * @param state - State for the list, as returned by `useListState`.
 * @param ref - The ref attached to the list element.
 */
export function useList<T>(props: AriaListOptions<T>, state: ListState<T>, ref: RefObject<HTMLElement>): ListViewAria {
  // Rough copy of useGrid, but modifications + things removed for ListView specific case
  let {
    isVirtualized,
    keyboardDelegate,
    getRowText = (key) => state.collection.getItem(key)?.textValue,
    onAction
  } = props;
  let formatMessage = useMessageFormatter(intlMessages);

  if (!props['aria-label'] && !props['aria-labelledby']) {
    console.warn('An aria-label or aria-labelledby prop is required for accessibility.');
  }

  let {listProps} = useSelectableList({
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    ref,
    keyboardDelegate: keyboardDelegate,
    isVirtualized,
    selectOnFocus: state.selectionManager.selectionBehavior === 'replace'
  });

  let id = useId();
  listMap.set(state, {id, onAction});

  // This is useHighlightSelectionDescription copy pasted, it isn't exposed by react-aria/grid.
  let modality = useInteractionModality();
  // null is the default if the user hasn't interacted with the list at all yet or the rest of the page
  let shouldLongPress = (modality === 'pointer' || modality === 'virtual' || modality == null)
    && typeof window !== 'undefined' && 'ontouchstart' in window;

  let interactionDescription = useMemo(() => {
    let selectionMode = state.selectionManager.selectionMode;
    let selectionBehavior = state.selectionManager.selectionBehavior;

    let message = undefined;
    if (shouldLongPress) {
      message = formatMessage('longPressToSelect');
    }

    return selectionBehavior === 'replace' && selectionMode !== 'none' && onAction ? message : undefined;
  }, [state.selectionManager.selectionMode, state.selectionManager.selectionBehavior, onAction, formatMessage, shouldLongPress]);

  let descriptionProps = useDescription(interactionDescription);

  let domProps = filterDOMProps(props, {labelable: true});
  let gridProps: HTMLAttributes<HTMLElement> = mergeProps(
    domProps,
    {
      role: 'grid',
      id,
      'aria-multiselectable': state.selectionManager.selectionMode === 'multiple' ? 'true' : undefined
    },
    listProps,
    descriptionProps
  );

  if (isVirtualized) {
    gridProps['aria-rowcount'] = state.collection.size;
    gridProps['aria-colcount'] = 1;
  }

  // Many screen readers do not announce when items in a grid are selected/deselected.
  // We do this using an ARIA live region.
  let selection = state.selectionManager.rawSelection;
  let lastSelection = useRef(selection);
  useUpdateEffect(() => {
    if (!state.selectionManager.isFocused) {
      lastSelection.current = selection;

      return;
    }

    let addedKeys = diffSelection(selection, lastSelection.current);
    let removedKeys = diffSelection(lastSelection.current, selection);

    // If adding or removing a single row from the selection, announce the name of that item.
    let isReplace = state.selectionManager.selectionBehavior === 'replace';
    let messages = [];

    if ((state.selectionManager.selectedKeys.size === 1 && isReplace)) {
      if (state.collection.getItem(state.selectionManager.selectedKeys.keys().next().value)) {
        let currentSelectionText = getRowText(state.selectionManager.selectedKeys.keys().next().value);
        if (currentSelectionText) {
          messages.push(formatMessage('selectedItem', {item: currentSelectionText}));
        }
      }
    } else if (addedKeys.size === 1 && removedKeys.size === 0) {
      let addedText = getRowText(addedKeys.keys().next().value);
      if (addedText) {
        messages.push(formatMessage('selectedItem', {item: addedText}));
      }
    } else if (removedKeys.size === 1 && addedKeys.size === 0) {
      if (state.collection.getItem(removedKeys.keys().next().value)) {
        let removedText = getRowText(removedKeys.keys().next().value);
        if (removedText) {
          messages.push(formatMessage('deselectedItem', {item: removedText}));
        }
      }
    }

    // Announce how many items are selected, except when selecting the first item.
    if (state.selectionManager.selectionMode === 'multiple') {
      if (messages.length === 0 || selection === 'all' || selection.size > 1 || lastSelection.current === 'all' || lastSelection.current?.size > 1) {
        messages.push(selection === 'all'
          ? formatMessage('selectedAll')
          : formatMessage('selectedCount', {count: selection.size})
        );
      }
    }

    if (messages.length > 0) {
      announce(messages.join(' '));
    }

    lastSelection.current = selection;
  }, [selection]);

  return {
    gridProps
  };
}

function diffSelection(a: Selection, b: Selection): Set<Key> {
  let res = new Set<Key>();
  if (a === 'all' || b === 'all') {
    return res;
  }

  for (let key of a.keys()) {
    if (!b.has(key)) {
      res.add(key);
    }
  }

  return res;
}
