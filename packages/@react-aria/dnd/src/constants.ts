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

export enum DROP_OPERATION {
  none = 0,
  cancel = 0,
  move = 1 << 0,
  copy = 1 << 1,
  link = 1 << 2,
  all = move | copy | link
}

// See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed
export const DROP_OPERATION_ALLOWED = {
  ...DROP_OPERATION,
  copyMove: DROP_OPERATION.copy | DROP_OPERATION.move,
  copyLink: DROP_OPERATION.copy | DROP_OPERATION.link,
  linkMove: DROP_OPERATION.link | DROP_OPERATION.move,
  all: DROP_OPERATION.all,
  uninitialized: DROP_OPERATION.all
};

export const EFFECT_ALLOWED = invert(DROP_OPERATION_ALLOWED);
EFFECT_ALLOWED[DROP_OPERATION.all] = 'all'; // ensure we don't map to 'uninitialized'.

export const DROP_EFFECT = invert(DROP_OPERATION);
export const DROP_EFFECT_TO_DROP_OPERATION: {[name: string]: DropOperation} = {
  none: 'cancel',
  link: 'link',
  copy: 'copy',
  move: 'move'
};

export const DROP_OPERATION_TO_DROP_EFFECT = invert(DROP_EFFECT_TO_DROP_OPERATION);

function invert(object) {
  let res = {};
  for (let key in object) {
    res[object[key]] = key;
  }

  return res;
}

export const NATIVE_DRAG_TYPES = new Set(['text/plain', 'text/uri-list', 'text/html']);
export const CUSTOM_DRAG_TYPE = 'application/vnd.react-aria.items+json';
export const GENERIC_TYPE = 'application/octet-stream';
