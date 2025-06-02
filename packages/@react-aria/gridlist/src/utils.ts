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

import {Key} from '@react-types/shared';
import type {ListState} from '@react-stately/list';

interface ListMapShared {
  id: string,
  onAction?: (key: Key) => void,
  linkBehavior?: 'action' | 'selection' | 'override',
  keyboardNavigationBehavior: 'arrow' | 'tab',
  shouldSelectOnPressUp?: boolean
}

// Used to share:
// id of the list and onAction between useList, useListItem, and useListSelectionCheckbox
export const listMap = new WeakMap<ListState<unknown>, ListMapShared>();

export function getRowId<T>(state: ListState<T>, key: Key): string {
  let {id} = listMap.get(state) ?? {};
  if (!id) {
    throw new Error('Unknown list');
  }

  return `${id}-${normalizeKey(key)}`;
}

export function normalizeKey(key: Key): string {
  if (typeof key === 'string') {
    return key.replace(/\s*/g, '');
  }

  return '' + key;
}
