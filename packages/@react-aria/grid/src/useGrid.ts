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

import {GridState} from '@react-stately/grid';
import {GridKeyboardDelegate} from './GridKeyboardDelegate';
import {KeyboardDelegate} from '@react-types/shared';
import {RefObject, HTMLAttributes, useMemo} from 'react';
import { useSelectableCollection } from '@react-aria/selection';
import { useCollator, useLocale } from '@react-aria/i18n';
import {gridIds} from './utils';
import { useId } from '@react-aria/utils';

interface GridProps {
  ref: RefObject<HTMLElement>,
  isVirtualized?: boolean,
  keyboardDelegate?: KeyboardDelegate,
}

interface GridAria {
  gridProps: HTMLAttributes<HTMLElement>
}

export function useGrid<T>(props: GridProps, state: GridState<T>): GridAria {
  let {
    ref,
    isVirtualized,
    keyboardDelegate
  } = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {direction} = useLocale();
  let delegate = useMemo(() => keyboardDelegate || new GridKeyboardDelegate(state.collection, ref, direction, collator), [keyboardDelegate, state.collection, ref, collator]);
  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: delegate
  });

  let id = useId();
  gridIds.set(state, id);
  
  let gridProps: HTMLAttributes<HTMLElement> = {
    role: 'grid',
    id,
    'aria-multiselectable': state.selectionManager.selectionMode === 'multiple' ? 'true' : undefined,
    ...collectionProps
  };

  if (isVirtualized) {
    gridProps['aria-rowcount'] = state.collection.size; // TODO: only rows, not cells?
    gridProps['aria-colcount'] = state.collection.columns.length;
  }

  return {
    gridProps
  };
}
