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

import {
  ContextValue,
  dom,
  DOMProps,
  DOMRenderProps,
  useContextProps,
  useSlottedContext
} from './utils';
import {FormValidationContext} from 'react-stately/private/form/useFormValidationState';
import {GlobalDOMAttributes, FormProps as SharedFormProps} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface FormProps
  extends
    SharedFormProps,
    DOMProps,
    DOMRenderProps<'form', undefined>,
    GlobalDOMAttributes<HTMLFormElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element.
   *
   * @default 'react-aria-Form'
   */
  className?: string;
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when a field value is missing or invalid, or mark fields as required
   * or invalid via ARIA.
   *
   * @default 'native'
   */
  validationBehavior?: 'aria' | 'native';
}

export const FormContext = createContext<ContextValue<FormProps, HTMLFormElement>>(null);

const IS_FORM = Symbol('isForm');

/**
 * A form is a group of inputs that allows users to submit data to a server,
 * with support for providing field validation errors.
 */
export const Form = forwardRef(function Form(props: FormProps, ref: ForwardedRef<HTMLFormElement>) {
  // A nested Form is independent, so don't inherit the props of a parent Form.
  // FormContext values provided by other means are still merged.
  let ctx = useSlottedContext(FormContext);
  let isNested = ctx != null && IS_FORM in ctx;
  [props, ref] = useContextProps(isNested ? {...props, slot: null} : props, ref, FormContext);
  let {validationErrors, validationBehavior = 'native', children, className, ...domProps} = props;
  return (
    <dom.form
      noValidate={validationBehavior !== 'native'}
      {...domProps}
      ref={ref}
      className={className || 'react-aria-Form'}>
      <FormContext.Provider value={{...props, validationBehavior, [IS_FORM]: true} as FormProps}>
        <FormValidationContext.Provider value={validationErrors ?? {}}>
          {children}
        </FormValidationContext.Provider>
      </FormContext.Provider>
    </dom.form>
  );
});
