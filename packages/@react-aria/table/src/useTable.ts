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

import {announce} from '@react-aria/live-announcer';
import {GridAria, GridProps, useGrid} from '@react-aria/grid';
import {gridIds} from './utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Layout} from '@react-stately/virtualizer';
import {mergeProps, useDescription, useId, useUpdateEffect} from '@react-aria/utils';
import {Node} from '@react-types/shared';
import {RefObject, useMemo} from 'react';
import {TableKeyboardDelegate} from './TableKeyboardDelegate';
import {tableNestedRows} from '@react-stately/flags';
import {TableState, TreeGridState} from '@react-stately/table';
import {useCollator, useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaTableProps<T> extends GridProps {
  /** The layout object for the table. Computes what content is visible and how to position and style them. */
  layout?: Layout<Node<T>>
}

/**
 * Provides the behavior and accessibility implementation for a table component.
 * A table displays data in rows and columns and enables a user to navigate its contents via directional navigation keys,
 * and optionally supports row selection and sorting.
 * @param props - Props for the table.
 * @param state - State for the table, as returned by `useTableState`.
 * @param ref - The ref attached to the table element.
 */
export function useTable<T>(props: AriaTableProps<T>, state: TableState<T> | TreeGridState<T>, ref: RefObject<HTMLElement>): GridAria {
  let {
    keyboardDelegate,
    isVirtualized,
    layout
  } = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {direction} = useLocale();
  let disabledBehavior = state.selectionManager.disabledBehavior;
  let delegate = useMemo(() => keyboardDelegate || new TableKeyboardDelegate({
    collection: state.collection,
    disabledKeys: disabledBehavior === 'selection' ? new Set() : state.disabledKeys,
    ref,
    direction,
    collator,
    layout
  }), [keyboardDelegate, state.collection, state.disabledKeys, disabledBehavior, ref, direction, collator, layout]);
  let id = useId(props.id);
  gridIds.set(state, id);

  let {gridProps} = useGrid({
    ...props,
    id,
    keyboardDelegate: delegate
  }, state, ref);

  // Override to include header rows
  if (isVirtualized) {
    gridProps['aria-rowcount'] = state.collection.size + state.collection.headerRows.length;
  }

  if (tableNestedRows() && 'expandedKeys' in state) {
    gridProps.role = 'treegrid';
  }

  let {column, direction: sortDirection} = state.sortDescriptor || {};
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let sortDescription = useMemo(() => {
    let columnName = state.collection.columns.find(c => c.key === column)?.textValue;
    return sortDirection && column ? stringFormatter.format(`${sortDirection}Sort`, {columnName}) : undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortDirection, column, state.collection.columns]);

  let descriptionProps = useDescription(sortDescription);

  // Only announce after initial render, tabbing to the table will tell you the initial sort info already
  useUpdateEffect(() => {
    announce(sortDescription, 'assertive', 500);
  }, [sortDescription]);

  return {
    gridProps: mergeProps(
      gridProps,
      descriptionProps,
      {
        // merge sort description with long press information
        'aria-describedby': [descriptionProps['aria-describedby'], gridProps['aria-describedby']].filter(Boolean).join(' ')
      }
    )
  };
}
