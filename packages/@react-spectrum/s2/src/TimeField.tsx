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
  DateInput,
  DateSegment,
  FormContext,
  TimeValue
} from 'react-aria-components';
import {Context, createContext, forwardRef, ReactElement, Ref, RefAttributes, useContext} from 'react';
import {field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText} from './Field';
import {forwardRefType, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {style} from '../style' with {type: 'macro'};
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface TimeFieldProps<T extends TimeValue> extends
  Omit<AriaTimeFieldProps<T>, 'children' | 'className' | 'style'>,
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

export const TimeFieldContext:
  Context<ContextValue<Partial<TimeFieldProps<any>>, HTMLDivElement>> =
  createContext<ContextValue<Partial<TimeFieldProps<any>>, HTMLDivElement>>(null);

const segmentContainer = style({
  flexGrow: 1
});

// TODO: Figure out field width
const timeInput = style({
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

export const TimeField:
  <T extends TimeValue>(props: TimeFieldProps<T> & RefAttributes<HTMLDivElement>) => ReactElement | null =
/*#__PURE__*/ (forwardRef as forwardRefType)(function TimeField<T extends TimeValue>(
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
              <DateInput className={segmentContainer}>
                {(segment) => <DateSegment className={timeInput} segment={segment} />}
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
    </AriaTimeField>
  );
});
