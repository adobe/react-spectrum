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

import {AriaLabelingProps, AsyncLoadable, CollectionChildren, DOMProps, LoadingState, MultipleSelection, Sortable, SpectrumSelectionProps, StyleProps} from '@react-types/shared';
import {GridCollection, GridNode} from '@react-types/grid';
import {Key, ReactElement, ReactNode} from 'react';

export interface TableProps<T> extends MultipleSelection, Sortable {
  /** The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. */
  children: [ReactElement<TableHeaderProps<T>>, ReactElement<TableBodyProps<T>>],
  /** A list of row keys to disable. */
  disabledKeys?: Iterable<Key>
}

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
   * Handler that is called when a user performs a column resize.
   * @private
   */
  onColumnResize?: (affectedColumns: {key: Key, width: number}[]) => void,
  /**
   * Handler that is called when a column resize ends.
   * @private
   */
  onColumnResizeEnd?: (affectedColumns: {key: Key, width: number}[]) => void
}

export interface TableHeaderProps<T> {
  /** A list of table columns. */
  columns?: T[],
  /** A list of `Column(s)` or a function. If the latter, a list of columns must be provided using the `columns` prop. */
  children: ColumnElement<T> | ColumnElement<T>[] | ColumnRenderer<T>
}

type ColumnElement<T> = ReactElement<ColumnProps<T>>;
type ColumnRenderer<T> = (item: T) => ColumnElement<T>;
export interface ColumnProps<T> {
  /** Rendered contents of the column if `children` contains child columns. */
  title?: ReactNode,
  /** Static child columns or content to render as the column header. */
  children: ReactNode | ColumnElement<T> | ColumnElement<T>[],
  /** A list of child columns used when dynamically rendering nested child columns. */
  childColumns?: T[],
  /** The width of the column. */
  width?: number | string,
  /** The minimum width of the column. */
  minWidth?: number | string,
  /** The maximum width of the column. */
  maxWidth?: number | string,
  /**
   * The default width of the column.
   * @private
   */
  defaultWidth?: number | string,
  /**
   * Whether the column allows resizing.
   * @private
   */
  allowsResizing?: boolean,
  /** Whether the column allows sorting. */
  allowsSorting?: boolean,
  /** Whether a column is a [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader) and should be announced by assistive technology during row navigation. */
  isRowHeader?: boolean,
  /** A string representation of the column's contents, used for accessibility announcements. */
  textValue?: string
}

// TODO: how to support these in CollectionBuilder...
export interface SpectrumColumnProps<T> extends ColumnProps<T> {
  /**
   * The alignment of the column's contents relative to its allotted width.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end',
  // /** Whether the column should stick to the viewport when scrolling. */
  // isSticky?: boolean, // shouldStick?? Not implemented yet?
  /** Whether the column should render a divider between it and the next column. */
  showDivider?: boolean,
  /**
   * Whether the column should hide its header text. A tooltip with the column's header text
   * will be displayed when the column header is focused instead. Note that this prop is specifically for columns
   * that contain ActionButtons in place of text content.
   */
  hideHeader?: boolean
}

export interface TableBodyProps<T> extends Omit<AsyncLoadable, 'isLoading'> {
  /** The contents of the table body. Supports static items or a function for dynamic rendering. */
  children: CollectionChildren<T>,
  /** A list of row objects in the table body used when dynamically rendering rows. */
  items?: Iterable<T>,
  /** The current loading state of the table. */
  loadingState?: LoadingState
}

export interface RowProps {
  // treeble case? Unsupported props for now
  // /** A list of child item objects used when dynamically rendering row children. */
  // childItems?: Iterable<T>,
  // /** Whether this row has children, even if not loaded yet. */
  // hasChildItems?: boolean,
  /** Rendered contents of the row or row child items. */
  children: CellElement | CellElement[] | CellRenderer,
  /** A string representation of the row's contents, used for features like typeahead. */
  textValue?: string // ???
}

export interface CellProps {
  /** The contents of the cell. */
  children: ReactNode,
  /** A string representation of the cell's contents, used for features like typeahead. */
  textValue?: string
}

export type CellElement = ReactElement<CellProps>;
export type CellRenderer = (columnKey: Key) => CellElement;

export interface TableCollection<T> extends GridCollection<T> {
  // TODO perhaps elaborate on this? maybe not clear enought, essentially returns the table header rows (e.g. in a tiered headers table, will return the nodes containing the top tier column, next tier, etc)
  /** A list of header row nodes in the table. */
  headerRows: GridNode<T>[],
  /** A list of column nodes in the table. */
  columns: GridNode<T>[],
  /** A set of column keys that serve as the [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader). */
  rowHeaderColumnKeys: Set<Key>,
  /** The node that makes up the body of the table. */
  body: GridNode<T>
}
