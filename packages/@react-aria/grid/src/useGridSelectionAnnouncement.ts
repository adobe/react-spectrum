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
import {Collection, Key, Node, Selection} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {SelectionManager} from '@react-stately/selection';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useRef} from 'react';
import {useUpdateEffect} from '@react-aria/utils';

export interface GridSelectionAnnouncementProps {
  /**
   * A function that returns the text that should be announced by assistive technology when a row is added or removed from selection.
   * @default (key) => state.collection.getItem(key)?.textValue
   */
  getRowText?: (key: Key) => string
}

interface GridSelectionState<T> {
  /** A collection of items in the grid. */
  collection: Collection<Node<T>>,
  /** A set of items that are disabled. */
  disabledKeys: Set<Key>,
  /** A selection manager to read and update multiple selection state. */
  selectionManager: SelectionManager
}

export function useGridSelectionAnnouncement<T>(props: GridSelectionAnnouncementProps, state: GridSelectionState<T>) {
  let {
    getRowText = (key) => state.collection.getTextValue?.(key) ?? state.collection.getItem(key)?.textValue
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/grid');

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
    let messages: string[] = [];

    if ((state.selectionManager.selectedKeys.size === 1 && isReplace)) {
      if (state.collection.getItem(state.selectionManager.selectedKeys.keys().next().value)) {
        let currentSelectionText = getRowText(state.selectionManager.selectedKeys.keys().next().value);
        if (currentSelectionText) {
          messages.push(stringFormatter.format('selectedItem', {item: currentSelectionText}));
        }
      }
    } else if (addedKeys.size === 1 && removedKeys.size === 0) {
      let addedText = getRowText(addedKeys.keys().next().value);
      if (addedText) {
        messages.push(stringFormatter.format('selectedItem', {item: addedText}));
      }
    } else if (removedKeys.size === 1 && addedKeys.size === 0) {
      if (state.collection.getItem(removedKeys.keys().next().value)) {
        let removedText = getRowText(removedKeys.keys().next().value);
        if (removedText) {
          messages.push(stringFormatter.format('deselectedItem', {item: removedText}));
        }
      }
    }

    // Announce how many items are selected, except when selecting the first item.
    if (state.selectionManager.selectionMode === 'multiple') {
      if (messages.length === 0 || selection === 'all' || selection.size > 1 || lastSelection.current === 'all' || lastSelection.current?.size > 1) {
        messages.push(selection === 'all'
          ? stringFormatter.format('selectedAll')
          : stringFormatter.format('selectedCount', {count: selection.size})
        );
      }
    }

    if (messages.length > 0) {
      announce(messages.join(' '));
    }

    lastSelection.current = selection;
  }, [selection]);
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
