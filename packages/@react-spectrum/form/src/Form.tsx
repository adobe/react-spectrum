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

import {Alignment, DOMProps, DOMRef, FormProps, LabelPosition, SpectrumLabelableProps, StyleProps, ValidationState} from '@react-types/shared';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {filterDOMProps} from '@react-aria/utils';
import {FormValidationContext} from '@react-stately/form';
import {Provider, useProviderProps} from '@react-spectrum/provider';
import React, {ReactElement, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';

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

interface FormContextValue extends SpectrumLabelableProps {
  validationBehavior?: 'aria' | 'native'
}

let FormContext = React.createContext<FormContextValue | null>(null);
export function useFormProps<T extends SpectrumLabelableProps>(props: T): T {
  let ctx = useContext(FormContext);
  if (ctx) {
    return {...ctx, ...props};
  }

  return props;
}

const formPropNames = new Set([
  'action',
  'autoComplete',
  'encType',
  'method',
  'target',
  'onSubmit',
  'onReset',
  'onInvalid'
]);

/**
 * Forms allow users to enter data that can be submitted while providing alignment and styling for form fields.
 */
export const Form = React.forwardRef(function Form(props: SpectrumFormProps, ref: DOMRef<HTMLFormElement>) {
  props = useProviderProps(props);
  let {
    children,
    labelPosition = 'top' as LabelPosition,
    labelAlign = 'start' as Alignment,
    isRequired,
    necessityIndicator,
    isQuiet,
    isEmphasized,
    isDisabled,
    isReadOnly,
    validationState,
    validationBehavior,
    validationErrors,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  let ctx = {
    labelPosition,
    labelAlign,
    necessityIndicator,
    validationBehavior
  };

  return (
    <form
      {...filterDOMProps(otherProps, {labelable: true, propNames: formPropNames})}
      {...styleProps}
      noValidate={validationBehavior !== 'native'}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-Form',
          {
            'spectrum-Form--positionSide': labelPosition === 'side',
            'spectrum-Form--positionTop': labelPosition === 'top'
          },
          styleProps.className
        )
      }>
      <FormContext.Provider value={ctx}>
        <Provider
          isQuiet={isQuiet}
          isEmphasized={isEmphasized}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          isRequired={isRequired}
          validationState={validationState}>
          <FormValidationContext.Provider value={validationErrors || {}}>
            {children}
          </FormValidationContext.Provider>
        </Provider>
      </FormContext.Provider>
    </form>
  );
});
