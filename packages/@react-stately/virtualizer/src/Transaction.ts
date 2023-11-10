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
import {LayoutInfo} from './LayoutInfo';
import {ReusableView} from './ReusableView';

type LayoutInfoMap = Map<Key, LayoutInfo>;
export class Transaction<T extends object, V> {
  level = 0;
  actions: (() => void)[] = [];
  animated = true;
  initialMap: LayoutInfoMap = new Map();
  finalMap: LayoutInfoMap = new Map();
  initialLayoutInfo: LayoutInfoMap = new Map();
  finalLayoutInfo: LayoutInfoMap = new Map();
  removed: Map<Key, ReusableView<T, V>> = new Map();
  toRemove: Map<Key, ReusableView<T, V>> = new Map();
}
