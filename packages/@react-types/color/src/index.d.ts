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

import {
  AriaLabelingProps,
  AriaValidationProps,
  DimensionValue,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  InputBase,
  LabelableProps,
  SpectrumLabelableProps,
  StyleProps,
  TextInputBase,
  TextInputDOMProps,
  Validation,
  ValueBase
} from '@react-types/shared';
import {SliderProps} from '@react-types/slider';

/** A list of supported color formats. */
export type ColorFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsb' | 'hsba';

/** A list of color channels. */
export type ColorChannel = 'hue' | 'saturation' | 'brightness' | 'lightness' | 'red' | 'green' | 'blue' | 'alpha';

export interface Color {
  toFormat(format: ColorFormat): Color,
  toString(format: ColorFormat | 'css'): string,
  toHexInt(): number,
  getChannelValue(channel: ColorChannel): number,
  withChannelValue(channel: ColorChannel, value: number): Color
}

export type ColorInput = string | Color;

export interface HexColorFieldProps extends InputBase, Validation, FocusableProps, TextInputBase, LabelableProps {
  value?: ColorInput,
  defaultValue?: ColorInput,
  onChange?: (color: Color) => void,
  step?: number
}

export interface AriaHexColorFieldProps extends HexColorFieldProps, AriaLabelingProps, FocusableDOMProps, TextInputDOMProps, AriaValidationProps {}

export interface SpectrumHexColorFieldProps extends AriaHexColorFieldProps, SpectrumLabelableProps, StyleProps {
  isQuiet?: boolean
}

export interface ColorWheelProps extends ValueBase<string | Color> {
  /** Whether the ColorWheel is disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the value changes, as the user drags. */
  onChange?: (value: Color) => void,
  /** Handler that is called when the user stops dragging. */
  onChangeEnd?: (value: Color) => void,
  /**
   * The ColorWheel's step value.
   * @default 1
   */
  step?: number
}

export interface AriaColorWheelProps extends ColorWheelProps, DOMProps, AriaLabelingProps {}

export interface SpectrumColorWheelProps extends AriaColorWheelProps, Omit<StyleProps, 'width' | 'height'> {
  size?: DimensionValue
}

interface ColorSliderProps extends Omit<SliderProps<string | Color>, 'minValue' | 'maxValue'> {
  channel: ColorChannel,
  // overriding these to only include color
  onChange?: (value: Color) => void,
  onChangeEnd?: (value: Color) => void,
  /** Whether the value's label is displayed. True by default, false by default if not. */
  showValueLabel?: boolean
  // showTextField?: boolean, // do we want this? we didn't keep it for slider....
}

export interface SpectrumColorSliderProps extends ColorSliderProps, DOMProps, StyleProps, AriaLabelingProps {}
