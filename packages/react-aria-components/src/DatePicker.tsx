import {AriaDatePickerProps, useDateField, useDatePicker, useDateRangePicker, useLocale} from 'react-aria';
import {ButtonContext} from './Button';
import {CalendarContext, RangeCalendarContext} from './Calendar';
import {createCalendar} from '@internationalized/date';
import {DateInputContext} from './DateField';
import {AriaDateRangePickerProps, DateValue} from '@react-types/datepicker';
import {DialogContext} from './Dialog';
import {GroupContext} from './Group';
import {LabelContext} from './Label';
import {PopoverContext} from './Popover';
import {Provider, useSlot} from './utils';
import React, {ReactNode, useRef} from 'react';
import {useDateFieldState, useDatePickerState, useDateRangePickerState} from 'react-stately';

interface DatePickerProps<T extends DateValue> extends Omit<AriaDatePickerProps<T>, 'label'> {
  children: ReactNode
}

interface DateRangePickerProps<T extends DateValue> extends Omit<AriaDateRangePickerProps<T>, 'label'> {
  children: ReactNode
}

export function DatePicker<T extends DateValue>(props: DatePickerProps<T>) {
  let state = useDatePickerState(props);
  let groupRef = useRef();
  let [labelRef, label] = useSlot();
  let {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps
  } = useDatePicker({...props, label}, state, groupRef);

  let {locale} = useLocale();
  let fieldState = useDateFieldState({
    ...fieldProps,
    locale,
    createCalendar
  });

  let fieldRef = useRef();
  let {fieldProps: dateFieldProps} = useDateField({...fieldProps, label}, fieldState, fieldRef);

  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, ref: groupRef}],
        [DateInputContext, {state: fieldState, fieldProps: dateFieldProps, ref: fieldRef}],
        [ButtonContext, buttonProps],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [CalendarContext, calendarProps],
        [PopoverContext, {state, triggerRef: groupRef, placement: 'bottom start'}],
        [DialogContext, dialogProps]
      ]}>
      {props.children}
    </Provider>
  );
}

export function DateRangePicker<T extends DateValue>(props: DateRangePickerProps<T>) {
  let state = useDateRangePickerState(props);
  let groupRef = useRef();
  let [labelRef, label] = useSlot();
  let {
    groupProps,
    labelProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps
  } = useDateRangePicker({...props, label}, state, groupRef);

  let {locale} = useLocale();
  let startFieldState = useDateFieldState({
    ...startFieldProps,
    locale,
    createCalendar
  });

  let startFieldRef = useRef();
  let {fieldProps: startDateFieldProps} = useDateField({...startFieldProps, label}, startFieldState, startFieldRef);

  let endFieldState = useDateFieldState({
    ...endFieldProps,
    locale,
    createCalendar
  });

  let endFieldRef = useRef();
  let {fieldProps: endDateFieldProps} = useDateField({...startFieldProps, label}, endFieldState, endFieldRef);

  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, ref: groupRef}],
        [ButtonContext, buttonProps],
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
        }]
      ]}>
      {props.children}
    </Provider>
  );
}
