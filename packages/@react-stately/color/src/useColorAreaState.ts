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

import {clamp} from '../../utils';
import {Color, ColorAreaProps, ColorChannel} from '@react-types/color';
import {parseColor} from './Color';
import {useControlledState} from '@react-stately/utils';
import {useRef, useState} from 'react';

export interface ColorAreaState {
  /** The current color value displayed by the color area. */
  readonly value: Color,
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

  /** Sets the x and y channels of the current color value based on the given coordinates and pixel dimensions of the color area, and triggers `onChange`. */
  setColorFromPoint(x: number, y: number, dimensions: {width: number, height: number}): void,
  /** Returns the coordinates of the thumb relative to the upper left corner of the color area. */
  getThumbPosition(dimensions: {width: number, height: number}): {x: number, y: number},

  /** Increments the value of the horizontal axis channel by the given amount (defaults to 1). */
  incrementX(minStepSize?: number): void,
  /** Decrements the value of the horizontal axis channel by the given amount (defaults to 1). */
  decrementX(minStepSize?: number): void,

  /** Increments the value of the vertical axis channel by the given amount (defaults to 1). */
  incrementY(minStepSize?: number): void,
  /** Decrements the value of the vertical axis channel by the given amount (defaults to 1). */
  decrementY(minStepSize?: number): void,

  /** Whether the color area is currently being dragged. */
  readonly isDragging: boolean,
  /** Sets whether the color area is being dragged. */
  setDragging(value: boolean): void,

  /** Returns the xChannel, yChannel and zChannel names based on the color value. */
  getChannels(): {xChannel: ColorChannel, yChannel: ColorChannel, zChannel: ColorChannel}
}

function normalizeColor(v: string | Color) {
  if (typeof v === 'string') {
    return parseColor(v);
  } else {
    return v;
  }
}

const DEFAULT_COLOR = parseColor('hsb(0, 100%, 100%)');

/**
 * Provides state management for a color area component.
 * Color area allows users to adjust two channels of an HSL, HSB or RGB color value against a two-dimensional gradient background.
 */
