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

import {AriaLabelingProps, AsyncLoadable, CollectionChildren, DOMProps, MultipleSelection, SectionProps, Sortable, StyleProps} from '@react-types/shared';
import {GridCollection, GridNode} from '@react-types/grid';
import {Key, ReactElement, ReactNode} from 'react';

export interface TableProps<T> extends MultipleSelection, Sortable {
  /** The elements that make up the Table. Includes the TableHeader, TableBody, Columns, and Rows. TODO: I think this shouldn't have Section and row? Also need to fix prop table rendering for this */
  children: ReactElement<TableHeaderProps<T> | TableBodyProps<T>>[],
  /** A list of row keys to disable. */
  disabledKeys?: Iterable<Key>
}

export interface SpectrumTableProps<T> extends TableProps<T>, DOMProps, AriaLabelingProps, StyleProps {
  /**
   * Sets the amount of vertical padding within each Table cell.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  /**
   * Sets the overflow behavior for the Table cell contents.
   * @default 'truncate'
   */
  overflowMode?: 'wrap' | 'truncate',
  /** Whether the Table should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** Sets what the Table should render when there is no content to display. */
  renderEmptyState?: () => JSX.Element
}

export interface TableHeaderProps<T> {
  /** A list of Table columns. */
  columns?: T[],
  /** A list of `Column(s)` or a function. If the latter, a list of columns must be provided using the `columns` prop.` */
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
  // TODO Not sure if this is a thing, doesn't seem to get passed through?
  /** An accessibility label for the column. */
  'aria-label'?: string,
  /** The width of the column. */
  width?: number | string,
  /** The minimum width of the column. */
  minWidth?: number | string,
  /** The maximum width of the column. */
  maxWidth?: number | string,
  /** The default width of the column. TODO: is this even a thing? If so, why? */
  defaultWidth?: number | string
}

// TODO: how to support these in CollectionBuilder...
export interface SpectrumColumnProps<T> extends ColumnProps<T> {
  /**
   * The alignment of the column's contents relative to its allotted width.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end',
  // /** TODO: Don't think this is implemented yet */
  // allowsResizing?: boolean,
  // /** TODO: Don't think this is implemented yet */
  // allowsReordering?: boolean,
  /** Whether the column allows sorting. */
  allowsSorting?: boolean,
  /** Whether the column should stick to the viewport when scrolling. TODO check this */
  isSticky?: boolean, // shouldStick??
  /** Whether the column is a row header and should be announced. TODO check this  */
  isRowHeader?: boolean,
  /** Whether the column should render a divider between it and the next column. */
  showDivider?: boolean,
  /**
   * Whether the column should hide its header text. A tooltip with the column's header text
   * will be displayed when the column header is focused instead.
   */
  hideHeader?: boolean
}

export interface TableBodyProps<T> extends AsyncLoadable {
  /** The contents of the table body. Supports static items or a function for dynamic rendering. */
  children: CollectionChildren<T>,
  /** A list of row objects in the table body used when dynamically rendering rows. */
  items?: Iterable<T>
}

export interface RowProps<T> {
  // treeble case?
  /** A list of child item objects used when dynamically rendering row children. */
  childItems?: Iterable<T>,
  /** Whether this row has children, even if not loaded yet. */
  hasChildItems?: boolean,
  /** Rendered contents of the row or row child items. */
  children: CellElement | CellElement[] | CellRenderer,
  /** A string representation of the row's contents, used for features like typeahead. */
  textValue?: string, // ???
  // TODO Not sure if this is a thing, doesn't seem to get passed through?
  /** An accessibility label for the row. */
  'aria-label'?: string // ???
}

export interface CellProps {
  /** The contents of the cell. */
  children: ReactNode,
  /** A string representation of the cell's contents, used for features like typeahead. */
  textValue?: string,
  // TODO Not sure if this is a thing, doesn't seem to get passed through?
  /** An accessibility label for the cell. */
  'aria-label'?: string
}

export type CellElement = ReactElement<CellProps>;
export type CellRenderer = (columnKey: Key) => CellElement;

export interface TableCollection<T> extends GridCollection<T> {
  headerRows: GridNode<T>[],
  columns: GridNode<T>[],
  rowHeaderColumnKeys: Set<Key>,
  body: GridNode<T>
}
