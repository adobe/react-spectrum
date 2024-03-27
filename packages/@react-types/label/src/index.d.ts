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

import {Alignment, DOMProps, LabelPosition, NecessityIndicator, SpectrumFieldValidation, SpectrumHelpTextProps, StyleProps, Validation, ValidationResult} from '@react-types/shared';
import {ElementType, HTMLAttributes, LabelHTMLAttributes, ReactElement, ReactNode} from 'react';

export interface LabelProps {
  children?: ReactNode,
  htmlFor?: string, // for compatibility with React
  for?: string,
  elementType?: ElementType
}

interface SpectrumLabelPropsBase extends LabelProps, DOMProps, StyleProps {
  labelPosition?: LabelPosition, // default top
  labelAlign?: Alignment, // default start
  isRequired?: boolean,
  necessityIndicator?: NecessityIndicator, // default icon
  includeNecessityIndicatorInAccessibilityName?: boolean
}

export interface SpectrumLabelProps extends SpectrumLabelPropsBase, HTMLAttributes<HTMLElement> {}

export interface SpectrumFieldProps extends SpectrumLabelPropsBase, SpectrumHelpTextProps, Omit<Validation<any>, 'validationState'>, SpectrumFieldValidation<any>, Partial<ValidationResult> {
  children: ReactElement,
  label?: ReactNode,
  contextualHelp?: ReactNode,
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>,
  descriptionProps?: HTMLAttributes<HTMLElement>,
  errorMessageProps?: HTMLAttributes<HTMLElement>,
  wrapperClassName?: string,
  wrapperProps?: HTMLAttributes<HTMLElement>
}