export function useColorAreaState(props: ColorAreaProps): ColorAreaState {
  let {value, defaultValue, xChannel, yChannel, onChange, onChangeEnd, step = 1} = props;

  if (!value && !defaultValue) {
    defaultValue = DEFAULT_COLOR;
  }

  let [color, setColor] = useControlledState(value && normalizeColor(value), defaultValue && normalizeColor(defaultValue), onChange);
  let valueRef = useRef(color);
  valueRef.current = color;

  let getChannels = () => {
    // determine the color space from the color value
    let colorSpace = valueRef.current.getColorSpace();
    let zChannel: ColorChannel;
    let xyChannels: Array<ColorChannel>;

    if (colorSpace === 'rgb') {
      if (!xChannel) {
        switch (yChannel) {
          case 'red':
            xChannel = 'blue';
          case 'green':
            xChannel = 'blue';
            break;
          case 'blue':
            xChannel = 'red';
            break;
          default:
            xChannel = 'blue';
            yChannel = 'green';
        }
      } else if (!yChannel) {
        switch (xChannel) {
          case 'blue':
            yChannel = 'red';
            break;
          case 'red':
            yChannel = 'green';
            break;
          default: 
            xChannel = 'blue';
            yChannel = 'green';
        }
      }
      xyChannels = [xChannel, yChannel];
      if (xyChannels.includes('red')) {
        zChannel = xyChannels.includes('green') ? 'blue' : 'green';
      } else if (xyChannels.includes('green')) {
        zChannel = xyChannels.includes('blue') ? 'red' : 'blue';
      } else if (xyChannels.includes('blue')) {
        zChannel = xyChannels.includes('green') ? 'red' : 'green';
      }
    } else if (colorSpace === 'hsb') {
      if (!xChannel) {
        switch (yChannel) {
          case 'hue':
            xChannel = 'brightness';
            break;
          case 'brightness':
            xChannel = 'saturation';
          default:
            xChannel = 'saturation';
            yChannel = 'brightness';
            break;
        }
      } else if (!yChannel) {
        switch (xChannel) {
          case 'hue':
            yChannel = 'brightness';
            break;
          case 'brightness':
            yChannel = 'saturation';
          default:
            xChannel = 'saturation';
            yChannel = 'brightness';
            break;
        }
      }
      xyChannels = [xChannel, yChannel];
      if (xyChannels.includes('hue')) {
        zChannel = xyChannels.includes('saturation') ? 'brightness' : 'saturation';
      } else if (xyChannels.includes('saturation')) {
        zChannel = xyChannels.includes('hue') ? 'brightness' : 'hue';
      } else if (xyChannels.includes('brightness')) {
        zChannel = xyChannels.includes('hue') ? 'saturation' : 'hue';
      }
    } else if (colorSpace === 'hsl') {
      if (!xChannel) {
        switch (yChannel) {
          case 'hue':
            xChannel = 'lightness';
            break;
          case 'lightness':
            xChannel = 'saturation';
          default:
            xChannel = 'saturation';
            yChannel = 'lightness';
            break;
        }
      } else if (!yChannel) {
        switch (xChannel) {
          case 'hue':
            yChannel = 'lightness';
            break;
          case 'lightness':
            yChannel = 'saturation';
          default:
            xChannel = 'saturation';
            yChannel = 'lightness';
            break;
        }
      }
      xyChannels = [xChannel, yChannel];
      if (xyChannels.includes('hue')) {
        zChannel = xyChannels.includes('saturation') ? 'lightness' : 'saturation';
      } else if (xyChannels.includes('saturation')) {
        zChannel = xyChannels.includes('hue') ? 'lightness' : 'hue';
      } else if (xyChannels.includes('lightness')) {
        zChannel = xyChannels.includes('hue') ? 'saturation' : 'hue';
      }
    }

    return {xChannel, yChannel, zChannel};
  };

  let channels = getChannels();
  if (!xChannel || !yChannel) {
    xChannel = channels.xChannel;
    yChannel = channels.yChannel;
  }

  let [isDragging, setDragging] = useState(false);

  let xValue = color.getChannelValue(xChannel);
  let yValue = color.getChannelValue(yChannel);
  let setXValue = (v) => setColor(color.withChannelValue(xChannel, v));
  let setYValue = (v) => setColor(color.withChannelValue(yChannel, v));
  return {
    value: color,
    setValue(value) {
      let c = normalizeColor(value);
      valueRef.current = c;
      setColor(c);
    },
    xValue,
    setXValue,
    yValue,
    setYValue,
    setColorFromPoint(x, y, dimensions) {
      let xRange = color.getChannelRange(xChannel);
      let yRange = color.getChannelRange(yChannel);
      let newColor = color.clone();
      newColor = newColor.withChannelValue(xChannel, Math.round(xRange.minValue + (clamp(x, 0, dimensions.width) / dimensions.width) * (xRange.maxValue - xRange.minValue)));
      newColor = newColor.withChannelValue(yChannel, Math.round(yRange.minValue + ((dimensions.height - clamp(y, 0, dimensions.height)) / dimensions.height) * (yRange.maxValue - yRange.minValue)));
      setColor(newColor);
    },
    getThumbPosition(dimensions) {
      let xRange = color.getChannelRange(xChannel);
      let yRange = color.getChannelRange(yChannel);
      let x = dimensions.width * ((xValue - xRange.minValue) / (xRange.maxValue - xRange.minValue));
      let y = dimensions.height - (dimensions.height * ((yValue - yRange.minValue) / (yRange.maxValue - yRange.minValue)));
      return {x, y};
    },
    incrementX(minStepSize: number = 0) {
      let s = Math.max(minStepSize, step);
      let range = color.getChannelRange(xChannel);
      if (xValue < range.maxValue) {
        setXValue(Math.min(xValue + s, range.maxValue));
      }
    },
    incrementY(minStepSize: number = 0) {
      let s = Math.max(minStepSize, step);
      let range = color.getChannelRange(yChannel);
      if (yValue < range.maxValue) {
        setYValue(Math.min(yValue + s, range.maxValue));
      }
    },
    decrementX(minStepSize: number = 0) {
      let s = Math.max(minStepSize, step);
      let range = color.getChannelRange(xChannel);
      if (xValue > range.minValue) {
        setXValue(Math.max(xValue - s, range.minValue));
      }
    },
    decrementY(minStepSize: number = 0) {
      let s = Math.max(minStepSize, step);
      let range = color.getChannelRange(yChannel);
      if (yValue > range.minValue) {
        setYValue(Math.max(yValue - s, range.minValue));
      }
    },
    setDragging(isDragging) {
      setDragging(wasDragging => {
        if (onChangeEnd && !isDragging && wasDragging) {
          onChangeEnd(valueRef.current);
        }

        return isDragging;
      });
    },
    isDragging,
    getChannels
  };
}
