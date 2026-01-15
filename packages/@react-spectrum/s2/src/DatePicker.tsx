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
  ContextValue,
  DateValue,
  Dialog,
  FormContext,
  OverlayTriggerStateContext,
  PopoverProps,
  Provider,
  TimeValue
} from 'react-aria-components';
import {baseColor, focusRing, fontRelative, space, style} from '../style' with {type: 'macro'};
import {Calendar, CalendarProps, IconContext, TimeField} from '../';
import CalendarIcon from '../s2wf-icons/S2_Icon_Calendar_20_N.svg';
import {controlBorderRadius, field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactElement, ReactNode, Ref, useContext, useRef, useState} from 'react';
import {DateInput, DateInputContainer, InvalidIndicator} from './DateField';
import {FieldGroup, FieldLabel, HelpText} from './Field';
import {forwardRefType, GlobalDOMAttributes, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Popover} from './Popover';
import {pressScale} from './pressScale';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface DatePickerProps<T extends DateValue> extends
  Omit<AriaDatePickerProps<T>, 'children' | 'className' | 'style' | 'isTriggerUpWhenOpen' | keyof GlobalDOMAttributes>,
  Pick<CalendarProps<T>, 'createCalendar' | 'pageBehavior' | 'firstDayOfWeek' | 'isDateUnavailable'>,
  Pick<PopoverProps, 'shouldFlip'>,
  StyleProps,
  SpectrumLabelableProps,
  HelpTextProps {
    /**
     * The size of the DateField.
     *
     * @default 'M'
     */
    size?: 'S' | 'M' | 'L' | 'XL',
    /**
     * The maximum number of months to display at once in the calendar popover, if screen space permits.
     * @default 1
     */
    maxVisibleMonths?: number
}

export const DatePickerContext = createContext<ContextValue<Partial<DatePickerProps<any>>, HTMLDivElement>>(null);

const inputButton = style<ButtonRenderProps & {isOpen: boolean, size: 'S' | 'M' | 'L' | 'XL'}>({
  ...focusRing(),
  ...controlBorderRadius('sm'),
  position: 'relative',
  font: {
    size: {
      S: 'ui-sm',
      M: 'ui',
      L: 'ui-lg',
      XL: 'ui-xl'
    }
  },
  cursor: 'default',
  display: 'flex',
  textAlign: 'center',
  borderStyle: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  width: {
    size: {
      S: 16,
      M: 20,
      L: 24,
      XL: 32
    }
  },
  height: 'auto',
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

export const timeField = style({
  flexShrink: 1,
  flexGrow: 0,
  minWidth: 0,
  width: 'unset'
});

/**
 * DatePickers combine a DateField and a Calendar popover to allow users to enter or select a date and time value.
 */
export const DatePicker = /*#__PURE__*/ (forwardRef as forwardRefType)(function DatePicker<T extends DateValue>(
  props: DatePickerProps<T>, ref: Ref<HTMLDivElement>
): ReactElement {
  [props, ref] = useSpectrumContextProps(props, ref, DatePickerContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
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
    placeholderValue,
    maxVisibleMonths = 1,
    createCalendar,
    ...dateFieldProps
  } = props;
  let formContext = useContext(FormContext);
  let [buttonHasFocus, setButtonHasFocus] = useState(false);

  return (
    <AriaDatePicker
      ref={ref}
      isRequired={isRequired}
      {...dateFieldProps}
      isTriggerUpWhenOpen
      style={UNSAFE_style}
      className={(UNSAFE_className || '') + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, styles)}>
      {({isDisabled, isInvalid, isOpen, state}) => {
        let placeholder: DateValue | undefined = placeholderValue ?? undefined;
        let timePlaceholder = placeholder && 'hour' in placeholder ? placeholder : undefined;
        let timeMinValue = props.minValue && 'hour' in props.minValue ? props.minValue : undefined;
        let timeMaxValue = props.maxValue && 'hour' in props.maxValue ? props.maxValue : undefined;
        let timeGranularity = state.granularity === 'hour' || state.granularity === 'minute' || state.granularity === 'second' ? state.granularity : undefined;
        let showTimeField = !!timeGranularity;
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
                textWrap: 'nowrap',
                paddingStart: 'edge-to-text',
                paddingEnd: {
                  size: {
                    S: 2,
                    M: 4,
                    L: space(6),
                    XL: space(6)
                  }
                }
              })({size})}>
              <DateInputContainer>
                <DateInput />
              </DateInputContainer>
              <InvalidIndicator isInvalid={isInvalid} isDisabled={isDisabled} />
              <CalendarButton isOpen={isOpen} size={size} setButtonHasFocus={setButtonHasFocus} />
            </FieldGroup>
            <CalendarPopover shouldFlip={props.shouldFlip}>
              <Calendar
                visibleMonths={maxVisibleMonths}
                createCalendar={createCalendar} />
              {showTimeField && (
                <div className={style({display: 'flex', gap: 16, contain: 'inline-size'})}>
                  <TimeField
                    styles={timeField}
                    label={stringFormatter.format('datepicker.time')}
                    value={state.timeValue}
                    // TODO: why do i need the cast?
                    onChange={v => state.setTimeValue(v as TimeValue)}
                    placeholderValue={timePlaceholder}
                    granularity={timeGranularity}
                    minValue={timeMinValue}
                    maxValue={timeMaxValue}
                    hourCycle={props.hourCycle}
                    hideTimeZone={props.hideTimeZone} />
                </div>
              )}
            </CalendarPopover>
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

export function CalendarPopover(props: Omit<PopoverProps, 'children'> & {children: ReactNode}): ReactElement {
  return (
    <Popover
      {...props}
      hideArrow
      padding="none">
      <div
        className={style({
          paddingX: 16,
          paddingY: 32,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxSizing: 'border-box',
          size: 'full'
        })}>
        <Dialog>
          <Provider
            values={[
              [OverlayTriggerStateContext, null]
            ]}>
            {props.children}
          </Provider>
        </Dialog>
      </div>
    </Popover>
  );
}


export function CalendarButton(props: {isOpen: boolean, size: 'S' | 'M' | 'L' | 'XL', setButtonHasFocus: (hasFocus: boolean) => void}): ReactElement {
  let buttonRef = useRef<HTMLButtonElement>(null);
  let {isOpen, size, setButtonHasFocus} = props;
  return (
    <Button
      ref={buttonRef}
      onFocusChange={setButtonHasFocus}
      style={pressScale(buttonRef)}
      className={renderProps => inputButton({
        ...renderProps,
        size,
        isOpen
      })}>
      <Provider
        values={[
          [IconContext, {
            styles: style({
              '--iconPrimary': {
                type: 'fill',
                value: 'currentColor'
              },
              size: fontRelative(14)
            })
          }]
        ]}>
        <CalendarIcon />
      </Provider>
    </Button>
  );
}
