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

import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {RenderProps, useRenderProps} from './utils';
import {Text} from './Text';
import {ValidationResult} from '@react-types/shared';

export const FieldErrorContext = createContext<ValidationResult | null>(null);

export interface FieldErrorRenderProps extends ValidationResult {}
export interface FieldErrorProps extends RenderProps<FieldErrorRenderProps> {}

function FieldError(props: FieldErrorProps, ref: ForwardedRef<HTMLElement>) {
  let validation = useContext(FieldErrorContext);
  if (!validation?.isInvalid) {
    return null;
  }

  return <FieldErrorInner {...props} ref={ref} />;
}

/**
 * A FieldError displays validation errors for a form field.
 */
const _FieldError = forwardRef(FieldError);
export {_FieldError as FieldError};

const FieldErrorInner = forwardRef((props: FieldErrorProps, ref: ForwardedRef<HTMLElement>) => {
  let validation = useContext(FieldErrorContext)!;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-FieldError',
    defaultChildren: validation.validationErrors.length === 0 ? undefined : validation.validationErrors.join(' '),
    values: validation
  });

  if (renderProps.children == null) {
    return null;
  }

  return <Text slot="errorMessage" {...renderProps} ref={ref} />;
});
