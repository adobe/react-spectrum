/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {Collection, Node} from '@react-types/shared';
import {getChildNodes} from '@react-stately/collections';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isMac, useUpdateEffect} from '@react-aria/utils';
import {SelectionManager} from '@react-stately/selection';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useRef} from 'react';

interface GridSelectionState<T> {
  /** A collection of items in the grid. */
  collection: Collection<Node<T>>,
  /** A selection manager to read and update multiple selection state. */
  selectionManager: SelectionManager
}

export function useGridSectionAnnouncement<T>(state: GridSelectionState<T>) {
  let {collection, selectionManager} = state;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let focusedItem = selectionManager.focusedKey != null && state.selectionManager.isFocused
    ? state.collection.getItem(state.selectionManager.focusedKey)
    : undefined;

  let sectionKey;
  let parentNode = collection.getItem(focusedItem?.parentKey ?? null);
  while (sectionKey == null && parentNode) {
    if (parentNode.type === 'section') {
      sectionKey = parentNode.key;
    }
    parentNode = collection.getItem(parentNode?.parentKey ?? null);
  }
  let lastSection = useRef(sectionKey);
  useUpdateEffect(() => {
    if (isMac() && focusedItem != null && selectionManager.isFocused && sectionKey !== lastSection.current) {
      let section = sectionKey != null ? collection.getItem(sectionKey) : null;
      if (section != null) {
        let sectionTitle = section?.['aria-label'] || (typeof section?.rendered === 'string' ? section.rendered : '') || '';
        let sectionSize = section ? [...getChildNodes(section, state.collection)].length : 0;
        let announcement = stringFormatter.format('sectionAnnouncement', {
          sectionTitle,
          sectionSize
        });

        announce(announcement);
      }
    }

    lastSection.current = sectionKey;
  }, [focusedItem, sectionKey, selectionManager]);
}
