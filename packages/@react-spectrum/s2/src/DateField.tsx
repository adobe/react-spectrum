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
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  ContextValue,
  DateInputProps,
  DateSegmentRenderProps,
  DateValue,
  FormContext
} from 'react-aria-components';
import {createContext, forwardRef, PropsWithChildren, ReactElement, Ref, useContext} from 'react';
import {field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText} from './Field';
import {forwardRefType, GlobalDOMAttributes, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {style} from '../style' with {type: 'macro'};
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface DateFieldProps<T extends DateValue> extends
  Omit<AriaDateFieldProps<T>, 'children' | 'className' | 'style' | keyof GlobalDOMAttributes>,
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

export const DateFieldContext = createContext<ContextValue<Partial<DateFieldProps<any>>, HTMLDivElement>>(null);

const segmentContainer = style({
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  height: 'full',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  textWrap: 'nowrap'
});

const dateSegment = style<DateSegmentRenderProps & {isPunctuation: boolean}>({
  outlineStyle: 'none',
  caretColor: 'transparent',
  backgroundColor: {
    default: 'transparent',
    isFocused: 'blue-800',
    forcedColors: {
      default: 'transparent',
      isFocused: 'Highlight'
    }
  },
  color: {
    isFocused: 'white',
    forcedColors: {
      isFocused: 'HighlightText'
    }
  },
  borderRadius: '[2px]',
  paddingX: {
    default: 2,
    isPunctuation: 0
  },
  paddingY: 2,
  forcedColorAdjust: 'none'
});

const iconStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end'
});

/**
 * DateFields allow users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
export const DateField = /*#__PURE__*/ (forwardRef as forwardRefType)(function DateField<T extends DateValue>(
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
    </AriaDateField>
  );
});

export function DateInputContainer(props: PropsWithChildren): ReactElement {
  return <div className={segmentContainer}>{props.children}</div>;
}

export function DateInput(props: Omit<DateInputProps, 'children'>): ReactElement {
  return (
    <AriaDateInput {...props}>
      {(segment) => (
        <AriaDateSegment
          segment={segment}
          className={(renderProps) => dateSegment({...renderProps, isPunctuation: segment.type === 'literal'})} />
      )}
    </AriaDateInput>
  );
}

export function InvalidIndicator(props: {isInvalid: boolean, isDisabled: boolean}): ReactElement | null {
  return props.isInvalid ? <div className={iconStyles}><FieldErrorIcon isDisabled={props.isDisabled} /></div> : null;
}
