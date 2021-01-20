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

/**
 * Takes a value and forces it to the closest min/max if it's outside. Also forces it to the closest valid step.
 */
export function clamp(value: number, min: number = -Infinity, max: number = Infinity): number {
  let newValue = Math.min(Math.max(value, min), max);
  return newValue;
}

export function roundToStep(value: number, step: number): number {
  if (!isNaN(step)) {
    // have to avoid Math.round(num / multiple) * multiple; because it can give results like "0.3000000000000004" for Round(.2 + .1, .1)
    let diff = Math.abs(value % step);
    if (value >= 0) {
      return diff > (step / 2) ? (value - diff + step) : value - diff;
    } else {
      return diff > (step / 2) ? (value + diff - step) : value + diff;
    }
  }
  return value;
}

export function snapValueToStep(value: number, min: number, max: number, step: number): number {
  let remainder = ((value - min) % step);
  let snappedValue = Math.abs(remainder) * 2 >= step
    ? (value - Math.abs(remainder)) + step
    : value - remainder;

  if (snappedValue < min) {
    snappedValue = min;
  } else if (snappedValue > max) {
    snappedValue = min + Math.floor((max - min) / step) * step;
  }

  // correct floating point behavior by rounding to step precision
  let string = step.toString();
  let index = string.indexOf('.');
  let precision = index >= 0 ? string.length - index : 0;

  if (precision > 0) {
    let pow = Math.pow(10, precision);
    snappedValue = Math.round(snappedValue * pow) / pow;
  }

  return snappedValue;
}
