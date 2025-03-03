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

import {Collection, Key, Node} from '@react-types/shared';

export interface GridCollection<T> extends Collection<GridNode<T>> {
  /** The number of columns in the grid. */
  columnCount: number,
  /** A list of rows in the grid. */
  rows: GridNode<T>[]
}

export interface GridRow<T> extends Partial<GridNode<T>> {
  key?: Key,
  type: string,
  childNodes: Iterable<Node<T>>
}

export interface GridNode<T> extends Node<T> {
  column?: GridNode<T>,
  /**
   * The number of columns spanned by this cell. Use `colSpan` instead.
   * @deprecated
   */
  colspan?: number,
  /** The number of columns spanned by this cell.  */
  colSpan?: number | null,
  /** The column index of this cell, accounting for any colSpans. */
  colIndex?: number | null,
  /** The index of this node within its parent, ignoring sibling nodes that aren't of the same type. */
  indexOfType?: number
}
