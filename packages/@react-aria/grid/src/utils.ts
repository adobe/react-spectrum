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

import { GridState } from "@react-stately/grid";
import { Key } from "react";

export const gridIds = new WeakMap<GridState<unknown>, string>();

function normalizeKey(key: Key): string {
  if (typeof key === 'string') {
    return key.replace(/\s*/g, '');
  }

  return '' + key;
}

export function getColumnHeaderId<T>(state: GridState<T>, columnKey: Key): string {
  let gridId = gridIds.get(state);
  if (!gridId) {
    throw new Error('Unknown grid');
  }

  return `${gridId}-${normalizeKey(columnKey)}`;
}

export function getCellId<T>(state: GridState<T>, rowKey: Key, columnKey: Key) {
  let gridId = gridIds.get(state);
  if (!gridId) {
    throw new Error('Unknown grid');
  }

  return `${gridId}-${normalizeKey(rowKey)}-${normalizeKey(columnKey)}`;
}

export function getRowLabelledBy<T>(state: GridState<T>, rowKey: Key): string {
  let columns = state.collection.headerRows[state.collection.headerRows.length - 1];
  if (!columns) {
    return '';
  }

  return columns.map(c => `${getColumnHeaderId(state, c.key)} ${getCellId(state, rowKey, c.key)}`).join(' ');
}
