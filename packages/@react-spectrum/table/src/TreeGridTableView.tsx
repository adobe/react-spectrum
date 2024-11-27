/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DOMRef} from '@react-types/shared';
import React, {ReactElement, useState} from 'react';
import {SpectrumTableProps} from './TableViewWrapper';
import {TableViewBase} from './TableViewBase';
import {UNSTABLE_useTreeGridState} from '@react-stately/table';

export interface TreeGridTableProps<T> extends Omit<SpectrumTableProps<T>, 'UNSTABLE_allowsExpandableRows'> {}

export const TreeGridTableView = React.forwardRef(function TreeGridTableView<T extends object>(props: TreeGridTableProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {
    selectionStyle,
    dragAndDropHooks
  } = props;
  let [showSelectionCheckboxes, setShowSelectionCheckboxes] = useState(selectionStyle !== 'highlight');
  let isTableDraggable = !!dragAndDropHooks?.useDraggableCollectionState;
  let state = UNSTABLE_useTreeGridState({
    ...props,
    showSelectionCheckboxes,
    showDragButtons: isTableDraggable,
    selectionBehavior: props.selectionStyle === 'highlight' ? 'replace' : 'toggle'
  });

  // If the selection behavior changes in state, we need to update showSelectionCheckboxes here due to the circular dependency...
  let shouldShowCheckboxes = state.selectionManager.selectionBehavior !== 'replace';
  if (shouldShowCheckboxes !== showSelectionCheckboxes) {
    setShowSelectionCheckboxes(shouldShowCheckboxes);
  }

  return (
    <TableViewBase {...props} state={state} ref={ref} />
  );
}) as <T>(props: TreeGridTableProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
