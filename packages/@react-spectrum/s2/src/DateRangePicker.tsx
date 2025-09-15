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
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  ContextValue,
  DateValue,
  FormContext
} from 'react-aria-components';
import {CalendarButton, CalendarPopover, timeField} from './DatePicker';
import {createContext, forwardRef, ReactElement, Ref, useContext, useState} from 'react';
import {DateInput, DateInputContainer, InvalidIndicator} from './DateField';
import {field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldGroup, FieldLabel, HelpText} from './Field';
import {forwardRefType, GlobalDOMAttributes, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {RangeCalendar, RangeCalendarProps, TimeField} from '../';
import {style} from '../style' with {type: 'macro'};
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface DateRangePickerProps<T extends DateValue> extends
  Omit<AriaDateRangePickerProps<T>, 'children' | 'className' | 'style' | keyof GlobalDOMAttributes>,
  Pick<RangeCalendarProps<T>, 'createCalendar' | 'pageBehavior' | 'firstDayOfWeek' | 'isDateUnavailable'>,
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

export const DateRangePickerContext = createContext<ContextValue<Partial<DateRangePickerProps<any>>, HTMLDivElement>>(null);

/**
 * DateRangePickers combine two DateFields and a RangeCalendar popover to allow users
 * to enter or select a date and time range.
 */
export const DateRangePicker = /*#__PURE__*/ (forwardRef as forwardRefType)(function DateRangePicker<T extends DateValue>(
  props: DateRangePickerProps<T>, ref: Ref<HTMLDivElement>
): ReactElement {
  [props, ref] = useSpectrumContextProps(props, ref, DateRangePickerContext);
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
    <AriaDateRangePicker
      ref={ref}
      isRequired={isRequired}
      {...dateFieldProps}
      style={UNSAFE_style}
      className={(UNSAFE_className || '') + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, styles)}>
      {({isDisabled, isInvalid, isOpen, state}) => {
        let placeholder: DateValue | undefined = placeholderValue || undefined;
        let timePlaceholder = placeholder && 'hour' in placeholder ? placeholder : undefined;
        let timeMinValue = props.minValue && 'hour' in props.minValue ? props.minValue : undefined;
        let timeMaxValue = props.maxValue && 'hour' in props.maxValue ? props.maxValue : undefined;
        let timeGranularity = state.granularity === 'hour'
          || state.granularity === 'minute'
          || state.granularity === 'second'
            ? state.granularity : undefined;
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
                paddingEnd: 4
              })({size})}>
              <DateInputContainer>
                <DateInput slot="start" />
                <span aria-hidden="true" className={style({flexShrink: 0, flexGrow: 0, paddingX: 2})}>–</span>
                <DateInput slot="end" />
              </DateInputContainer>
              <InvalidIndicator isInvalid={isInvalid} isDisabled={isDisabled} />
              <div
                className={style({
                  flexShrink: 0,
                  flexGrow: 1,
                  display: 'flex',
                  justifyContent: 'end'
                })}>
                <CalendarButton isOpen={isOpen} size={size} setButtonHasFocus={setButtonHasFocus} />
              </div>
            </FieldGroup>
            <CalendarPopover>
              <RangeCalendar
                visibleMonths={maxVisibleMonths}
                createCalendar={createCalendar} />
              {showTimeField && (
                <div className={style({display: 'flex', gap: 16, contain: 'inline-size', marginTop: 24})}>
                  <TimeField
                    styles={timeField}
                    label={stringFormatter.format('datepicker.startTime')}
                    value={state.timeRange?.start || null}
                    onChange={v => state.setTime('start', v)}
                    placeholderValue={timePlaceholder}
                    granularity={timeGranularity}
                    minValue={timeMinValue}
                    maxValue={timeMaxValue}
                    hourCycle={props.hourCycle}
                    hideTimeZone={props.hideTimeZone} />
                  <TimeField
                    styles={timeField}
                    label={stringFormatter.format('datepicker.endTime')}
                    value={state.timeRange?.end || null}
                    onChange={v => state.setTime('end', v)}
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
    </AriaDateRangePicker>
  );
});
