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

import {Color, ColorWheelProps} from '@react-types/color';
import {parseColor} from './Color';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export interface ColorWheelState {
  readonly value: Color,
  setValue(value: string | Color): void,

  readonly hue: number,
  setHue(value: number): void,

  setHueFromPoint(x: number, y: number, radius: number): void,
  getThumbPosition(radius: number): {x: number, y: number},

  increment(minStepSize?: number): void,
  decrement(minStepSize?: number): void,

  isDragging: boolean,
  setDragging(value: boolean): void
}

function normalizeColor(v: string | Color) {
  if (typeof v === 'string') {
    return parseColor(v);
  } else {
    return v;
  }
}

const DEFAULT_COLOR = parseColor('hsl(0, 100%, 50%)');

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function roundDown(v: number) {
  let r = Math.floor(v);
  if (r === v) {
    return v - 1;
  } else {
    return r;
  }
}

function degToRad(deg: number) {
  return deg * Math.PI / 180;
}

function radToDeg(rad: number) {
  return rad * 180 / Math.PI;
}

// 0deg = 3 o'clock. increases clockwise
function angleToCartesian(angle: number, radius: number): {x: number, y: number} {
  let rad = degToRad(360 - angle + 90);
  let x = Math.sin(rad) * (radius);
  let y = Math.cos(rad) * (radius);
  return {x, y};
}

function cartesianToAngle(x: number, y: number, radius: number): number {
  let deg = radToDeg(Math.atan2(y / radius, x / radius));
  return (deg + 360) % 360;
}

export function useColorWheelState(props: ColorWheelProps): ColorWheelState {
  let {defaultValue, onChange, step = 1} = props;

  if (!props.value && !defaultValue) {
    defaultValue = DEFAULT_COLOR;
  }

  let [value, setValue] = useControlledState(normalizeColor(props.value), normalizeColor(defaultValue), onChange);
  let [isDragging, setDragging] = useState(false);

  let hue = value.getChannelValue('hue');
  function setHue(v: number) {
    if (v > 360) {
      // Make sure you can always get back to 0.
      v = 0;
    }
    v = roundToStep(mod(v, 360), step);
    if (hue !== v) {
      setValue(value.withChannelValue('hue', v));
    }
  }

  return {
    value,
    setValue(v) {
      setValue(normalizeColor(v));
    },
    hue,
    setHue,
    setHueFromPoint(x, y, radius) {
      setHue(cartesianToAngle(x, y, radius));
    },
    getThumbPosition(radius) {
      return angleToCartesian(value.getChannelValue('hue'), radius);
    },
    increment(minStepSize: number = 0) {
      let newValue = hue + Math.max(minStepSize, step);
      if (newValue > 360) {
        // Make sure you can always get back to 0.
        newValue = 0;
      }
      setHue(newValue);
    },
    decrement(minStepSize: number = 0) {
      let s = Math.max(minStepSize, step);
      if (hue === 0) {
        // We can't just subtract step because this might be the case:
        // |(previous step) - 0| < step size
        setHue(roundDown(360 / s) * s);
      } else {
        setHue(hue - s);
      }
    },
    setDragging(value) {
      setDragging(value);
    },
    isDragging
  };
}
