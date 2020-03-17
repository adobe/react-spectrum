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

import {DOMProps, SpectrumLabelableProps, StyleProps, ValidationState} from '@react-types/shared';
import {ReactElement} from 'react';

export interface SpectrumFormProps extends DOMProps, StyleProps, SpectrumLabelableProps {
  /** The contents of the form. */
  children: ReactElement<SpectrumLabelableProps> | ReactElement<SpectrumLabelableProps>[],
  /** Whether the form elements are displayed with their quiet style. */
  isQuiet?: boolean,
  /** Whether the form elements are rendered with their emphasized style. */
  isEmphasized?: boolean,
  /** Whether the form elements are disabled. */
  isDisabled?: boolean,
  /** Whether user input is required on each of the form elements before form submission. */
  isRequired?: boolean,
  /** Whether the form elements can be selected but not changed by the user. */
  isReadOnly?: boolean,
  /** 
   * Whether the form elements should display their "valid" or "invalid" visual styling. 
   * @default "valid"
   */
  validationState?: ValidationState
}
