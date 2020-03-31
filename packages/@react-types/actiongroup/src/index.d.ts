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

import {DOMProps, ItemElement, ItemRenderer, MultipleSelection, StyleProps, Orientation} from '@react-types/shared';
import { Key } from 'react';

// Not extending CollectionBase to avoid async loading props
export interface ActionGroupProps<T> extends DOMProps, StyleProps, MultipleSelection {
  orientation?: Orientation,
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>,
  items?: Iterable<T>,
  itemKey?: string,
  disabledKeys?: Iterable<Key>,
  isDisabled?: boolean
}

export interface SpectrumActionGroupProps<T> extends ActionGroupProps<T> {
  isEmphasized?: boolean,
  isConnected?: boolean
  isJustified?: boolean,
  isQuiet?: boolean,
  holdAffordance?: boolean
}
