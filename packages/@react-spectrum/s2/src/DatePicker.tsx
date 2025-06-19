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
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  Button,
  ButtonRenderProps,
  CalendarCell,
  CalendarGrid,
  ContextValue,
  DateInput,
  DateSegment,
  DateValue,
  FormContext,
  Provider
} from 'react-aria-components';
import {baseColor, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
import {Calendar, Heading, IconContext, Popover} from '../';
import CalendarIcon from '../s2wf-icons/S2_Icon_Calendar_20_N.svg';
import {Context, createContext, forwardRef, ReactElement, Ref, RefAttributes, useContext, useRef, useState} from 'react';
import {controlBorderRadius, field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText} from './Field';
import {forwardRefType, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {pressScale} from './pressScale';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface DatePickerProps<T extends DateValue> extends
  Omit<AriaDatePickerProps<T>, 'children' | 'className' | 'style'>,
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

export const DatePickerContext:
  Context<ContextValue<Partial<DatePickerProps<any>>, HTMLDivElement>> =
  createContext<ContextValue<Partial<DatePickerProps<any>>, HTMLDivElement>>(null);

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
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end'
});

const inputButton = style<ButtonRenderProps & {isOpen: boolean, size: 'S' | 'M' | 'L' | 'XL'}>({
  ...focusRing(),
  ...controlBorderRadius('sm'),
  display: 'flex',
  textAlign: 'center',
  borderStyle: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  size: {
    size: {
      S: 16,
      M: 20,
      L: 24,
      XL: 32
    }
  },
  marginStart: 'text-to-control',
  aspectRatio: 'square',
  flexShrink: 0,
  transition: {
    default: 'default',
    forcedColors: 'none'
  },
  backgroundColor: {
    default: baseColor('gray-100'),
    isOpen: 'gray-200',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isHovered: 'Highlight',
      isOpen: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: 'ButtonFace'
  }
});

export const DatePicker:
  <T extends DateValue>(props: DatePickerProps<T> & RefAttributes<HTMLDivElement>) => ReactElement | null =
/*#__PURE__*/ (forwardRef as forwardRefType)(function DatePicker<T extends DateValue>(
  props: DatePickerProps<T>, ref: Ref<HTMLDivElement>
): ReactElement {
  [props, ref] = useSpectrumContextProps(props, ref, DatePickerContext);
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
  let buttonRef = useRef<HTMLButtonElement>(null);
  let [buttonHasFocus, setButtonHasFocus] = useState(false);

  return (
    <AriaDatePicker
      ref={ref}
      isRequired={isRequired}
      {...dateFieldProps}
      style={UNSAFE_style}
      className={UNSAFE_className + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, styles)}>
      {({isDisabled, isInvalid, isOpen}) => {
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
              shouldTurnOffFocusRing={buttonHasFocus}
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
              <Button
                ref={buttonRef}
                // Prevent press scale from sticking while DatePicker is open.
                // @ts-ignore
                isPressed={false}
                onFocusChange={setButtonHasFocus}
                style={renderProps => pressScale(buttonRef)(renderProps)}
                className={renderProps => inputButton({
                  ...renderProps,
                  size,
                  isOpen
                })}>
                <Provider
                  values={[
                    [IconContext, {
                      styles: style({size: fontRelative(14)})
                    }]
                  ]}>
                  <CalendarIcon />
                </Provider>
              </Button>
            </FieldGroup>
            <Popover hideArrow>
              <Calendar>
                <header>
                  <Button slot="previous">◀</Button>
                  <Heading />
                  <Button slot="next">▶</Button>
                </header>
                <CalendarGrid>
                  {(date) => <CalendarCell date={date} />}
                </CalendarGrid>
              </Calendar>
            </Popover>
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
    </AriaDatePicker>
  );
});

