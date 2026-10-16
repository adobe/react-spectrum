/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {DragAndDropHooks} from '../dnd/useDragAndDrop';
import type {DraggableCollectionState} from 'react-stately/useDraggableCollectionState';
import type {DroppableCollectionState} from 'react-stately/useDroppableCollectionState';
import {Key, LoadingState} from '@react-types/shared';
import {ListState} from 'react-stately/useListState';
import type {ListViewLayout} from './ListViewLayout';
import React, {JSX} from 'react';

interface ListViewContextValue<T> {
  state: ListState<T>;
  dragState: DraggableCollectionState | null;
  dropState: DroppableCollectionState | null;
  dragAndDropHooks?: DragAndDropHooks<T>['dragAndDropHooks'];
  onAction?: (key: Key) => void;
  isListDraggable: boolean;
  isListDroppable: boolean;
  layout: ListViewLayout<T>;
  loadingState?: LoadingState;
  renderEmptyState?: () => JSX.Element;
}

export const ListViewContext = React.createContext<ListViewContextValue<unknown> | null>(null);
