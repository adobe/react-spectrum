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
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  ContextValue
} from 'react-aria-components';
import {DOMRef, DOMRefValue, HelpTextProps, Orientation, SpectrumLabelableProps} from '@react-types/shared';
import {field, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldLabel, HelpText} from './Field';
import {FormContext, useFormProps} from './Form';
import React, {createContext, forwardRef, ReactNode, useContext} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'className' | 'style' | 'children'>, StyleProps, SpectrumLabelableProps, HelpTextProps {
  /**
   * The Radios contained within the RadioGroup.
   */
  children?: ReactNode,
  /**
   * The size of the RadioGroup.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The axis the radio elements should align with.
   *
   * @default 'vertical'
   */
  orientation?: Orientation,
  /**
   * Whether the RadioGroup should be displayed with an emphasized style.
   */
  isEmphasized?: boolean
}

export const RadioGroupContext = createContext<ContextValue<RadioGroupProps, DOMRefValue<HTMLDivElement>>>(null);

/**
 * Radio groups allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
export const RadioGroup = /*#__PURE__*/ forwardRef(function RadioGroup(props: RadioGroupProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, RadioGroupContext);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let domRef = useDOMRef(ref);

  let {
    label,
    description,
    errorMessage,
    children,
    isEmphasized,
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator = 'icon',
    size = 'M',
    orientation = 'vertical',
    UNSAFE_className = '',
    UNSAFE_style,
    ...groupProps
  } = props;

  return (
    <AriaRadioGroup
      {...groupProps}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + style({
        ...field(),
        // Double the usual gap because of the internal padding within checkbox that spectrum has.
        '--field-gap': {
          type: 'rowGap',
          value: '[calc(var(--field-height) - 1lh)]'
        }
      }, getAllowedOverrides())({
        size,
        labelPosition,
        isInForm: !!formContext
      }, props.styles)}>
      {({isDisabled, isInvalid}) => (
        <>
          <FieldLabel
            isDisabled={isDisabled}
            isRequired={props.isRequired}
            size={size}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            necessityIndicator={necessityIndicator}
            contextualHelp={props.contextualHelp}>
            {label}
          </FieldLabel>
          <div
            className={style({
              gridArea: 'input',
              display: 'flex',
              flexDirection: {
                orientation: {
                  vertical: 'column',
                  horizontal: 'row'
                }
              },
              flexWrap: 'wrap',
              // Spectrum uses a fixed spacing value for horizontal (column),
              // but the gap changes depending on t-shirt size in vertical (row).
              columnGap: 16,
              rowGap: '--field-gap'
            })({orientation})}>
            <FormContext.Provider value={{...formContext, size, isEmphasized}}>
              {children}
            </FormContext.Provider>
          </div>
          <HelpText
            size={size}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            description={description}
            showErrorIcon>
            {errorMessage}
          </HelpText>
        </>
      )}
    </AriaRadioGroup>
  );
});
