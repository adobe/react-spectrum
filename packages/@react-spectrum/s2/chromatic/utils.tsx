/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {generatePowerset} from '@react-spectrum/story-utils';

export function shortName(key, value) {
  let returnVal = '';
  switch (key) {
    case 'defaultSelected':
      returnVal = 'selected';
      break;
    case 'isIndeterminate':
      returnVal = 'indet';
      break;
    case 'isQuiet':
      returnVal = 'q';
      break;
    case 'isDisabled':
      returnVal = 'd';
      break;
    case 'isEmphasized':
      returnVal = 'emp';
      break;
    case 'isInvalid':
      returnVal = 'invalid';
      break;
    case 'isReadOnly':
      returnVal = 'ro';
      break;
    case 'isRequired':
      returnVal = 'req';
      break;
    case 'isSelected':
      returnVal = 'selec';
      break;
    case 'orientation':
      returnVal = `orien: ${value}`;
      break;
    case 'necessityIndicator':
      returnVal = `indicator: ${value}`;
      break;
    case 'size':
      returnVal = `size: ${value}`;
      break;
    case 'staticColor':
      returnVal = `static: ${value}`;
      break;
    case 'fillStyle':
      returnVal = `fill: ${value}`;
      break;
    case 'variant':
      returnVal = `var: ${value}`;
      break;
    case 'align':
      returnVal = `align: ${value}`;
      break;
    case 'labelAlign':
      returnVal = `align: ${value}`;
      break;
    case 'labelPosition':
      returnVal = `pos: ${value}`;
      break;
    case 'hideStepper':
      returnVal = 'hidestep';
      break;
  }
  return returnVal;
}

export function generateComboChunks(opts: {states: Array<object>, exclude?: (merged: any) => boolean, numChunks: number}) {
  let {states, exclude, numChunks} = opts;
  let combos = generatePowerset(states, exclude);
  let chunks: any[] = [];
  let chunkSize =  Math.ceil(combos.length / numChunks);
  for (let i = 0; i < numChunks; i++) {
    chunks.push(combos.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  return chunks;
}
