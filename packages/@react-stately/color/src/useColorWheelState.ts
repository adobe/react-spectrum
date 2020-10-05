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
import {ColorWheelProps} from '@react-types/color';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export interface ColorWheelState {
  readonly value: Color,
  setValue(value: string | Color): void,

  readonly hue: number,
  setHue(value: number): void,

  isDragging: boolean,
  setDragging(value: boolean): void
}

function normalizeColor(v: string | Color) {
  if (typeof v === 'string') {
    return new Color(v);
  } else {
    return v;
  }
}

const DEFAULT_COLOR = new Color('hsl(0, 100%, 50%)');

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

export function useColorWheelState(props: ColorWheelProps): ColorWheelState {
  let {defaultValue, onChange, step = 1} = props;

  if (!props.value && !defaultValue) {
    defaultValue = DEFAULT_COLOR;
  }

  let [value, setValue] = useControlledState(normalizeColor(props.value), normalizeColor(defaultValue), onChange);

  let [isDragging, setDragging] = useState(false);

  return {
    value,
    setValue(v) {
      setValue(normalizeColor(v));
    },

    hue: value.getChannelValue('hue'),
    setHue(v) {
      v = roundToStep(mod(v, 360), step);
      if (value.getChannelValue('hue') !== v) {
        setValue(value.withChannelValue('hue', v));
      }
    },

    setDragging(value) {
      setDragging(value);
    },
    isDragging
  };
}
