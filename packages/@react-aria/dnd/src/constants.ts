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

import {DropOperation} from '@react-types/shared';

export interface IDropOperation {
  readonly none: 0,
  readonly cancel: 0,
  readonly move: number,
  readonly copy: number,
  readonly link: number,
  readonly all: number
}

export const DROP_OPERATION: IDropOperation = {
  none: 0,
  cancel: 0,
  move: 1 << 0,
  copy: 1 << 1,
  link: 1 << 2,
  get all() { return this.move | this.copy | this.link; }
} as const;

interface DropOperationAllowed extends IDropOperation {
  readonly copyMove: number,
  readonly copyLink: number,
  readonly linkMove: number,
  readonly all: number,
  readonly uninitialized: number
}
// See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed
export const DROP_OPERATION_ALLOWED: DropOperationAllowed = {
  ...DROP_OPERATION,
  copyMove: DROP_OPERATION.copy | DROP_OPERATION.move,
  copyLink: DROP_OPERATION.copy | DROP_OPERATION.link,
  linkMove: DROP_OPERATION.link | DROP_OPERATION.move,
  all: DROP_OPERATION.all,
  uninitialized: DROP_OPERATION.all
};

interface EffectAllowed {
  0: 'none' | 'cancel',
  1: 'move',
  2: 'copy',
  3: 'copyMove',
  4: 'link',
  5: 'linkMove',
  6: 'copyLink',
  7: 'all'
}
export const EFFECT_ALLOWED: EffectAllowed = invert(DROP_OPERATION_ALLOWED) as unknown as EffectAllowed;
EFFECT_ALLOWED[DROP_OPERATION.all] = 'all'; // ensure we don't map to 'uninitialized'.

interface DropEffect {
  0: 'none' | 'cancel',
  1: 'move',
  2: 'copy',
  4: 'link',
  7: 'all'
}
export const DROP_EFFECT: DropEffect = invert(DROP_OPERATION) as unknown as DropEffect;

export const DROP_EFFECT_TO_DROP_OPERATION: {[name: string]: DropOperation} = {
  none: 'cancel' as DropOperation,
  link: 'link' as DropOperation,
  copy: 'copy' as DropOperation,
  move: 'move' as DropOperation
};

interface DropOperationToDropEffect {
  'cancel': 'none',
  'link': 'link',
  'copy': 'copy',
  'move': 'move'
}
export const DROP_OPERATION_TO_DROP_EFFECT: DropOperationToDropEffect = invert(DROP_EFFECT_TO_DROP_OPERATION) as unknown as DropOperationToDropEffect;

function invert<T extends string | number, C extends string | number>(object: Record<T, C>): Record<C, T> {
  let res: Record<C, T> = {} as Record<C, T>;
  for (let key in object) {
    res[object[key]] = key as T;
  }

  return res;
}

export const NATIVE_DRAG_TYPES: Set<string> = new Set(['text/plain', 'text/uri-list', 'text/html']);
export const CUSTOM_DRAG_TYPE = 'application/vnd.react-aria.items+json';
export const GENERIC_TYPE = 'application/octet-stream';
