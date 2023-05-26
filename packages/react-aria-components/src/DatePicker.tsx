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
import {AriaDatePickerProps, AriaDateRangePickerProps, DateValue, useDateField, useDatePicker, useDateRangePicker, useLocale} from 'react-aria';
import {ButtonContext} from './Button';
import {CalendarContext, RangeCalendarContext} from './Calendar';
import {ContextValue, forwardRefType, Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {createCalendar} from '@internationalized/date';
import {DateInputContext} from './DateField';
import {DatePickerState, DateRangePickerState, useDateFieldState, useDatePickerState, useDateRangePickerState} from 'react-stately';
import {DialogContext} from './Dialog';
import {filterDOMProps} from '@react-aria/utils';
import {GroupContext} from './Group';
import {LabelContext} from './Label';
import {PopoverContext} from './Popover';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {TextContext} from './Text';

export interface DatePickerProps<T extends DateValue> extends Omit<AriaDatePickerProps<T>, 'label' | 'description' | 'errorMessage'>, RenderProps<DatePickerState>, SlotProps {}
export interface DateRangePickerProps<T extends DateValue> extends Omit<AriaDateRangePickerProps<T>, 'label' | 'description' | 'errorMessage'>, RenderProps<DateRangePickerState>, SlotProps {}

export const DatePickerContext = createContext<ContextValue<DatePickerProps<any>, HTMLDivElement>>(null);
export const DateRangePickerContext = createContext<ContextValue<DateRangePickerProps<any>, HTMLDivElement>>(null);

function DatePicker<T extends DateValue>(props: DatePickerProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, DatePickerContext);
  let state = useDatePickerState(props);
  let groupRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();
  let {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
    descriptionProps,
    errorMessageProps
  } = useDatePicker({...props, label}, state, groupRef);

  let {locale} = useLocale();
  let fieldState = useDateFieldState({
    ...fieldProps,
    locale,
    createCalendar
  });

  let fieldRef = useRef<HTMLDivElement>(null);
  let {fieldProps: dateFieldProps} = useDateField({...fieldProps, label}, fieldState, fieldRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-DatePicker'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, ref: groupRef}],
        [DateInputContext, {state: fieldState, fieldProps: dateFieldProps, ref: fieldRef}],
        [ButtonContext, {...buttonProps, isPressed: state.isOpen}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [CalendarContext, calendarProps],
        [PopoverContext, {state, triggerRef: groupRef, placement: 'bottom start'}],
        [DialogContext, dialogProps],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div {...DOMProps} {...renderProps} ref={ref} slot={props.slot} />
    </Provider>
  );
}

/**
 * A date picker combines a DateField and a Calendar popover to allow users to enter or select a date and time value.
 */
const _DatePicker = /*#__PURE__*/ (forwardRef as forwardRefType)(DatePicker);
export {_DatePicker as DatePicker};

function DateRangePicker<T extends DateValue>(props: DateRangePickerProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, DateRangePickerContext);
  let state = useDateRangePickerState(props);
  let groupRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();
  let {
    groupProps,
    labelProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
    descriptionProps,
    errorMessageProps
  } = useDateRangePicker({...props, label}, state, groupRef);

  let {locale} = useLocale();
  let startFieldState = useDateFieldState({
    ...startFieldProps,
    locale,
    createCalendar
  });

  let startFieldRef = useRef<HTMLDivElement>(null);
  let {fieldProps: startDateFieldProps} = useDateField({...startFieldProps, label}, startFieldState, startFieldRef);

  let endFieldState = useDateFieldState({
    ...endFieldProps,
    locale,
    createCalendar
  });

  let endFieldRef = useRef<HTMLDivElement>(null);
  let {fieldProps: endDateFieldProps} = useDateField({...endFieldProps, label}, endFieldState, endFieldRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-DateRangePicker'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, ref: groupRef}],
        [ButtonContext, {...buttonProps, isPressed: state.isOpen}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [RangeCalendarContext, calendarProps],
        [PopoverContext, {state, triggerRef: groupRef, placement: 'bottom start'}],
        [DialogContext, dialogProps],
        [DateInputContext, {
          slots: {
            start: {
              state: startFieldState,
              fieldProps: startDateFieldProps,
              ref: startFieldRef
            },
            end: {
              state: endFieldState,
              fieldProps: endDateFieldProps,
              ref: endFieldRef
            }
          }
        }],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div {...DOMProps} {...renderProps} ref={ref} slot={props.slot} />
    </Provider>
  );
}

/**
 * A date range picker combines two DateFields and a RangeCalendar popover to allow
 * users to enter or select a date and time range.
 */
const _DateRangePicker = /*#__PURE__*/ (forwardRef as forwardRefType)(DateRangePicker);
export {_DateRangePicker as DateRangePicker};
