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

import {CollectionBase, DOMProps, ItemProps, MultipleSelection, Node, StyleProps} from '@react-types/shared';
import {GridState} from '@react-stately/grid';
import {Key, RefObject} from 'react';

export interface TagGroupProps<T> extends CollectionBase<T>, MultipleSelection {
  disabledKeys?: Iterable<Key>,
  isDisabled?: boolean,
  isRemovable?: boolean,
  onRemove?: (items: any[]) => void
}

export interface SpectrumTagGroupProps<T> extends TagGroupProps<T>, DOMProps, StyleProps {}

export interface TagProps<T> extends ItemProps<any> {
  isDisabled?: boolean,
  isFocused: boolean,
  isRemovable?: boolean,
  item: Node<T>,
  onRemove?: (item, e) => void,
  tagRef: RefObject<HTMLElement>,
  tagRowRef: RefObject<HTMLElement>
}

export interface SpectrumTagProps<T> extends TagProps<T> {
  state: GridState<any, any>
}
