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

import {AriaColorFieldProps, useColorChannelField, useColorField} from '@react-aria/color';
import {ColorChannel, ColorSpace} from '@react-types/color';
import {ColorFieldContext} from './RSPContexts';
import {ColorFieldState, useColorChannelFieldState, useColorFieldState} from '@react-stately/color';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from '@react-aria/utils';
import {InputContext} from './Input';
import {InputDOMProps, ValidationResult} from '@react-types/shared';
import {LabelContext} from './Label';
import {Provider, RACValidation, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, Ref, useRef} from 'react';
import {TextContext} from './Text';
import {useLocale} from 'react-aria';

export interface ColorFieldRenderProps {
  /**
   * Whether the color field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the color field is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * The color channel that this field edits, or "hex" if no `channel` prop is set.
   * @selector [data-channel="hex | hue | saturation | ..."]
   */
  channel: ColorChannel | 'hex',
  /**
   * State of the color field.
   */
  state: ColorFieldState
}

export interface ColorFieldProps extends Omit<AriaColorFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>, RACValidation, InputDOMProps, RenderProps<ColorFieldRenderProps>, SlotProps {
  /**
   * The color channel that this field edits. If not provided, 
   * the color is edited as a hex value.
   */
  channel?: ColorChannel,
  /**
   * The color space that the color field operates in if a `channel` prop is provided.
   * If no `channel` is provided, the color field always displays the color as an RGB hex value.
   */
  colorSpace?: ColorSpace
}

export const ColorFieldStateContext = createContext<ColorFieldState | null>(null);

function ColorField(props: ColorFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ColorFieldContext);
  if (props.channel) {
    return <ColorChannelField {...props} channel={props.channel} forwardedRef={ref} />;
  } else {
    return <HexColorField {...props} forwardedRef={ref} />;
  }
}

/**
 * A color field allows users to edit a hex color or individual color channel value.
 */
const _ColorField = forwardRef(ColorField);
export {_ColorField as ColorField};

interface ColorChannelFieldProps extends Omit<ColorFieldProps, 'channel'> {
  channel: ColorChannel,
  forwardedRef: ForwardedRef<HTMLDivElement>
}

function ColorChannelField(props: ColorChannelFieldProps) {
  let {locale} = useLocale();
  let state = useColorChannelFieldState({
    ...props,
    locale
  });

  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useColorChannelField({
    ...removeDataAttributes(props),
    label,
    validationBehavior: props.validationBehavior ?? 'native'
  }, state, inputRef);

  return (
    <>
      {useChildren(
        props,
        state,
        props.forwardedRef,
        inputProps,
        inputRef,
        labelProps,
        labelRef,
        descriptionProps,
        errorMessageProps,
        validation
      )}
      {props.name && <input type="hidden" name={props.name} value={isNaN(state.numberValue) ? '' : state.numberValue} />}
    </>
  );
}

interface HexColorFieldProps extends ColorFieldProps {
  forwardedRef: ForwardedRef<HTMLDivElement>
}

function HexColorField(props: HexColorFieldProps) {
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

  return useChildren(
    props,
    state,
    props.forwardedRef,
    inputProps,
    inputRef,
    labelProps,
    labelRef,
    descriptionProps,
    errorMessageProps,
    validation
  );
}

function useChildren(
  props: ColorFieldProps,
  state: ColorFieldState,
  ref: ForwardedRef<HTMLDivElement>,
  inputProps: InputHTMLAttributes<HTMLElement>,
  inputRef: Ref<HTMLInputElement>,
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  labelRef: Ref<HTMLLabelElement>,
  descriptionProps: HTMLAttributes<HTMLElement>,
  errorMessageProps: HTMLAttributes<HTMLElement>,
  validation: ValidationResult
) {
  let renderProps = useRenderProps({
    ...props,
    values: {
      state,
      channel: props.channel || 'hex',
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
        data-channel={props.channel || 'hex'}
        data-disabled={props.isDisabled || undefined}
        data-invalid={validation.isInvalid || undefined} />
    </Provider>
  );
}
