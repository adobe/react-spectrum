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

import {Color} from './Color';
import {ColorInput} from '@react-types/color';
import {useMemo} from 'react';

export function useColor(value: ColorInput) {
  let color = useMemo(() => {
    if (typeof value === 'string') {
      try {
        return new Color(value);
      } catch (err) {
        return undefined;
      }
    }
    return value;
  }, [value]);

  let colorInt = useMemo(() => color ? color.toHexInt() : undefined, [color]);
  return {color, colorInt};
}
