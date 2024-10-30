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

import {AriaNumberFieldProps, useLocale, useNumberField} from 'react-aria';
import {ButtonContext} from './Button';
import {ContextValue, forwardRefType, Provider, RACValidation, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot, useSlottedContext} from './utils';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from '@react-aria/utils';
import {FormContext} from './Form';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {InputDOMProps} from '@react-types/shared';
import {LabelContext} from './Label';
import {NumberFieldState, useNumberFieldState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {TextContext} from './Text';

export interface NumberFieldRenderProps {
  /**
   * Whether the number field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the number field is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * State of the number field.
   */
  state: NumberFieldState
}

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>, RACValidation, InputDOMProps, RenderProps<NumberFieldRenderProps>, SlotProps {}

export const NumberFieldContext = createContext<ContextValue<NumberFieldProps, HTMLDivElement>>(null);
export const NumberFieldStateContext = createContext<NumberFieldState | null>(null);

function NumberField(props: NumberFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, NumberFieldContext);
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let {locale} = useLocale();
  let state = useNumberFieldState({
    ...props,
    locale,
    validationBehavior
  });

  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useNumberField({
    ...removeDataAttributes(props),
    label,
    validationBehavior
  }, state, inputRef);

  let renderProps = useRenderProps({
    ...props,
    values: {
      state,
      isDisabled: props.isDisabled || false,
      isInvalid: validation.isInvalid || false
    },
    defaultClassName: 'react-aria-NumberField'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [NumberFieldStateContext, state],
        [GroupContext, groupProps],
        [InputContext, {...inputProps, ref: inputRef}],
        [LabelContext, {...labelProps, ref: labelRef}],
        [ButtonContext, {
          slots: {
            increment: incrementButtonProps,
            decrement: decrementButtonProps
          }
        }],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }],
        [FieldErrorContext, validation]
      ]}>
      <div
        {...DOMProps}
        {...renderProps}
        ref={ref}
        slot={props.slot || undefined}
        data-disabled={props.isDisabled || undefined}
        data-invalid={validation.isInvalid || undefined} />
      {props.name && <input type="hidden" name={props.name} value={isNaN(state.numberValue) ? '' : state.numberValue} />}
    </Provider>
  );
}

/**
 * A number field allows a user to enter a number, and increment or decrement the value using stepper buttons.
 */
const _NumberField = /*#__PURE__*/ (forwardRef as forwardRefType)(NumberField);
export {_NumberField as NumberField};
