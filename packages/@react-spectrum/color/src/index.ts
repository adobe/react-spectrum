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

/// <reference types="css-module-types" />
export {ColorArea} from '@adobe/react-spectrum/ColorArea';

export {ColorWheel} from '@adobe/react-spectrum/ColorWheel';
export {ColorSlider} from '@adobe/react-spectrum/ColorSlider';
export {ColorField} from '@adobe/react-spectrum/ColorField';
export {ColorSwatch} from '@adobe/react-spectrum/ColorSwatch';
export {ColorPicker, ColorEditor} from '@adobe/react-spectrum/ColorPicker';
export {ColorSwatchPicker} from '@adobe/react-spectrum/ColorSwatchPicker';
export type {SpectrumColorAreaProps} from '@adobe/react-spectrum/ColorArea';
export type {SpectrumColorFieldProps} from '@adobe/react-spectrum/ColorField';
export type {SpectrumColorSliderProps} from '@adobe/react-spectrum/ColorSlider';
export type {SpectrumColorWheelProps} from '@adobe/react-spectrum/ColorWheel';
export type {SpectrumColorSwatchProps} from '@adobe/react-spectrum/ColorSwatch';
export type {
  SpectrumColorPickerProps,
  SpectrumColorEditorProps
} from '@adobe/react-spectrum/ColorPicker';
export type {SpectrumColorSwatchPickerProps} from '@adobe/react-spectrum/ColorSwatchPicker';
export {parseColor, getColorChannels} from 'react-stately/Color';
export type {Color, ColorSpace, ColorFormat} from 'react-stately/Color';
