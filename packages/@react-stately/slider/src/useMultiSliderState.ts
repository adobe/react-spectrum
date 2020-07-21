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

import {clamp} from '@react-aria/utils';
import {MultiSliderProps} from '@react-types/slider';
import {useControlledState} from '@react-stately/utils';
import {useNumberFormatter} from '@react-aria/i18n';
import {useRef, useState} from 'react';

export interface MultiSliderState {
  // Values managed by the slider
  readonly values: number[];
  setValue: (index: number, value: number) => void;

  // Whether a specific index is being dragged
  isDragging: (index: number) => boolean;
  setDragging: (index: number, dragging: boolean) => void;

  // Currently-focused index
  readonly focusedIndex: number | undefined;
  setFocusedIndex: (index: number | undefined) => void;

  // Returns the value offset as a percentage from 0 to 1.
  getOffsetPercentForIndex: (index: number) => number;
  getOffsetPercentForValue: (value: number) => number;

  // Returns the string label for the value, per props.formatOptions
  getValueLabelForIndex: (index: number) => string;
  getValueLabelForValue: (value: number) => string;

  // Returns the min and max values for the index
  getMinValueForIndex: (index: number) => number;
  getMaxValueForIndex: (index: number) => number;
}

export const DEFAULT_MIN_VALUE = 0;
export const DEFAULT_MAX_VALUE = 100;
export const DEFAULT_STEP_VALUE = 1;

export function useMultiSliderState(props: MultiSliderProps): MultiSliderState {
  let {isReadOnly, isDisabled, minValue = DEFAULT_MIN_VALUE, maxValue = DEFAULT_MAX_VALUE, formatOptions} = props;

  const [values, setValues] = useControlledState<number[]>(
    props.value as any,
    props.defaultValue ?? [minValue] as any,
    props.onChange as any
  );
  const [isDraggings, setDraggings] = useState<boolean[]>(new Array(values.length).fill(false));
  const [focusedIndex, setFocusedIndex] = useState<number|undefined>(undefined);
  const realTimeDragging = useRef(false);
  const formatter = useNumberFormatter(formatOptions);

  function getOffsetPercentForValue(value: number) {
    return (value - minValue) / (maxValue - minValue);
  }

  function getMinValueForIndex(index: number) {
    return index === 0 ? minValue : values[index - 1];
  }
  function getMaxValueForIndex(index: number) {
    return index === values.length - 1 ? maxValue : values[index + 1];
  }

  function updateValue(index: number, value: number) {
    if (isReadOnly || isDisabled) {
      return;
    }
    const thisMin = getMinValueForIndex(index);
    const thisMax = getMaxValueForIndex(index);
    value = clamp(value, thisMin, thisMax);
    const newValues = replaceIndex(values, index, value);
    setValues(newValues);

    if (props.onChangeEnd && !realTimeDragging.current) {
      // If not in the middle of dragging, call onChangeEnd
      props.onChangeEnd(newValues);
    }
  }

  function updateDragging(index: number, dragging: boolean) {
    setDraggings(replaceIndex(isDraggings, index, dragging));
    realTimeDragging.current = dragging;
  }

  function getValueLabelForValue(value: number) {
    return formatter.format(value);
  }

  return {
    values: values,
    setValue: updateValue,
    isDragging: (index: number) => isDraggings[index],
    setDragging: updateDragging,
    focusedIndex,
    setFocusedIndex,
    getOffsetPercentForIndex: (index: number) => getOffsetPercentForValue(values[index]),
    getOffsetPercentForValue,
    getValueLabelForIndex: (index: number) => getValueLabelForValue(values[index]),
    getValueLabelForValue,
    getMinValueForIndex,
    getMaxValueForIndex
  };
}

function replaceIndex<T>(array: T[], index: number, value: T) {
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}
