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

import {GridAria, GridProps, useGrid} from '@react-aria/grid';
import {gridIds} from './utils';
import {Layout} from '@react-stately/virtualizer';
import {Node} from '@react-types/shared';
import {TableKeyboardDelegate} from './TableKeyboardDelegate';
import {TableState} from '@react-stately/table';
import {useCollator, useLocale} from '@react-aria/i18n';
import {useId} from '@react-aria/utils';
import {useMemo} from 'react';

interface TableProps<T> extends GridProps {
  /** The layout object for the table. Computes what content is visible and how to position and style them. */
  layout?: Layout<Node<T>>
}

export function useTable<T>(props: TableProps<T>, state: TableState<T>): GridAria {
  let {
    ref,
    keyboardDelegate,
    isVirtualized,
    layout
  } = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {direction} = useLocale();
  let delegate = useMemo(() => keyboardDelegate || new TableKeyboardDelegate({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    ref,
    direction,
    collator,
    layout
  }), [keyboardDelegate, state.collection, state.disabledKeys, ref, direction, collator, layout]);

  let id = useId();
  gridIds.set(state, id);

  let {gridProps} = useGrid({
    ...props,
    id,
    keyboardDelegate: delegate
  }, state);

  // Override to include header rows
  if (isVirtualized) {
    gridProps['aria-rowcount'] = state.collection.size + state.collection.headerRows.length;
  }

  return {
    gridProps
  };
}
