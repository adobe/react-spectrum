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
  DOMProps,
  FocusableProps,
  InputBase,
  LabelableProps,
  Orientation,
  SpectrumLabelableProps,
  StyleProps,
  ValueBase
} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface RadioGroupProps extends ValueBase<string>, InputBase, LabelableProps {
  children: ReactElement<RadioProps> | ReactElement<RadioProps>[],
  name?: string // HTML form name. Not displayed.
}

export interface RadioProps extends FocusableProps {
  value: string, // HTML form value. Not displayed.
  /**
   * The label for the Radio. Accepts any renderable node.
   */
  children?: ReactNode, // pass in children to render label
  /**
   * Whether the radio button is disabled or not.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean
}

export interface SpectrumRadioGroupProps extends RadioGroupProps, SpectrumLabelableProps, DOMProps, StyleProps {
  /**
   * The axis the Radio Button(s) should align with.
   * @default 'vertical'
   */
  orientation?: Orientation,
  /**
   * By default, radio buttons are not emphasized (gray).
   * The emphasized (blue) version provides visual prominence.
   */
  isEmphasized?: boolean
}

export interface SpectrumRadioProps extends RadioProps, DOMProps, StyleProps {}
