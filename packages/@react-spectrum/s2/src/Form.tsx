/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {createContext, forwardRef, ReactNode, useContext, useMemo} from 'react';
import {DOMRef, SpectrumLabelableProps} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {Form as RACForm, FormProps as RACFormProps} from 'react-aria-components';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useIsSkeleton} from './Skeleton';

interface FormStyleProps extends Omit<SpectrumLabelableProps, 'label' | 'contextualHelp'> {
  /**
   * Size of the Form elements.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** Whether the Form elements are disabled. */
  isDisabled?: boolean,
  /** Whether the Form elements are rendered with their emphasized style. */
  isEmphasized?: boolean
}

export interface FormProps extends FormStyleProps, Omit<RACFormProps, 'className' | 'style' | 'children'>, StyleProps {
  children?: ReactNode
}

export const FormContext = createContext<FormStyleProps | null>(null);
export function useFormProps<T extends FormStyleProps>(props: T): T {
  let ctx = useContext(FormContext);
  let isSkeleton = useIsSkeleton();
  return useMemo(() => {
    let result: T = props;
    if (ctx || isSkeleton) {
      result = {...props};
    }

    if (ctx) {
      // This is a subset of mergeProps. We just need to merge non-undefined values.
      for (let key in ctx) {
        if (result[key] === undefined) {
          result[key] = ctx[key];
        }
      }
    }

    // Skeleton always wins over local props.
    if (isSkeleton) {
      result.isDisabled = true;
    }

    return result;
  }, [ctx, props, isSkeleton]);
}

/**
 * Forms allow users to enter data that can be submitted while providing alignment and styling for form fields.
 */
export const Form = /*#__PURE__*/ forwardRef(function Form(props: FormProps, ref: DOMRef<HTMLFormElement>) {
  let {
    labelPosition = 'top',
    labelAlign,
    necessityIndicator,
    isRequired,
    isDisabled,
    isEmphasized,
    size = 'M',
    ...formProps
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <RACForm
      {...formProps}
      ref={domRef}
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + style({
        display: 'grid',
        gridTemplateColumns: {
          labelPosition: {
            top: ['[field] 1fr'],
            side: ['[label] auto', '[field] 1fr']
          }
        },
        // TODO: confirm when we have tokens
        rowGap: {
          size: {
            XS: 16,
            S: 20,
            M: 24,
            L: 32,
            XL: 40
          }
        },
        columnGap: 'text-to-control'
      }, getAllowedOverrides())({labelPosition, size}, props.styles)}>
      <FormContext.Provider
        value={{
          labelPosition,
          labelAlign,
          necessityIndicator,
          isRequired,
          isDisabled,
          isEmphasized,
          size
        }}>
        {props.children}
      </FormContext.Provider>
    </RACForm>
  );
});
