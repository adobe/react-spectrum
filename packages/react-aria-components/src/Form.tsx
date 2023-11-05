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

import {DOMProps} from './utils';
import {FormValidationContext} from '@react-stately/form';
import React, {ForwardedRef, forwardRef} from 'react';
import {FormProps as SharedFormProps} from '@react-types/form';

export interface FormProps extends SharedFormProps, DOMProps {}

function Form(props: FormProps, ref: ForwardedRef<HTMLFormElement>) {
  let {validationErrors, children, className, ...domProps} = props;
  return (
    <form {...domProps} ref={ref} className={className || 'react-aria-Form'}>
      <FormValidationContext.Provider value={validationErrors ?? {}}>
        {children}
      </FormValidationContext.Provider>
    </form>
  );
}

/**
 * A form is a group of inputs that allows users to submit data to a server,
 * with support for providing field validation errors.
 */
const _Form = forwardRef(Form);
export {_Form as Form};
