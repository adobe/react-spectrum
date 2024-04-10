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

import {AriaColorFieldProps, useColorField} from '@react-aria/color';
import {ColorFieldState, useColorFieldState} from '@react-stately/color';
import {ContextValue, Provider, RACValidation, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from '@react-aria/utils';
import {InputContext} from './Input';
import {InputDOMProps} from '@react-types/shared';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {TextContext} from './Text';

export interface ColorFieldRenderProps {
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
  state: ColorFieldState
}

export interface ColorFieldProps extends Omit<AriaColorFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>, RACValidation, InputDOMProps, RenderProps<ColorFieldRenderProps>, SlotProps {}

export const ColorFieldContext = createContext<ContextValue<ColorFieldProps, HTMLDivElement>>(null);
export const ColorFieldStateContext = createContext<ColorFieldState | null>(null);

function ColorField(props: ColorFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ColorFieldContext);
  let state = useColorFieldState({
    ...props,
    validationBehavior: props.validationBehavior ?? 'native'
  });

  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useColorField({
    ...removeDataAttributes(props),
    label,
    validationBehavior: props.validationBehavior ?? 'native'
  }, state, inputRef);

  let renderProps = useRenderProps({
    ...props,
    values: {
      state,
      isDisabled: props.isDisabled || false,
      isInvalid: validation.isInvalid || false
    },
    defaultClassName: 'react-aria-ColorField'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [ColorFieldStateContext, state],
        [InputContext, {...inputProps, ref: inputRef}],
        [LabelContext, {...labelProps, ref: labelRef}],
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
    </Provider>
  );
}

/**
 * A color field allows users to enter and adjust a hex color value.
 */
const _ColorField = forwardRef(ColorField);
export {_ColorField as ColorField};
