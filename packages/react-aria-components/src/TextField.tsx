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
import {ContextValue, DOMProps, forwardRefType, Provider, RACValidation, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot, useSlottedContext} from './utils';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from '@react-aria/utils';
import {FormContext} from './Form';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, useCallback, useRef, useState} from 'react';
import {TextAreaContext} from './TextArea';
import {TextContext} from './Text';

export interface TextFieldRenderProps {
  /**
   * Whether the text field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the value is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * Whether the text field is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean,
  /**
   * Whether the text field is required.
   * @selector [data-required]
   */
  isRequired: boolean
}

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>, RACValidation, Omit<DOMProps, 'style' | 'className' | 'children'>, SlotProps, RenderProps<TextFieldRenderProps> {
  /** Whether the value is invalid. */
  isInvalid?: boolean
}

export const TextFieldContext = createContext<ContextValue<TextFieldProps, HTMLDivElement>>(null);

function TextField(props: TextFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TextFieldContext);
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let inputRef = useRef(null);
  let [labelRef, label] = useSlot();
  let [inputElementType, setInputElementType] = useState('input');
  let {labelProps, inputProps, descriptionProps, errorMessageProps, ...validation} = useTextField<any>({
    ...removeDataAttributes(props),
    inputElementType,
    label,
    validationBehavior
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
      isInvalid: validation.isInvalid,
      isReadOnly: props.isReadOnly || false,
      isRequired: props.isRequired || false
    },
    defaultClassName: 'react-aria-TextField'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...DOMProps}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-disabled={props.isDisabled || undefined}
      data-invalid={validation.isInvalid || undefined}
      data-readonly={props.isReadOnly || undefined}
      data-required={props.isRequired || undefined}>
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
          }],
          [FieldErrorContext, validation]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A text field allows a user to enter a plain text value with a keyboard.
 */
const _TextField = /*#__PURE__*/ (forwardRef as forwardRefType)(TextField);
export {_TextField as TextField};
