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
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  SpectrumFieldValidation,
  SpectrumLabelableProps,
  SpectrumTextInputBase,
  StyleProps,
  TextInputBase,
  TextInputDOMProps,
  Validation,
  ValueBase
} from '@react-types/shared';
import {ReactNode} from 'react';
import {SliderProps} from '@react-types/slider';

/** A list of supported color formats. */
export type ColorFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsb' | 'hsba';

export type ColorSpace = 'rgb' | 'hsl' | 'hsb';

/** A list of color channels. */
export type ColorChannel = 'hue' | 'saturation' | 'brightness' | 'lightness' | 'red' | 'green' | 'blue' | 'alpha';

export type ColorAxes = {xChannel: ColorChannel, yChannel: ColorChannel, zChannel: ColorChannel};

export interface ColorChannelRange {
  /** The minimum value of the color channel. */
  minValue: number,
  /** The maximum value of the color channel. */
  maxValue: number,
  /** The step value of the color channel, used when incrementing and decrementing. */
  step: number,
  /** The page step value of the color channel, used when incrementing and decrementing. */
  pageSize: number
}

/** Represents a color value. */
export interface Color {
  /** Converts the color to the given color format, and returns a new Color object. */
  toFormat(format: ColorFormat): Color,
  /** Converts the color to a string in the given format. */
  toString(format?: ColorFormat | 'css'): string,
  /** Returns a duplicate of the color value. */
  clone(): Color,
  /** Converts the color to hex, and returns an integer representation. */
  toHexInt(): number,
  /**
   * Returns the numeric value for a given channel.
   * Throws an error if the channel is unsupported in the current color format.
   */
  getChannelValue(channel: ColorChannel): number,
  /**
   * Sets the numeric value for a given channel, and returns a new Color object.
   * Throws an error if the channel is unsupported in the current color format.
   */
  withChannelValue(channel: ColorChannel, value: number): Color,
  /**
   * Returns the minimum, maximum, and step values for a given channel.
   */
  getChannelRange(channel: ColorChannel): ColorChannelRange,
  /**
   * Returns a localized color channel name for a given channel and locale,
   * for use in visual or accessibility labels.
   */
  getChannelName(channel: ColorChannel, locale: string): string,
  /**
   * Returns the number formatting options for the given channel.
   */
  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions,
  /**
   * Formats the numeric value for a given channel for display according to the provided locale.
   */
  formatChannelValue(channel: ColorChannel, locale: string): string,
  /**
   * Returns the color space, 'rgb', 'hsb' or 'hsl', for the current color.
   */
  getColorSpace(): ColorSpace,
  /**
   * Returns the color space axes, xChannel, yChannel, zChannel.
   */
  getColorSpaceAxes(xyChannels: {xChannel?: ColorChannel, yChannel?: ColorChannel}): ColorAxes,
  /**
   * Returns an array of the color channels within the current color space space.
   */
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel],
  /**
   * Returns a localized name for the color, for use in visual or accessibility labels.
   */
  getColorName(locale: string): string,
  /**
   * Returns a localized name for the hue, for use in visual or accessibility labels.
   */
  getHueName(locale: string): string
}

export interface ColorFieldProps extends Omit<ValueBase<string | Color | null>, 'onChange'>, InputBase, Validation<Color | null>, FocusableProps, TextInputBase, LabelableProps, HelpTextProps {
  /** Handler that is called when the value changes. */
  onChange?: (color: Color | null) => void
}

export interface AriaColorFieldProps extends ColorFieldProps, AriaLabelingProps, FocusableDOMProps, Omit<TextInputDOMProps, 'minLength' | 'maxLength' | 'pattern' | 'type' | 'inputMode' | 'autoComplete' | 'autoCorrect' | 'spellCheck'>, AriaValidationProps {
  /** Enables or disables changing the value with scroll. */
  isWheelDisabled?: boolean
}

export interface SpectrumColorFieldProps extends SpectrumTextInputBase, Omit<AriaColorFieldProps, 'isInvalid' | 'validationState'>, SpectrumFieldValidation<Color | null>, SpectrumLabelableProps, StyleProps {
  /**
   * The color channel that this field edits. If not provided,
   * the color is edited as a hex value.
   */
  channel?: ColorChannel,
  /**
   * The color space that the color field operates in if a `channel` prop is provided.
   * If no `channel` is provided, the color field always displays the color as an RGB hex value.
   */
  colorSpace?: ColorSpace,
  /** Whether the ColorField should be displayed with a quiet style. */
  isQuiet?: boolean
}

export interface ColorWheelProps extends Omit<ValueBase<string | Color>, 'onChange'> {
  /** Whether the ColorWheel is disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the value changes, as the user drags. */
  onChange?: (value: Color) => void,
  /** Handler that is called when the user stops dragging. */
  onChangeEnd?: (value: Color) => void,
  /**
   * The default value (uncontrolled).
   * @default 'hsl(0, 100%, 50%)'
   */
  defaultValue?: string | Color
}

export interface AriaColorWheelProps extends ColorWheelProps, InputDOMProps, DOMProps, AriaLabelingProps {}

export interface SpectrumColorWheelProps extends AriaColorWheelProps, Omit<StyleProps, 'width' | 'height'> {
  /** The outer diameter of the ColorWheel. */
  size?: DimensionValue
}

export interface ColorSliderProps extends Omit<SliderProps<string | Color>, 'minValue' | 'maxValue' | 'step' | 'pageSize' | 'onChange' | 'onChangeEnd'> {
  /**
   * The color space that the slider operates in. The `channel` must be in this color space.
   * If not provided, this defaults to the color space of the `color` or `defaultColor` value.
   */
  colorSpace?: ColorSpace,
  /** The color channel that the slider manipulates. */
  channel: ColorChannel,
  /** Handler that is called when the value changes, as the user drags. */
  onChange?: (value: Color) => void,
  /** Handler that is called when the user stops dragging. */
  onChangeEnd?: (value: Color) => void
}

export interface AriaColorSliderProps extends ColorSliderProps, InputDOMProps, DOMProps, AriaLabelingProps {}

export interface SpectrumColorSliderProps extends AriaColorSliderProps, StyleProps {
  /** Whether the value label is displayed. True by default if there is a label, false by default if not. */
  showValueLabel?: boolean,
  /** A ContextualHelp element to place next to the label. */
  contextualHelp?: ReactNode
}

export interface ColorAreaProps extends Omit<ValueBase<string | Color>, 'onChange'> {
  /**
   * The color space that the color area operates in. The `xChannel` and `yChannel` must be in this color space.
   * If not provided, this defaults to the color space of the `color` or `defaultColor` value.
   */
  colorSpace?: ColorSpace,
  /** Color channel for the horizontal axis. */
  xChannel?: ColorChannel,
  /** Color channel for the vertical axis. */
  yChannel?: ColorChannel,
  /** Whether the ColorArea is disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the value changes, as the user drags. */
  onChange?: (value: Color) => void,
  /** Handler that is called when the user stops dragging. */
  onChangeEnd?: (value: Color) => void
}

export interface AriaColorAreaProps extends ColorAreaProps, DOMProps, AriaLabelingProps {
  /**
   * The name of the x channel input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  xName?: string,
  /**
   * The name of the y channel input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  yName?: string,
  /**
   * The `<form>` element to associate the ColorArea with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form).
   */
  form?: string
}

export interface SpectrumColorAreaProps extends AriaColorAreaProps, Omit<StyleProps, 'width' | 'height'> {
  /** Size of the Color Area. */
  size?: DimensionValue
}
