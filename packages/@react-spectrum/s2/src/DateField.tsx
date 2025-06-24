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
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  ContextValue,
  DateInput,
  DateSegment,
  DateValue,
  FormContext
} from 'react-aria-components';
import {Context, createContext, forwardRef, ReactElement, Ref, RefAttributes, useContext} from 'react';
import {field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText} from './Field';
import {forwardRefType, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {style} from '../style' with {type: 'macro'};
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface DateFieldProps<T extends DateValue> extends
  Omit<AriaDateFieldProps<T>, 'children' | 'className' | 'style'>,
  StyleProps,
  SpectrumLabelableProps,
  HelpTextProps {
    /**
     * The size of the DateField.
     *
     * @default 'M'
     */
    size?: 'S' | 'M' | 'L' | 'XL'
}

export const DateFieldContext:
  Context<ContextValue<Partial<DateFieldProps<any>>, HTMLDivElement>> =
  createContext<ContextValue<Partial<DateFieldProps<any>>, HTMLDivElement>>(null);

const segmentContainer = style({
  flexGrow: 1
});

const dateInput = style({
  outlineStyle: 'none',
  caretColor: 'transparent',
  backgroundColor: {
    default: 'transparent',
    isFocused: 'blue-900'
  },
  color: {
    isFocused: 'white'
  },
  borderRadius: '[2px]',
  paddingX: 2
});

const iconStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end'
});

export const DateField:
  <T extends DateValue>(props: DateFieldProps<T> & RefAttributes<HTMLDivElement>) => ReactElement | null =
/*#__PURE__*/ (forwardRef as forwardRefType)(function DateField<T extends DateValue>(
  props: DateFieldProps<T>, ref: Ref<HTMLDivElement>
): ReactElement {
  [props, ref] = useSpectrumContextProps(props, ref, DateFieldContext);
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
    ...dateFieldProps
  } = props;
  let formContext = useContext(FormContext);

  return (
    <AriaDateField
      ref={ref}
      isRequired={isRequired}
      {...dateFieldProps}
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
              <DateInput className={segmentContainer}>
                {(segment) => <DateSegment className={dateInput} segment={segment} />}
              </DateInput>
              {isInvalid && <div className={iconStyles}><FieldErrorIcon isDisabled={isDisabled} /></div>}
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
    </AriaDateField>
  );
});
