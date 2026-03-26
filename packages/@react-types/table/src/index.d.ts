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

import {AriaLabelingProps, DOMProps, Key, SpectrumSelectionProps, StyleProps} from '@react-types/shared';
import {ColumnSize, TableProps} from '@react-stately/table';
import {JSX} from 'react';

export {TableProps, ColumnStaticSize, ColumnDynamicSize, ColumnSize, TableHeaderProps, ColumnElement, ColumnRenderer, ColumnProps, RowElement, TableBodyProps, RowProps, CellProps, CellElement, CellRenderer, ITableCollection as TableCollection} from '@react-stately/table';
export {SpectrumColumnProps} from '@react-spectrum/table';

/**
 * @deprecated - use SpectrumTableProps from '@adobe/react-spectrum' instead.
 */
export interface SpectrumTableProps<T> extends TableProps<T>, SpectrumSelectionProps, DOMProps, AriaLabelingProps, StyleProps {
  /**
   * Sets the amount of vertical padding within each cell.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  /**
   * Sets the overflow behavior for the cell contents.
   * @default 'truncate'
   */
  overflowMode?: 'wrap' | 'truncate',
  /** Whether the TableView should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** Sets what the TableView should render when there is no content to display. */
  renderEmptyState?: () => JSX.Element,
  /** Handler that is called when a user performs an action on a row. */
  onAction?: (key: Key) => void,
  /**
   * Handler that is called when a user starts a column resize.
   */
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void,
  /**
   * Handler that is called when a user performs a column resize.
   * Can be used with the width property on columns to put the column widths into
   * a controlled state.
   */
  onResize?: (widths: Map<Key, ColumnSize>) => void,
  /**
   * Handler that is called after a user performs a column resize.
   * Can be used to store the widths of columns for another future session.
   */
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void
}
