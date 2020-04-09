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

import {CollectionBase, DOMProps, MultipleSelection, StyleProps, AsyncLoadable, CollectionChildren, SectionProps} from '@react-types/shared';
import { Key, ReactElement } from 'react';

export interface TableProps<T> extends MultipleSelection {
  children: ReactElement<TableHeaderProps | TableBodyProps | SectionProps | RowProps>[],
  disabledKeys?: Iterable<Key>
}

export interface SpectrumTableProps<T> extends TableProps<T>, DOMProps, StyleProps {
  rowHeight?: number | 'auto'
}

export interface TableHeaderProps<T> {
  columns?: T[],
  columnKey?: string,
  children: ColumnElement<T> | ColumnElement<T>[] | ColumnRenderer<T>
}

type ColumnElement<T> = ReactElement<ColumnProps<T>>;
type ColumnRenderer<T> = (item: T) => ColumnElement<T>;
export interface ColumnProps<T> {
  title?: ReactNode,
  children: ReactNode | ColumnElement<T> | ColumnElement<T>[],
  childColumns?: T[],
  'aria-label'?: string,
  uniqueKey?: Key
}

// TODO: how to support these in CollectionBuilder...
export interface SpectrumColumnProps<T> extends ColumnProps<T> {
  width?: number | string,
  align?: 'start' | 'center' | 'end',
  allowsResizing?: boolean,
  allowsReordering?: boolean,
  allowsSorting?: boolean,
  isSticky?: boolean // shouldStick??
}

export interface TableBodyProps<T> extends AsyncLoadable<T> {
  children: CollectionChildren<T>
}

export interface RowProps<T> {
  // treeble case?
  childItems?: Iterable<T>,
  hasChildItems?: boolean,
  children: CellElement | CellElement[] | CellRenderer,
  textValue?: string, // ???
  'aria-label'?: string, // ???
  uniqueKey?: Key
}

export interface CellProps {
  children: ReactNode,
  textValue?: string,
  'aria-label'?: string
}

export type CellElement = ReactElement<CellProps>;
export type CellRenderer = (column: Column) => CellElement;
