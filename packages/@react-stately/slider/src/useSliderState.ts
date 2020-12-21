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

import {clamp, snapValueToStep} from '@react-aria/utils';
import {SliderProps} from '@react-types/slider';
import {useControlledState} from '@react-stately/utils';
import {useRef, useState} from 'react';

export interface SliderState {
  /**
   * Values managed by the slider by thumb index.
   */
  readonly values: number[],
  /**
   * Get the value for the specified thumb.
   * @param index
   */
  getThumbValue(index: number): number,

  /**
   * Sets the value for the specified thumb.
   * The actual value set will be clamped and rounded according to min/max/step.
   * @param index
   * @param value
   */
  setThumbValue(index: number, value: number): void,

  /**
   * Sets value for the specified thumb by percent offset (between 0 and 1).
   * @param index
   * @param percent
   */
  setThumbPercent(index: number, percent: number): void,

  /**
   * Whether the specific thumb is being dragged.
   * @param index
   */
  isThumbDragging(index: number): boolean,
  /**
   * Set is dragging on the specified thumb.
   * @param index
   * @param dragging
   */
  setThumbDragging(index: number, dragging: boolean): void,

  /**
   * Currently-focused thumb index.
   */
  readonly focusedThumb: number | undefined,
  /**
   * Set focused true on specified thumb. This will remove focus from
   * any thumb that had it before.
   * @param index
   */
  setFocusedThumb(index: number | undefined): void,

  /**
   * Returns the specified thumb's value as a percentage from 0 to 1.
   * @param index
   */
  getThumbPercent(index: number): number,

  /**
   * Returns the value as a percent between the min and max of the slider.
   * @param index
   */
  getValuePercent(value: number): number,

  /**
   * Returns the string label for the specified thumb's value, per props.formatOptions.
   * @param index
   */
  getThumbValueLabel(index: number): string,

  /**
   * Returns the string label for the value, per props.formatOptions.
   * @param index
   */
  getFormattedValue(value: number): string,

  /**
   * Returns the min allowed value for the specified thumb.
   * @param index
   */
  getThumbMinValue(index: number): number,

  /**
   * Returns the max allowed value for the specified thumb.
   * @param index
   */
  getThumbMaxValue(index: number): number,

  /**
   * Converts a percent along track (between 0 and 1) to the corresponding value.
   * @param percent
   */
  getPercentValue(percent: number): number,

  /**
   * Returns if the specified thumb is editable.
   * @param index
   */
  isThumbEditable(index: number): boolean,

  /**
   * Set the specified thumb's editable state.
   * @param index
   * @param editable
   */
  setThumbEditable(index: number, editable: boolean): void,

  /**
   * The step amount for the slider.
   */
  readonly step: number
}

const DEFAULT_MIN_VALUE = 0;
const DEFAULT_MAX_VALUE = 100;
const DEFAULT_STEP_VALUE = 1;

interface SliderStateOptions extends SliderProps {
  numberFormatter: Intl.NumberFormat
}

/**
 * Provides state management for a slider component. Stores values for all thumbs,
 * formats values for localization, and provides methods to update the position
 * of any thumbs.
 * @param props
 */
export function useSliderState(props: SliderStateOptions): SliderState {
  const {isDisabled, minValue = DEFAULT_MIN_VALUE, maxValue = DEFAULT_MAX_VALUE, numberFormatter: formatter, step = DEFAULT_STEP_VALUE} = props;

  const [values, setValues] = useControlledState<number[]>(
    props.value as any,
    props.defaultValue ?? [minValue] as any,
    props.onChange as any
  );
  const [isDraggings, setDraggings] = useState<boolean[]>(new Array(values.length).fill(false));
  const isEditablesRef = useRef<boolean[]>(new Array(values.length).fill(true));
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(undefined);

  const valuesRef = useRef<number[]>(null);
  valuesRef.current = values;
  const isDraggingsRef = useRef<boolean[]>(null);
  isDraggingsRef.current = isDraggings;

  function getValuePercent(value: number) {
    return (value - minValue) / (maxValue - minValue);
  }

  function getThumbMinValue(index: number) {
    return index === 0 ? minValue : values[index - 1];
  }
  function getThumbMaxValue(index: number) {
    return index === values.length - 1 ? maxValue : values[index + 1];
  }

  function isThumbEditable(index: number) {
    return isEditablesRef.current[index];
  }

  function setThumbEditable(index: number, editable: boolean) {
    isEditablesRef.current[index] = editable;
  }

  function updateValue(index: number, value: number) {
    if (isDisabled || !isThumbEditable(index)) {
      return;
    }
    const thisMin = getThumbMinValue(index);
    const thisMax = getThumbMaxValue(index);

    // Round value to multiple of step, clamp value between min and max
    value = snapValueToStep(value, thisMin, thisMax, step);
    valuesRef.current = replaceIndex(valuesRef.current, index, value);
    setValues(valuesRef.current);
  }

  function updateDragging(index: number, dragging: boolean) {
    if (isDisabled || !isThumbEditable(index)) {
      return;
    }

    const wasDragging = isDraggingsRef.current[index];
    isDraggingsRef.current = replaceIndex(isDraggingsRef.current, index, dragging);
    setDraggings(isDraggingsRef.current);

    // Call onChangeEnd if no handles are dragging.
    if (props.onChangeEnd && wasDragging && !isDraggingsRef.current.some(Boolean)) {
      props.onChangeEnd(valuesRef.current);
    }
  }

  function getFormattedValue(value: number) {
    return formatter.format(value);
  }

  function setThumbPercent(index: number, percent: number) {
    updateValue(index, getPercentValue(percent));
  }

  function getRoundedValue(value: number) {
    return Math.round((value - minValue) / step) * step + minValue;
  }

  function getPercentValue(percent: number) {
    const val = percent * (maxValue - minValue) + minValue;
    return clamp(getRoundedValue(val), minValue, maxValue);
  }

  return {
    values: values,
    getThumbValue: (index: number) => values[index],
    setThumbValue: updateValue,
    setThumbPercent,
    isThumbDragging: (index: number) => isDraggings[index],
    setThumbDragging: updateDragging,
    focusedThumb: focusedIndex,
    setFocusedThumb: setFocusedIndex,
    getThumbPercent: (index: number) => getValuePercent(values[index]),
    getValuePercent,
    getThumbValueLabel: (index: number) => getFormattedValue(values[index]),
    getFormattedValue,
    getThumbMinValue,
    getThumbMaxValue,
    getPercentValue,
    isThumbEditable,
    setThumbEditable,
    step
  };
}

function replaceIndex<T>(array: T[], index: number, value: T) {
  if (array[index] === value) {
    return array;
  }

  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}
