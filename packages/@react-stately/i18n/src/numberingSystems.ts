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

export type NumberingSystem = 'arab' | 'hanidec' | 'latn';

// known supported numbering systems
const numberingSystems = {
  arab: [...('٠١٢٣٤٥٦٧٨٩')],
  hanidec: [...('〇一二三四五六七八九')],
  latn: [...('0123456789')]
};

export function getNumberingSystem(value: string): NumberingSystem {
  for (let i in [...value]) {
    let char = value[i];
    let system = Object.keys(numberingSystems)
      .find(key => numberingSystems[key].some(numeral => numeral === char));

    if (system) {
      return system as NumberingSystem;
    }
  }
}
