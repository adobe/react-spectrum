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

import {AriaButtonProps} from '../button/useButton';

import {Collection, FocusableElement, Node, RefObject} from '@react-types/shared';
import {getRowLabelledBy} from './utils';
import {GridRowAria, GridRowProps, useGridRow} from '../grid/useGridRow';
import {HTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../../intl/table/*.json';
import {ITableCollection} from 'react-stately/private/table/TableCollection';
import {mergeProps} from '../utils/mergeProps';
import {TableState} from 'react-stately/useTableState';
import {TreeGridState} from 'react-stately/private/table/useTreeGridState';
import {useLabels} from '../utils/useLabels';
import {useLocale} from '../i18n/I18nProvider';
import {useLocalizedStringFormatter} from '../i18n/useLocalizedStringFormatter';
import {useSyntheticLinkProps} from '../utils/openLink';

const EXPANSION_KEYS = {
  expand: {
    ltr: 'ArrowRight',
    rtl: 'ArrowLeft'
  },
  collapse: {
    ltr: 'ArrowLeft',
    rtl: 'ArrowRight'
  }
};

export interface TableRowAria extends GridRowAria {
  expandButtonProps: AriaButtonProps;
}

/**
 * Provides the behavior and accessibility implementation for a row in a table.
 * @param props - Props for the row.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function useTableRow<T>(
  props: GridRowProps<T>,
  state: TableState<T> | TreeGridState<T>,
  ref: RefObject<FocusableElement | null>
): TableRowAria {
  let {node, isVirtualized} = props;
  let {rowProps, ...states} = useGridRow<T, ITableCollection<T>, TableState<T>>(
    props,
    state as TableState<T>,
    ref
  );
  let {direction} = useLocale();

  if (isVirtualized && state.treeColumn == null) {
    rowProps['aria-rowindex'] = node.index + 1 + state.collection.headerRows.length; // aria-rowindex is 1 based
  } else {
    delete rowProps['aria-rowindex'];
  }

  let isExpanded =
    state.treeColumn != null && (state.expandedKeys === 'all' || state.expandedKeys.has(node.key));
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/table');
  let labelProps = useLabels({
    'aria-label': isExpanded
      ? stringFormatter.format('collapse')
      : stringFormatter.format('expand'),
    'aria-labelledby': getRowLabelledBy(state as TableState<T>, node.key)
  });

  let treeGridRowProps: HTMLAttributes<HTMLElement> = {};
  let expandButtonProps: AriaButtonProps = {};
  if (state.treeColumn != null) {
    let treeNode = state.collection.getItem(node.key);
    if (treeNode != null) {
      let lastChild = getLastChild(state.collection, node);
      let hasChildRows =
        treeNode.props?.hasChildRows ||
        treeNode.props?.UNSTABLE_childItems ||
        lastChild?.type !== 'cell';
      let parent = state.collection.getItem(node.parentKey!)!;
      let isParentBody = parent.type === 'tablebody' || parent.type === 'body';
      let lastSibling = getLastChild(state.collection, parent)!;
      while (lastSibling && lastSibling.type !== 'item' && lastSibling.prevKey != null) {
        lastSibling = state.collection.getItem(lastSibling.prevKey)!;
      }

      treeGridRowProps = {
        onKeyDown: e => {
          if (
            e.key === EXPANSION_KEYS['expand'][direction] &&
            state.selectionManager.focusedKey === treeNode.key &&
            hasChildRows &&
            state.expandedKeys !== 'all' &&
            !state.expandedKeys.has(treeNode.key)
          ) {
            state.toggleKey(treeNode.key);
            e.stopPropagation();
          } else if (
            e.key === EXPANSION_KEYS['collapse'][direction] &&
            state.selectionManager.focusedKey === treeNode.key
          ) {
            if (state.expandedKeys !== 'all') {
              if (hasChildRows && state.expandedKeys.has(treeNode.key)) {
                state.toggleKey(treeNode.key);
                e.stopPropagation();
              } else if (
                !state.expandedKeys.has(treeNode.key) &&
                treeNode.parentKey != null &&
                treeNode.level > 0
              ) {
                // Item is a leaf or already collapsed, move focus to parent
                state.selectionManager.setFocusedKey(treeNode.parentKey);
                e.stopPropagation();
              }
            } else if (state.expandedKeys === 'all') {
              state.toggleKey(treeNode.key);
              e.stopPropagation();
            }
          }
        },
        'aria-expanded': hasChildRows
          ? state.expandedKeys === 'all' || state.expandedKeys.has(node.key)
          : undefined,
        'aria-level': treeNode.level + 1,
        'aria-posinset': treeNode.index - (isParentBody ? 0 : state.collection.columnCount) + 1,
        'aria-setsize': lastSibling.index - (isParentBody ? 0 : state.collection.columnCount) + 1
      };

      expandButtonProps = {
        isDisabled: states.isDisabled,
        onPress: () => {
          if (!states.isDisabled) {
            state.toggleKey(node.key);
            state.selectionManager.setFocused(true);
            state.selectionManager.setFocusedKey(node.key);
          }
        },
        excludeFromTabOrder: true,
        preventFocusOnPress: true,
        // @ts-ignore
        'data-react-aria-prevent-focus': true,
        ...labelProps
      };
    }
  }

  let syntheticLinkProps = useSyntheticLinkProps(node.props);
  let linkProps = states.hasAction ? syntheticLinkProps : {};
  return {
    rowProps: {
      ...mergeProps(rowProps, treeGridRowProps, linkProps),
      'aria-labelledby': getRowLabelledBy(state as TableState<T>, node.key)
    },
    expandButtonProps,
    ...states
  };
}

function getLastChild(collection: Collection<Node<unknown>>, node: Node<unknown>) {
  if ('lastChildKey' in node) {
    return node.lastChildKey != null ? collection.getItem(node.lastChildKey) : null;
  } else {
    return Array.from(node.childNodes).findLast(item => item.parentKey === node.key);
  }
}
