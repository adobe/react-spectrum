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

import {AriaLabelingProps, DOMProps, SpectrumLabelableProps, StyleProps, ValidationErrors, ValidationState} from '@react-types/shared';
import {FormEvent, FormHTMLAttributes, ReactElement} from 'react';

export interface FormProps extends AriaLabelingProps {
  /**
   * Validation errors for the form, typically returned by a server.
   * This should be set to an object mapping from input names to errors.
   */
  validationErrors?: ValidationErrors,
  /**
   * Where to send the form-data when the form is submitted.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#action).
   */
  action?: string | FormHTMLAttributes<HTMLFormElement>['action'],
  /**
   * The enctype attribute specifies how the form-data should be encoded when submitting it to the server.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#enctype).
   */
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain',
  /**
   * The HTTP method to submit the form with.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#method).
   */
  method?: 'get' | 'post' | 'dialog',
  /**
   * The target attribute specifies a name or a keyword that indicates where to display the response that is received after submitting the form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#target).
   */
  target?: '_blank' | '_self' | '_parent' | '_top',
  /**
   * Triggered when a user submits the form.
   */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void,
  /**
   * Triggered when a user resets the form.
   */
  onReset?:  (event: FormEvent<HTMLFormElement>) => void,
  /**
   * Triggered for each invalid field when a user submits the form.
   */
  onInvalid?:  (event: FormEvent<HTMLFormElement>) => void,
  /**
   * Indicates whether input elements can by default have their values automatically completed by the browser.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#autocomplete).
   */
  autoComplete?: 'off' | 'on',
  /**
   * Controls whether inputted text is automatically capitalized and, if so, in what manner. 
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   */
  autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters',
  /**
   * An ARIA role override to apply to the form element.
   */
  role?: 'search' | 'presentation'
}

export interface SpectrumFormProps extends FormProps, DOMProps, StyleProps, Omit<SpectrumLabelableProps, 'contextualHelp' | 'label'> {
  /** The contents of the Form. */
  children: ReactElement<SpectrumLabelableProps> | ReactElement<SpectrumLabelableProps>[],
  /** Whether the Form elements are displayed with their quiet style. */
  isQuiet?: boolean,
  /** Whether the Form elements are rendered with their emphasized style. */
  isEmphasized?: boolean,
  /** Whether the Form elements are disabled. */
  isDisabled?: boolean,
  /** Whether user input is required on each of the Form elements before Form submission. */
  isRequired?: boolean,
  /** Whether the Form elements can be selected but not changed by the user. */
  isReadOnly?: boolean,
  /**
   * Whether the Form elements should display their "valid" or "invalid" visual styling.
   * @default 'valid'
   */
  validationState?: ValidationState,
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when a field value is missing or invalid, or mark fields as required
   * or invalid via ARIA.
   * @default 'aria'
   */
  validationBehavior?: 'aria' | 'native'
}
