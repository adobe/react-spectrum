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

import {AriaLabelingProps, DimensionValue, LabelableProps, StyleProps} from '@react-types/shared';
import {BaseSliderProps} from '@react-types/slider';
import {Color} from '@react-stately/color';
import {RefObject} from 'react';

/** A list of supported color formats. */
export type ColorFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsb' | 'hsba';

/** A list of color channels. */
export type ColorChannel = 'hue' | 'saturation' | 'brightness' | 'lightness' | 'red' | 'green' | 'blue' | 'alpha';

export interface ColorWheelProps extends BaseSliderProps, Omit<StyleProps, 'width' | 'height'> {
  step?: number,
  // overriding these to allow passing string:
  value?: string | Color,
  defaultValue?: string | Color,
  onChange?: (value: Color) => void
}

export interface ColorWheelAriaProps extends ColorWheelProps {
  inputRef: RefObject<HTMLElement>,
  containerRef: RefObject<HTMLElement>,
  innerRadius: number,
  outerRadius: number
}

export interface SpectrumColorWheelProps extends ColorWheelProps {
  size?: DimensionValue
}

interface ColorSliderProps extends Omit<BaseSliderProps, 'minValue' | 'maxValue'>, LabelableProps, AriaLabelingProps {
  channel: ColorChannel,
  value?: string | Color,
  defaultValue?: string | Color,
  onChange?: (value: Color) => void,
  /** Whether the value's label is displayed. True by default, false by default if not. */
  showValueLabel?: boolean
  // showTextField?: boolean, // do we want this? we didn't keep it for slider....
}
