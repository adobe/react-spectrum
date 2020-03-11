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

import {DOMProps, LabelPosition, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

interface ProgressBaseProps {
  /**
   * The current value (controlled).
   * @default "0"
   */
  value?: number,
  /**
   * The smallest value allowed for the input.
   * @default "0"
   */
  minValue?: number,
  /**
   * The largest value allowed for the input.
   * @default "100"
   */
  maxValue?: number
}

export interface ProgressBarBaseProps extends ProgressBaseProps {
  /** The content to display as the label. */
  label?: ReactNode,
  /** Whether the value's label is displayed */
  showValueLabel?: boolean, // true by default if label, false by default if not
  /** The display format of the value label. */
  formatOptions?: Intl.NumberFormatOptions, // defaults to formatting as a percentage.
  /** The content to display as the value's label. */
  valueLabel?: ReactNode // custom value label (e.g. 1 of 4)
}

export interface ProgressBarProps extends ProgressBarBaseProps {
  /**
   * Whether presentation is indeterminate when progress isn't known.
   * @default "false"
   */
  isIndeterminate?: boolean
}

export interface ProgressCircleProps extends ProgressBaseProps {
  /**
   * Whether presentation is indeterminate when progress isn't known.
   * @default "false"
   */
  isIndeterminate?: boolean
}

export interface SpectrumProgressCircleProps extends ProgressCircleProps, DOMProps, StyleProps {
  /**
   * What the ProgressCircle's diameter should be.
   * @default "M"
   */
  size?: 'S' | 'M' | 'L',
  /** The [visual style](https://spectrum.adobe.com/page/circle-loader/#Over-background-variant) of the ProgressCircle. */
  variant?: 'overBackground',
  isCentered?: boolean
}

export interface SpectrumProgressBarBaseProps extends ProgressBarBaseProps, DOMProps, StyleProps {
  /**
   * How thick the ProgressBar should be.
   * @default "L"
   */
  size?: 'S' | 'L',
  /**
   * The label's overall position relative to the element it is labeling.
   * @default "top"
   */
  labelPosition?: LabelPosition
}

export interface SpectrumProgressBarProps extends SpectrumProgressBarBaseProps, ProgressBarProps {
  /** The [visual style](https://spectrum.adobe.com/page/bar-loader/#Over-background) of the ProgressBar. */
  variant?: 'overBackground'
}
