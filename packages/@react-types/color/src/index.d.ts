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
  FocusableDOMProps,
  FocusableProps,
  InputBase,
  LabelableProps,
  SpectrumLabelableProps,
  StyleProps,
  TextInputBase,
  TextInputDOMProps,
  Validation,
} from '@react-types/shared';

/** A list of supported color formats. */
export type ColorFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsb' | 'hsba';

/** A list of color channels. */
export type ColorChannel = 'hue' | 'saturation' | 'brightness' | 'lightness' | 'red' | 'green' | 'blue' | 'alpha';

export interface Color {
  /** Converts the color to a string in the given format */
  toString(format: ColorFormat): string,

  /** Converts the color to the given color format, and returns a new Color object */
  toFormat(format: ColorFormat): Color,

  /** 
   * Gets the numeric value for a given channel.
   * Throws an error if the channel is unsupported in the current color format.
   */
  getChannelValue(channel: ColorChannel): number,
}

export interface HexColorFieldProps extends InputBase, Validation, FocusableProps, TextInputBase, LabelableProps {
  value?: string | Color,
  defaultValue?: string | Color,
  onChange?: (color: Color) => void,
  minValue?: string | Color,
  maxValue?: string | Color,
  step?: number
}

export interface AriaHexColorFieldProps extends HexColorFieldProps, AriaLabelingProps, FocusableDOMProps, TextInputDOMProps, AriaValidationProps {}

export interface SpectrumHexColorFieldProps extends AriaHexColorFieldProps, SpectrumLabelableProps, StyleProps {
  isQuiet?: boolean
}
