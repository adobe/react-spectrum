/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaTextFieldProps, useTextField} from 'react-aria';
import {ContextValue, DOMProps, forwardRefType, Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, useCallback, useRef, useState} from 'react';
import {TextAreaContext} from './TextArea';
import {TextContext} from './Text';
import {ValidationState} from '@react-types/shared';

export interface TextFieldRenderProps {
  /**
   * Whether the text field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Validation state of the text field.
   * @selector [data-validation-state]
   */
  validationState?: ValidationState
}

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage'>, Omit<DOMProps, 'style' | 'className' | 'children'>, SlotProps, RenderProps<TextFieldRenderProps> {}

export const TextFieldContext = createContext<ContextValue<TextFieldProps, HTMLDivElement>>(null);

function TextField(props: TextFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TextFieldContext);
  let inputRef = useRef(null);
  let [labelRef, label] = useSlot();
  let [inputElementType, setInputElementType] = useState('input');
  let {labelProps, inputProps, descriptionProps, errorMessageProps} = useTextField<any>({
    ...props,
    inputElementType,
    label
  }, inputRef);

  // Intercept setting the input ref so we can determine what kind of element we have.
  // useTextField uses this to determine what props to include.
  let inputOrTextAreaRef = useCallback((el) => {
    inputRef.current = el;
    if (el) {
      setInputElementType(el instanceof HTMLTextAreaElement ? 'textarea' : 'input');
    }
  }, []);

  let renderProps = useRenderProps({
    ...props,
    values: {
      isDisabled: props.isDisabled || false,
      validationState: props.validationState
    },
    defaultClassName: 'react-aria-TextField'
  });

  return (
    <div
      {...filterDOMProps(props)}
      {...renderProps}
      ref={ref}
      slot={props.slot}
      data-disabled={props.isDisabled || undefined}
      data-validation-state={props.validationState || undefined}>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}],
          [InputContext, {...inputProps, ref: inputOrTextAreaRef}],
          [TextAreaContext, {...inputProps, ref: inputOrTextAreaRef}],
          [TextContext, {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A text field allows a user to enter a plain text value with a keyboard.
 */
const _TextField = (forwardRef as forwardRefType)(TextField);
export {_TextField as TextField};
