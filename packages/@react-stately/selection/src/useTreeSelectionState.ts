/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {MultipleSelectionStateProps, useMultipleSelectionState} from './useMultipleSelectionState';
import {SelectionStrategy, TreeSelectionState} from './types';
import {useMemo} from 'react';

export interface TreeSelectionStateProps extends MultipleSelectionStateProps {
  selectionPropagation?: boolean,
  selectionStrategy?: SelectionStrategy
}

export function useTreeSelectionState(props: TreeSelectionStateProps): TreeSelectionState {
  const {
    selectionPropagation = false,
    selectionStrategy = 'all'
  } = props;
  const selectionState = useMultipleSelectionState(props);
  return useMemo(() => Object.defineProperties({
    selectionPropagation,
    selectionStrategy
  }, Object.getOwnPropertyDescriptors(selectionState)) as TreeSelectionState, [selectionPropagation, selectionState, selectionStrategy]);
}
