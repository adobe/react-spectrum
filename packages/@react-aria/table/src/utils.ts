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

import {Key} from 'react';
import {TableState} from '@react-stately/table';

export const gridIds = new WeakMap<TableState<unknown>, string>();

function normalizeKey(key: Key): string {
  if (typeof key === 'string') {
    return key.replace(/\s*/g, '');
  }

  return '' + key;
}

export function getColumnHeaderId<T>(state: TableState<T>, columnKey: Key): string {
  let gridId = gridIds.get(state);
  if (!gridId) {
    throw new Error('Unknown grid');
  }

  return `${gridId}-${normalizeKey(columnKey)}`;
}

export function getCellId<T>(state: TableState<T>, rowKey: Key, columnKey: Key) {
  let gridId = gridIds.get(state);
  if (!gridId) {
    throw new Error('Unknown grid');
  }

  return `${gridId}-${normalizeKey(rowKey)}-${normalizeKey(columnKey)}`;
}

export function getSectionId<T>(state: TableState<T>, rowKey: Key) {
  let gridId = gridIds.get(state);
  if (!gridId) {
    throw new Error('Unknown grid');
  }

  return `${gridId}-${normalizeKey(rowKey)}`;
}

export function getRowLabelledBy<T>(state: TableState<T>, rowKey: Key): string {
  // A row is labelled by it's row headers and section if available.
  // TODO: maybe only do it for the first and last row? Or do we need this? Maybe it is sufficient that the user
  // will navigate via ctrl + option + arrow keys and passes the section row
  let acc = [];
  let collection = state.collection;
  let row = collection.getItem(rowKey);
  let rowParent = collection.getItem(row.parentKey);
  if (rowParent != null && rowParent.type === 'section') {
    acc.push(getSectionId(state, rowParent.key));
  }

  return acc.concat([...collection.rowHeaderColumnKeys].map(columnKey =>
    getCellId(state, rowKey, columnKey)
  )).join(' ');
}
