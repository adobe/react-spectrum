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
  StyleProps,
  Validation
} from '@react-types/shared';
import {ReactNode} from 'react';

export interface CheckboxBase extends InputBase, Validation, FocusableProps {
  /**
   * The content to render as the element's label.
   */
  children?: ReactNode, // pass in children to render label
  /**
   * Whether the elements should be selected (uncontrolled).
   */
  defaultSelected?: boolean,
  /**
   * Whether the element should be selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void,
  /**
   * The value of the input element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox).
   */
  value?: string,
  /**
   * The name of the input element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox).
   */
  name?: string
}

export interface AriaCheckboxBase extends CheckboxBase, FocusableDOMProps, AriaLabelingProps, AriaValidationProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  'aria-controls'?: string
}

export interface CheckboxProps extends CheckboxBase {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean
}

export interface AriaCheckboxProps extends CheckboxProps, AriaCheckboxBase {}

export interface SpectrumCheckboxProps extends AriaCheckboxProps, StyleProps {
  /**
   * This prop sets the emphasized style which provides visual prominence.
   */
  isEmphasized?: boolean
}
