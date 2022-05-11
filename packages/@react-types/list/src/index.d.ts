/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AriaLabelingProps,
  AsyncLoadable,
  CollectionBase,
  DOMProps,
  LoadingState,
  MultipleSelection,
  SpectrumSelectionProps,
  StyleProps
} from '@react-types/shared';
import {DragHooks, DropHooks} from '@react-spectrum/dnd';

export interface ListProps<T> extends CollectionBase<T>, MultipleSelection {
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: string) => void
}

export interface AriaListProps<T> extends ListProps<T>, DOMProps, AriaLabelingProps {}

export interface SpectrumListProps<T> extends AriaListProps<T>, StyleProps, SpectrumSelectionProps, Omit<AsyncLoadable, 'isLoading'> {
  /**
   * Sets the amount of vertical padding within each cell.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  /** Whether the ListView should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** The current loading state of the ListView. Determines whether or not the progress circle should be shown. */
  loadingState?: LoadingState,
  /**
   * Sets the text behavior for the row contents.
   * @default 'truncate'
   */
  overflowMode?: 'truncate' | 'wrap',
  /** Sets what the ListView should render when there is no content to display. */
  renderEmptyState?: () => JSX.Element,
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: string) => void,
  /**
   * The drag hooks returned by `useDragHooks` used to enable drag and drop behavior for the ListView. See the
   * [docs](https://react-spectrum.adobe.com/react-spectrum/useDragHooks.html) for more info.
   */
  dragHooks?: DragHooks,
  /**
   * The drag hooks returned by `useDragHooks` used to enable drag and drop behavior for the ListView.
   */
  dropHooks?: DropHooks
}
