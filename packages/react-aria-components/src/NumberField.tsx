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
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {NumberFieldState, useNumberFieldState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {TextContext} from './Text';

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage'>, RenderProps<NumberFieldState>, SlotProps {}

export const NumberFieldContext = createContext<ContextValue<NumberFieldProps, HTMLDivElement>>(null);

function NumberField(props: NumberFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, NumberFieldContext);
  let {locale} = useLocale();
  let state = useNumberFieldState({...props, locale});
  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
    descriptionProps,
    errorMessageProps
  } = useNumberField({...props, label}, state, inputRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-NumberField'
  });

  return (
    <Provider
      values={[
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
        }]
      ]}>
      <div {...renderProps} ref={ref} slot={props.slot} />
    </Provider>
  );
}

/**
 * A number field allows a user to enter a number, and increment or decrement the value using stepper buttons.
 */
const _NumberField = forwardRef(NumberField);
export {_NumberField as NumberField};
