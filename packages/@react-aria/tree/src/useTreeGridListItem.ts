/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DOMAttributes, FocusableElement, Node} from '@react-types/shared';
import {getLastItem} from '@react-stately/collections';
import {HTMLAttributes, RefObject} from 'react';
import {mergeProps} from '@react-aria/utils';
import {SelectableItemStates} from '@react-aria/selection';
import {TreeState} from '@react-stately/tree';
import {useGridListItem} from '@react-aria/gridlist';
import {useLocale} from '@react-aria/i18n';

export interface AriaTreeGridListItemOptions {
  // TODO: update this to match the proper
  /** An object representing the treegrid item. Contains all the relevant information that makes up the treegrid row. */
  node: Node<unknown>
}

export interface TreeGridListItemAria extends Omit<SelectableItemStates, 'hasAction'> {
  /** Props for the list row element. */
  rowProps: DOMAttributes,
  /** Props for the grid cell element within the list row. */
  gridCellProps: DOMAttributes,
  /** Props for the list item description element, if any. */
  descriptionProps: DOMAttributes
}

// TODO: export from somewhere central
const EXPANSION_KEYS = {
  'expand': {
    ltr: 'ArrowRight',
    rtl: 'ArrowLeft'
  },
  'collapse': {
    ltr: 'ArrowLeft',
    rtl: 'ArrowRight'
  }
};

/**
 * Provides the behavior and accessibility implementation for a row in a grid list.
 * @param props - Props for the row.
 * @param state - State of the parent list, as returned by `useListState`.
 * @param ref - The ref attached to the row element.
 */
export function useTreeGridListItem<T>(props: AriaTreeGridListItemOptions, state: TreeState<T>, ref: RefObject<FocusableElement>): TreeGridListItemAria {
  let {node} = props;
  let {direction} = useLocale();
  let {
    rowProps,
    gridCellProps,
    descriptionProps,
    ...states
  } = useGridListItem(props, state, ref);

  let treeGridRowProps: HTMLAttributes<HTMLElement> = {};
  if (node != null) {
    // TODO: Update the below check perhaps if I add information to the node to indicate that it has child rows
    let hasChildRows = [...state.collection.getChildren(node.key)].length > 1;
    console.log('node', node)
    treeGridRowProps = {
      onKeyDownCapture: (e) => {
        if ((e.key === EXPANSION_KEYS['expand'][direction]) && state.selectionManager.focusedKey === node.key && hasChildRows && state.expandedKeys !== 'all' && !state.expandedKeys.has(node.key)) {
          state.toggleKey(node.key);
          e.stopPropagation();
        } else if ((e.key === EXPANSION_KEYS['collapse'][direction]) && state.selectionManager.focusedKey === node.key && hasChildRows && (state.expandedKeys === 'all' || state.expandedKeys.has(node.key))) {
          state.toggleKey(node.key);
          e.stopPropagation();
        }
      },
      // TODO Note that the below values operate off the assumption that the Content node in the collection always exists for every row and that there is only one
      // If we can't operate off that assumption, will have to do further post processing in flattenTree
      'aria-expanded': hasChildRows ? state.expandedKeys === 'all' || state.expandedKeys.has(node.key) : undefined,
      'aria-level': node.level + 1,
      'aria-posinset': node.level > 0 ? node.index : node.index + 1,
      'aria-setsize': node.level > 0 ?
        (getLastItem(state.collection.getChildren(node?.parentKey))).index :
        [...state.collection].filter(row => row.level === 0).at(-1).index + 1
    };
  }


  // TODO: does a treeGridListItem include onAction/link stuff??
  return {
    // TODO: these both having capturing keydown listeners is problematic because stopPropagation won't stop the keydown from useGridList, so focus still moves into the cell... Might mean that I need to use useGridRow?
    // Alternatively, move these changes into useGridList onKeyDown and forgo this new hook
    rowProps: mergeProps(treeGridRowProps, rowProps),
    gridCellProps,
    descriptionProps,
    // TODO: should it return a state specifically for isExpanded? Or is aria attribute sufficient?
    ...states
  };
}
