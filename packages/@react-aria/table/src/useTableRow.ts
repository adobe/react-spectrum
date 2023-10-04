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

import {FocusableElement} from '@react-types/shared';
import {getLastItem} from '@react-stately/collections';
import {getRowLabelledBy} from './utils';
import {getSyntheticLinkProps, mergeProps} from '@react-aria/utils';
import type {GridNode} from '@react-types/grid';
import {GridRowAria, GridRowProps, useGridRow} from '@react-aria/grid';
import {HTMLAttributes, RefObject} from 'react';
import {TableCollection} from '@react-types/table';
import {tableNestedRows} from '@react-stately/flags';
import {TableState, TreeGridState} from '@react-stately/table';
import {useLocale} from '@react-aria/i18n';

const EXPANSION_KEYS = {
  expand: {
    ltr: 'ArrowRight',
    rtl: 'ArrowLeft'
  },
  'collapse': {
    ltr: 'ArrowLeft',
    rtl: 'ArrowRight'
  }
};

/**
 * Provides the behavior and accessibility implementation for a row in a table.
 * @param props - Props for the row.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function useTableRow<T>(props: GridRowProps<T>, state: TableState<T> | TreeGridState<T>, ref: RefObject<FocusableElement>): GridRowAria {
  let {node, isVirtualized} = props;
  let {rowProps, ...states} = useGridRow<T, TableCollection<T>, TableState<T>>(props, state, ref);
  let {direction} = useLocale();

  if (isVirtualized && !(tableNestedRows() && 'expandedKeys' in state)) {
    rowProps['aria-rowindex'] = node.index + 1 + state.collection.headerRows.length; // aria-rowindex is 1 based
  } else {
    delete rowProps['aria-rowindex'];
  }

  let treeGridRowProps: HTMLAttributes<HTMLElement> = {};
  if (tableNestedRows() && 'expandedKeys' in state) {
    let treeNode = state.keyMap.get(node.key);
    if (treeNode != null) {
      let hasChildRows = treeNode.props?.UNSTABLE_childItems || treeNode.props?.children?.length > state.userColumnCount;
      treeGridRowProps = {
        onKeyDown: (e) => {
          if ((e.key === EXPANSION_KEYS['expand'][direction]) && state.selectionManager.focusedKey === treeNode.key && hasChildRows && state.expandedKeys !== 'all' && !state.expandedKeys.has(treeNode.key)) {
            state.toggleKey(treeNode.key);
            e.stopPropagation();
          } else if ((e.key === EXPANSION_KEYS['collapse'][direction]) && state.selectionManager.focusedKey === treeNode.key && hasChildRows && (state.expandedKeys === 'all' || state.expandedKeys.has(treeNode.key))) {
            state.toggleKey(treeNode.key);
            e.stopPropagation();
          }
        },
        'aria-expanded': hasChildRows ? state.expandedKeys === 'all' || state.expandedKeys.has(node.key) : undefined,
        'aria-level': treeNode.level,
        'aria-posinset': treeNode.indexOfType + 1,
        'aria-setsize': treeNode.level > 1 ?
          (getLastItem(state.keyMap.get(treeNode?.parentKey).childNodes) as GridNode<T>).indexOfType + 1 :
          (getLastItem(state.keyMap.get(state.collection.body.key).childNodes) as GridNode<T>).indexOfType + 1
      };
    }
  }

  let linkProps = states.hasAction ? getSyntheticLinkProps(node.props) : {};
  return {
    rowProps: {
      ...mergeProps(rowProps, treeGridRowProps, linkProps),
      'aria-labelledby': getRowLabelledBy(state, node.key)
    },
    ...states
  };
}
