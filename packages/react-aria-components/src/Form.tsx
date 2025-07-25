/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextValue, DOMProps, useContextProps} from './utils';
import {FormValidationContext} from 'react-stately';
import {GlobalDOMAttributes} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {FormProps as SharedFormProps} from '@react-types/form';

export interface FormProps extends SharedFormProps, DOMProps, GlobalDOMAttributes<HTMLFormElement> {
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when a field value is missing or invalid, or mark fields as required
   * or invalid via ARIA.
   * @default 'native'
   */
  validationBehavior?: 'aria' | 'native'
}

export const FormContext = createContext<ContextValue<FormProps, HTMLFormElement>>(null);

/**
 * A form is a group of inputs that allows users to submit data to a server,
 * with support for providing field validation errors.
 */
export const Form = forwardRef(function Form(props: FormProps, ref: ForwardedRef<HTMLFormElement>) {
  [props, ref] = useContextProps(props, ref, FormContext);
  let {validationErrors, validationBehavior = 'native', children, className, ...domProps} = props;
  return (
    <form noValidate={validationBehavior !== 'native'} {...domProps} ref={ref} className={className || 'react-aria-Form'}>
      <FormContext.Provider value={{...props, validationBehavior}}>
        <FormValidationContext.Provider value={validationErrors ?? {}}>
          {children}
        </FormValidationContext.Provider>
      </FormContext.Provider>
    </form>
  );
});
