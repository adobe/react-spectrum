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

import {AriaLabelingProps, DOMProps, KeyboardDelegate, Node} from '@react-types/shared';
import {filterDOMProps, mergeProps, useId} from '@react-aria/utils';
import {gridIds} from './utils';
import {GridKeyboardDelegate} from './GridKeyboardDelegate';
import {GridState} from '@react-stately/grid';
import {HTMLAttributes, RefObject, useMemo} from 'react';
import {Layout} from '@react-stately/virtualizer';
import {useCollator, useLocale} from '@react-aria/i18n';
import {useSelectableCollection} from '@react-aria/selection';

interface GridProps<T> extends DOMProps, AriaLabelingProps {
  ref: RefObject<HTMLElement>,
  isVirtualized?: boolean,
  keyboardDelegate?: KeyboardDelegate,
  layout?: Layout<Node<T>>
}

interface GridAria {
  gridProps: HTMLAttributes<HTMLElement>
}

export function useGrid<T>(props: GridProps<T>, state: GridState<T>): GridAria {
  let {
    ref,
    isVirtualized,
    keyboardDelegate,
    layout
  } = props;

  if (!props['aria-label'] && !props['aria-labelledby']) {
    console.warn('An aria-label or aria-labelledby prop is required for accessibility.');
  }

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {direction} = useLocale();
  let delegate = useMemo(() => keyboardDelegate || new GridKeyboardDelegate({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    ref,
    direction,
    collator,
    layout
  }), [keyboardDelegate, state.collection, state.disabledKeys, ref, direction, collator, layout]);
  let {collectionProps} = useSelectableCollection({
    ref,
    selectionManager: state.selectionManager,
    keyboardDelegate: delegate
  });

  let id = useId();
  gridIds.set(state, id);

  let domProps = filterDOMProps(props, {labelable: true});
  let gridProps: HTMLAttributes<HTMLElement> = mergeProps(domProps, {
    role: 'grid',
    id,
    'aria-multiselectable': state.selectionManager.selectionMode === 'multiple' ? 'true' : undefined,
    ...collectionProps
  });

  if (isVirtualized) {
    gridProps['aria-rowcount'] = state.collection.size + state.collection.headerRows.length;
    gridProps['aria-colcount'] = state.collection.columns.length;
  }

  return {
    gridProps
  };
}
