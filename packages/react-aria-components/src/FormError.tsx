/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FormValidationResult} from '@react-aria/utils';
import {forwardRefType, RenderProps, useRenderProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {Text} from './Text';

export interface FormErrorProps extends RenderProps<FormValidationResult> {}

export const FormErrorContext = createContext<FormValidationResult | null>(null);

function FormError(props: FormErrorProps, ref: ForwardedRef<HTMLElement>) {
  let validation = useContext(FormErrorContext)!;
  let renderProps = useRenderProps({
    ...props,
    defaultChildren: validation.errorMessage,
    defaultClassName: 'react-aria-FormError',
    values: validation
  });

  if (!renderProps.children) {
    return null;
  }

  return (
    <Text {...renderProps} ref={ref} slot="errorMessage" />
  );
}

/**
 * Displays a validation error message for an input within a form.
 */
const _FormError = /*#__PURE__*/ (forwardRef as forwardRefType)(FormError);
export {_FormError as FormError};
