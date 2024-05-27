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
import {normalizeColor, normalizeHue, parseColor} from './Color';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useRef, useState} from 'react';

export interface ColorWheelState {
  /** The current color value represented by the color wheel. */
  readonly value: Color,
  /** Sets the color value represented by the color wheel, and triggers `onChange`. */
  setValue(value: string | Color): void,

  /** The current value of the hue channel displayed by the color wheel. */
  readonly hue: number,
  /** Sets the hue channel of the current color value and triggers `onChange`. */
  setHue(value: number): void,

  /** Sets the hue channel of the current color value based on the given coordinates and radius of the color wheel, and triggers `onChange`. */
  setHueFromPoint(x: number, y: number, radius: number): void,
  /** Returns the coordinates of the thumb relative to the center point of the color wheel. */
  getThumbPosition(radius: number): {x: number, y: number},

  /** Increments the hue by the given amount (defaults to 1). */
  increment(stepSize?: number): void,
  /** Decrements the hue by the given amount (defaults to 1). */
  decrement(stepSize?: number): void,

  /** Whether the color wheel is currently being dragged. */
  readonly isDragging: boolean,
  /** Sets whether the color wheel is being dragged. */
  setDragging(value: boolean): void,
  /** Returns the color that should be displayed in the color wheel instead of `value`. */
  getDisplayColor(): Color,
  /** The step value of the hue channel, used when incrementing and decrementing. */
  step: number,
  /** The page step value of the hue channel, used when incrementing and decrementing. */
  pageStep: number,

  /** Whether the color wheel is disabled. */
  readonly isDisabled: boolean
}

const DEFAULT_COLOR = parseColor('hsl(0, 100%, 50%)');

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
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

/**
 * Provides state management for a color wheel component.
 * Color wheels allow users to adjust the hue of an HSL or HSB color value on a circular track.
 */
export function useColorWheelState(props: ColorWheelProps): ColorWheelState {
  let {defaultValue, onChange, onChangeEnd} = props;

  if (!props.value && !defaultValue) {
    defaultValue = DEFAULT_COLOR;
  }

  let [stateValue, setValueState] = useControlledState(normalizeColor(props.value), normalizeColor(defaultValue), onChange);
  let value = useMemo(() => {
    let colorSpace = stateValue.getColorSpace();
    return colorSpace === 'hsl' || colorSpace === 'hsb' ? stateValue : stateValue.toFormat('hsl');
  }, [stateValue]);
  let valueRef = useRef(value);
  let setValue = (value: Color) => {
    valueRef.current = value;
    setValueState(value);
  };

  let channelRange = value.getChannelRange('hue');
  let {minValue: minValueX, maxValue: maxValueX, step: step, pageSize: pageStep} = channelRange;
  let [isDragging, setDragging] = useState(false);
  let isDraggingRef = useRef(false);

  let hue = value.getChannelValue('hue');
  function setHue(v: number) {
    if (v > 360) {
      // Make sure you can always get back to 0.
      v = 0;
    }
    v = roundToStep(normalizeHue(v), step);
    if (hue !== v) {
      let color = value.withChannelValue('hue', v);
      setValue(color);
    }
  }

  return {
    value,
    step,
    pageStep,
    setValue(v) {
      let color = normalizeColor(v);
      setValue(color);
    },
    hue,
    setHue,
    setHueFromPoint(x, y, radius) {
      setHue(cartesianToAngle(x, y, radius));
    },
    getThumbPosition(radius) {
      return angleToCartesian(value.getChannelValue('hue'), radius);
    },
    increment(stepSize = 1) {
      let s = Math.max(stepSize, step);
      let newValue = hue + s;
      if (newValue >= maxValueX) {
        // Make sure you can always get back to 0.
        newValue = minValueX;
      }
      setHue(roundToStep(normalizeHue(newValue), s));
    },
    decrement(stepSize = 1) {
      let s = Math.max(stepSize, step);
      if (hue === 0) {
        // We can't just subtract step because this might be the case:
        // |(previous step) - 0| < step size
        setHue(roundDown(360 / s) * s);
      } else {
        setHue(roundToStep(normalizeHue(hue - s), s));
      }
    },
    setDragging(isDragging) {
      let wasDragging = isDraggingRef.current;
      isDraggingRef.current = isDragging;

      if (onChangeEnd && !isDragging && wasDragging) {
        onChangeEnd(valueRef.current);
      }

      setDragging(isDragging);
    },
    isDragging,
    getDisplayColor() {
      return value.toFormat('hsl').withChannelValue('saturation', 100).withChannelValue('lightness', 50).withChannelValue('alpha', 1);
    },
    isDisabled: props.isDisabled || false
  };
}
