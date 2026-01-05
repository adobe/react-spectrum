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
  TimeField as AriaTimeField,
  TimeFieldProps as AriaTimeFieldProps,
  ContextValue,
  FormContext,
  TimeValue
} from 'react-aria-components';
import {createContext, forwardRef, ReactElement, Ref, useContext} from 'react';
import {DateInput, DateInputContainer, InvalidIndicator} from './DateField';
import {field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldGroup, FieldLabel, HelpText} from './Field';
import {forwardRefType, GlobalDOMAttributes, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {style} from '../style' with {type: 'macro'};
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface TimeFieldProps<T extends TimeValue> extends
  Omit<AriaTimeFieldProps<T>, 'children' | 'className' | 'style' | keyof GlobalDOMAttributes>,
  StyleProps,
  SpectrumLabelableProps,
  HelpTextProps {
    /**
     * The size of the TimeField.
     *
     * @default 'M'
     */
    size?: 'S' | 'M' | 'L' | 'XL'
}

export const TimeFieldContext = createContext<ContextValue<Partial<TimeFieldProps<any>>, HTMLDivElement>>(null);

/**
 * TimeFields allow users to enter and edit time values using a keyboard.
 * Each part of the time is displayed in an individually editable segment.
 */
export const TimeField = /*#__PURE__*/ (forwardRef as forwardRefType)(function TimeField<T extends TimeValue>(
  props: TimeFieldProps<T>, ref: Ref<HTMLDivElement>
): ReactElement {
  [props, ref] = useSpectrumContextProps(props, ref, TimeFieldContext);
  let {
    label,
    contextualHelp,
    description: descriptionMessage,
    errorMessage,
    isRequired,
    size = 'M',
    labelPosition = 'top',
    necessityIndicator,
    labelAlign = 'start',
    UNSAFE_style,
    UNSAFE_className,
    styles,
    ...timeFieldProps
  } = props;
  let formContext = useContext(FormContext);

  return (
    <AriaTimeField
      ref={ref}
      isRequired={isRequired}
      {...timeFieldProps}
      style={UNSAFE_style}
      className={(UNSAFE_className || '') + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, styles)}>
      {({isDisabled, isInvalid}) => {
        return (
          <>
            <FieldLabel
              isDisabled={isDisabled}
              isRequired={isRequired}
              size={size}
              labelPosition={labelPosition}
              labelAlign={labelAlign}
              necessityIndicator={necessityIndicator}
              contextualHelp={contextualHelp}>
              {label}
            </FieldLabel>

            <FieldGroup
              role="presentation"
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              size={size}
              styles={style({
                ...fieldInput(),
                paddingX: 'edge-to-text'
              })({size})}>
              <DateInputContainer>
                <DateInput />
              </DateInputContainer>
              <InvalidIndicator isInvalid={isInvalid} isDisabled={isDisabled} />
            </FieldGroup>
            <HelpText
              size={size}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              description={descriptionMessage}>
              {errorMessage}
            </HelpText>
          </>
        );
      }}
    </AriaTimeField>
  );
});
