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

import {DOMProps, InputBase, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface CheckboxBase extends InputBase {
  /**
   * The content to render as the Checkbox's label.
   */
  children?: ReactNode,
  /**
   * Whether the Checkbox should be selected (uncontrolled).
   */
  defaultSelected?: boolean,
  /**
   * Whether the Checkbox should be selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler that is called when the Checkbox's selection state changes.
   */
  onChange?: (isSelected: boolean) => void,
  /**
   * The value of the Checkbox input element.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox
   */
  value?: string,
  /**
   * The name of the Checkbox input element.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox
   */
  name?: string
}

export interface CheckboxProps extends CheckboxBase {
  /**
   * Indeterminism is presentational, when a checkbox is indeterminate, it overrides the selection state.
   * The indeterminate visual representation remains even after subsequent clicks.
   */
  isIndeterminate?: boolean
}

export interface SpectrumCheckboxProps extends CheckboxProps, DOMProps, StyleProps {
  /**
   * This prop sets the emphasized style which provides visual prominence.
   */
  isEmphasized?: boolean
}
