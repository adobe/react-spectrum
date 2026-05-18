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

import {
  ColorField as AriaColorField,
  ColorFieldProps as AriaColorFieldProps
} from 'react-aria-components/ColorField';
import {ContextValue} from 'react-aria-components/slots';
import {
  createContext,
  forwardRef,
  ReactNode,
  Ref,
  useContext,
  useImperativeHandle,
  useRef
} from 'react';
import {createFocusableRef} from './useDOMRef';
import {field, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {FormContext, useFormProps} from './Form';
import {GlobalDOMAttributes, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {InputContext, InputProps} from 'react-aria-components/Input';
import {mergeRefs} from 'react-aria/mergeRefs';
import {style} from '../style' with {type: 'macro'};
import {TextFieldRef} from './TextField';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ColorFieldProps
  extends
    Omit<
      AriaColorFieldProps,
      'children' | 'className' | 'style' | 'render' | keyof GlobalDOMAttributes
    >,
    StyleProps,
    SpectrumLabelableProps,
    HelpTextProps,
    Pick<InputProps, 'placeholder'> {
  /**
   * The size of the color field.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /**
   * The prefix to display in the ColorField. A non-interactive element that appears before the
   * input.
   */
  prefix?: ReactNode;
}

export const ColorFieldContext =
  createContext<ContextValue<Partial<ColorFieldProps>, TextFieldRef>>(null);

/**
 * A color field allows users to edit a hex color or individual color channel value.
 */
export const ColorField = forwardRef(function ColorField(
  props: ColorFieldProps,
  ref: Ref<TextFieldRef>
) {
  [props, ref] = useSpectrumContextProps(props, ref, ColorFieldContext);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    necessityIndicator,
    labelPosition = 'top',
    labelAlign = 'start',
    UNSAFE_style,
    UNSAFE_className = '',
    styles,
    ...fieldProps
  } = props;

  // Expose imperative interface for ref
  let domRef = useRef<HTMLDivElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    ...createFocusableRef(domRef, inputRef),
    select() {
      if (inputRef.current) {
        inputRef.current.select();
      }
    },
    getInputElement() {
      return inputRef.current;
    }
  }));

  return (
    <AriaColorField
      {...fieldProps}
      ref={domRef}
      style={UNSAFE_style}
      className={
        UNSAFE_className +
        style(field(), getAllowedOverrides())(
          {
            size: props.size,
            labelPosition,
            isInForm: !!formContext
          },
          styles
        )
      }>
      {({isDisabled, isInvalid}) => (
        <>
          <FieldLabel
            isDisabled={isDisabled}
            isRequired={props.isRequired}
            size={props.size}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            necessityIndicator={necessityIndicator}
            contextualHelp={props.contextualHelp}>
            {label}
          </FieldLabel>
          <FieldGroup prefix={props.prefix} size={props.size}>
            <InputContext.Consumer>
              {ctx => (
                <InputContext.Provider
                  value={{
                    ...ctx,
                    ref: mergeRefs((ctx as any)?.ref, inputRef)
                  }}>
                  <Input />
                </InputContext.Provider>
              )}
            </InputContext.Consumer>
            {isInvalid && <FieldErrorIcon isDisabled={isDisabled} />}
          </FieldGroup>
          <HelpText
            size={props.size}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            description={description}>
            {errorMessage}
          </HelpText>
        </>
      )}
    </AriaColorField>
  );
});
