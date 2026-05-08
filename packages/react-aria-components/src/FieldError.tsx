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

import {ClassNameOrFunction, RenderProps, useRenderProps} from './utils';
import {DOMProps, GlobalDOMAttributes, ValidationResult} from '@react-types/shared';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {Text} from './Text';

export const FieldErrorContext = createContext<ValidationResult | null>(null);

export interface FieldErrorRenderProps extends ValidationResult {}
export interface FieldErrorProps
  extends RenderProps<FieldErrorRenderProps>, DOMProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-FieldError'
   */
  className?: ClassNameOrFunction<FieldErrorRenderProps>;
  /**
   * The HTML element type to render. Defaults to `'span'`.
   * Set to `'div'` when using block-level children (e.g. `<ul>`) to avoid invalid HTML.
   * @default 'span'
   */
  elementType?: string;
}

/**
 * A FieldError displays validation errors for a form field.
 */
export const FieldError = forwardRef(function FieldError(
  props: FieldErrorProps,
  ref: ForwardedRef<HTMLElement>
) {
  let validation = useContext(FieldErrorContext);
  if (!validation?.isInvalid) {
    return null;
  }

  return <FieldErrorInner {...props} ref={ref} />;
});

const FieldErrorInner = forwardRef((props: FieldErrorProps, ref: ForwardedRef<HTMLElement>) => {
  let validation = useContext(FieldErrorContext)!;
  let {elementType, ...restProps} = props;
  let domProps = filterDOMProps(restProps, {global: true})!;
  let renderProps = useRenderProps({
    ...restProps,
    defaultClassName: 'react-aria-FieldError',
    defaultChildren:
      validation.validationErrors.length === 0 ? undefined : validation.validationErrors.join(' '),
    values: validation
  });

  if (renderProps.children == null) {
    return null;
  }

  return (
    <Text slot="errorMessage" elementType={elementType} {...domProps} {...renderProps} ref={ref} />
  );
});
