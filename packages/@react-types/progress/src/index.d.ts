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
  value?: number,
  minValue?: number,
  maxValue?: number
}

export interface ProgressBarBaseProps extends ProgressBaseProps {
  label?: ReactNode,
  showValueLabel?: boolean, // true by default if label, false by default if not
  formatOptions?: Intl.NumberFormatOptions, // defaults to formatting as a percentage.
  valueLabel?: ReactNode // custom value label (e.g. 1 of 4)
}

export interface ProgressBarProps extends ProgressBarBaseProps {
  isIndeterminate?: boolean
}

export interface ProgressCircleProps extends ProgressBaseProps {
  isIndeterminate?: boolean
}

export interface SpectrumProgressCircleProps extends ProgressCircleProps, DOMProps, StyleProps {
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean
}

export interface SpectrumProgressBarBaseProps extends ProgressBarBaseProps, DOMProps, StyleProps {
  size?: 'S' | 'L',
  labelPosition?: LabelPosition
}

export interface SpectrumProgressBarProps extends SpectrumProgressBarBaseProps, ProgressBarProps {
  variant?: 'overBackground'
}
