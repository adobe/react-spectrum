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

import {clamp, snapValueToStep, useControlledState} from '@react-stately/utils';
import {Color, ColorAreaProps, ColorChannel} from '@react-types/color';
import {normalizeColor, parseColor} from './Color';
import {useMemo, useRef, useState} from 'react';

export interface ColorAreaState {
  /** The current color value displayed by the color area. */
  readonly value: Color,
  /** The default value of the color area. */
  readonly defaultValue: Color,
  /** Sets the current color value. If a string is passed, it will be parsed to a Color. */
  setValue(value: string | Color): void,

  /** The current value of the horizontal axis channel displayed by the color area. */
  xValue: number,
  /** Sets the value for the horizontal axis channel displayed by the color area, and triggers `onChange`. */
  setXValue(value: number): void,

  /** The current value of the vertical axis channel displayed by the color area. */
  yValue: number,
  /** Sets the value for the vertical axis channel displayed by the color area, and triggers `onChange`. */
  setYValue(value: number): void,

  /** Sets the x and y channels of the current color value based on a percentage of the width and height of the color area, and triggers `onChange`. */
  setColorFromPoint(x: number, y: number): void,
  /** Returns the coordinates of the thumb relative to the upper left corner of the color area as a percentage. */
  getThumbPosition(): {x: number, y: number},

  /** Increments the value of the horizontal axis channel by the channel step or page amount. */
  incrementX(stepSize?: number): void,
  /** Decrements the value of the horizontal axis channel by the channel step or page amount. */
  decrementX(stepSize?: number): void,

  /** Increments the value of the vertical axis channel by the channel step or page amount. */
  incrementY(stepSize?: number): void,
  /** Decrements the value of the vertical axis channel by the channel step or page amount. */
  decrementY(stepSize?: number): void,

  /** Whether the color area is currently being dragged. */
  readonly isDragging: boolean,
  /** Sets whether the color area is being dragged. */
  setDragging(value: boolean): void,

  /** Returns the xChannel, yChannel and zChannel names based on the color value. */
  channels: {xChannel: ColorChannel, yChannel: ColorChannel, zChannel: ColorChannel},
  /** The step value of the xChannel, used when incrementing and decrementing. */
  xChannelStep: number,
  /** The step value of the yChannel, used when incrementing and decrementing. */
  yChannelStep: number,
  /** The page step value of the xChannel, used when incrementing and decrementing. */
  xChannelPageStep: number,
  /** The page step value of the yChannel, used when incrementing and decrementing. */
  yChannelPageStep: number,

  /** Returns the color that should be displayed in the color area thumb instead of `value`. */
  getDisplayColor(): Color
}

const DEFAULT_COLOR = parseColor('#ffffff');
/**
 * Provides state management for a color area component.
 * Color area allows users to adjust two channels of an HSL, HSB or RGB color value against a two-dimensional gradient background.
 */
export function useColorAreaState(props: ColorAreaProps): ColorAreaState {
  let {
    value,
    defaultValue,
    colorSpace,
    xChannel,
    yChannel,
    onChange,
    onChangeEnd
  } = props;

  if (!value && !defaultValue) {
    defaultValue = DEFAULT_COLOR;
  }
  if (value) {
    value = normalizeColor(value);
  }
  if (defaultValue) {
    defaultValue = normalizeColor(defaultValue);
  }

  // safe to cast value and defaultValue to Color, one of them will always be defined because if neither are, we assign a default
  let [colorValue, setColorState] = useControlledState<Color>(value as Color, defaultValue as Color, onChange);
  let [initialValue] = useState(colorValue);
  let color = useMemo(() => colorSpace && colorValue ? colorValue.toFormat(colorSpace) : colorValue, [colorValue, colorSpace]);
  let valueRef = useRef(color);
  let setColor = (color: Color) => {
    valueRef.current = color;
    setColorState(color);
  };

  let channels = useMemo(() =>
    color.getColorSpaceAxes({xChannel, yChannel}),
    [color, xChannel, yChannel]
  );

  let xChannelRange = color.getChannelRange(channels.xChannel);
  let yChannelRange = color.getChannelRange(channels.yChannel);
  let {minValue: minValueX, maxValue: maxValueX, step: stepX, pageSize: pageSizeX} = xChannelRange;
  let {minValue: minValueY, maxValue: maxValueY, step: stepY, pageSize: pageSizeY} = yChannelRange;

  let [isDragging, setDragging] = useState(false);
  let isDraggingRef = useRef(false);

  let xValue = color.getChannelValue(channels.xChannel);
  let yValue = color.getChannelValue(channels.yChannel);
  let setXValue = (v: number) => {
    if (v === xValue) {
      return;
    }
    let newColor = color.withChannelValue(channels.xChannel, v);
    setColor(newColor);
  };
  let setYValue = (v: number) => {
    if (v === yValue) {
      return;
    }
    let newColor = color.withChannelValue(channels.yChannel, v);
    setColor(newColor);
  };

  return {
    channels,
    xChannelStep: stepX,
    yChannelStep: stepY,
    xChannelPageStep: pageSizeX,
    yChannelPageStep: pageSizeY,
    value: color,
    defaultValue: value !== undefined ? initialValue : defaultValue as Color,
    setValue(value) {
      setColor(normalizeColor(value));
    },
    xValue,
    setXValue,
    yValue,
    setYValue,
    setColorFromPoint(x: number, y: number) {
      let newXValue = minValueX + clamp(x, 0, 1) * (maxValueX - minValueX);
      let newYValue = minValueY + (1 - clamp(y, 0, 1)) * (maxValueY - minValueY);
      let newColor: Color | undefined;
      if (newXValue !== xValue) {
        // Round new value to multiple of step, clamp value between min and max
        newXValue = snapValueToStep(newXValue, minValueX, maxValueX, stepX);
        newColor = color.withChannelValue(channels.xChannel, newXValue);
      }
      if (newYValue !== yValue) {
        // Round new value to multiple of step, clamp value between min and max
        newYValue = snapValueToStep(newYValue, minValueY, maxValueY, stepY);
        newColor = (newColor || color).withChannelValue(channels.yChannel, newYValue);
      }
      if (newColor) {
        setColor(newColor);
      }
    },
    getThumbPosition() {
      let x = (xValue - minValueX) / (maxValueX - minValueX);
      let y = 1 - (yValue - minValueY) / (maxValueY - minValueY);
      return {x, y};
    },
    incrementX(stepSize = 1) {
      setXValue(xValue + stepSize > maxValueX ? maxValueX : snapValueToStep(xValue + stepSize, minValueX, maxValueX, stepX));
    },
    incrementY(stepSize = 1) {
      setYValue(yValue + stepSize > maxValueY ? maxValueY : snapValueToStep(yValue + stepSize, minValueY, maxValueY, stepY));
    },
    decrementX(stepSize = 1) {
      setXValue(snapValueToStep(xValue - stepSize, minValueX, maxValueX, stepX));
    },
    decrementY(stepSize = 1) {
      setYValue(snapValueToStep(yValue - stepSize, minValueY, maxValueY, stepY));
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
      return color.withChannelValue('alpha', 1);
    }
  };
}
