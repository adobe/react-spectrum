import {AriaDatePickerProps, useDateField, useDatePicker, useDateRangePicker} from 'react-aria';
import {ButtonContext} from './Button';
import {CalendarContext, RangeCalendarContext} from './Calendar';
import {createCalendar} from '@internationalized/date';
import {DateInputContext} from './DateField';
import {DateValue} from '@react-types/datepicker';
import {DialogContext} from './Dialog';
import {GroupContext} from './Group';
import {LabelContext} from './Label';
import {PopoverContext} from './Popover';
import {Provider} from './utils';
import React, {ReactNode, useRef} from 'react';
import {useDateFieldState, useDatePickerState, useDateRangePickerState} from 'react-stately';
import {useLocale} from 'react-aria';

interface DatePickerProps<T extends DateValue> extends AriaDatePickerProps<T> {
  children: ReactNode
}

export function DatePicker<T extends DateValue>(props: DatePickerProps<T>) {
  let state = useDatePickerState(props);
  state.close = () => state.setOpen(false);
  let groupRef = useRef();
  let {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps
  } = useDatePicker({...props, label: 's'}, state, groupRef);

  let {locale} = useLocale();
  let fieldState = useDateFieldState({
    ...fieldProps,
    locale,
    createCalendar
  });

  let fieldRef = useRef();
  let {fieldProps: dateFieldProps} = useDateField({...fieldProps, label: 's'}, fieldState, fieldRef);

  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, ref: groupRef}],
        [DateInputContext, {state: fieldState, fieldProps: dateFieldProps, ref: fieldRef}],
        [ButtonContext, buttonProps],
        [LabelContext, labelProps],
        [CalendarContext, calendarProps],
        [PopoverContext, {state, triggerRef: groupRef}],
        [DialogContext, dialogProps]
      ]}>
      {props.children}
    </Provider>
  );
}

export function DateRangePicker(props) {
  let state = useDateRangePickerState(props);
  state.close = () => state.setOpen(false);
  let groupRef = useRef();
  let {
    groupProps,
    labelProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps
  } = useDateRangePicker({...props, label: 's'}, state, groupRef);

  let {locale} = useLocale();
  let startFieldState = useDateFieldState({
    ...startFieldProps,
    locale,
    createCalendar
  });

  let startFieldRef = useRef();
  let {fieldProps: startDateFieldProps} = useDateField({...startFieldProps, label: 's'}, startFieldState, startFieldRef);

  let endFieldState = useDateFieldState({
    ...endFieldProps,
    locale,
    createCalendar
  });

  let endFieldRef = useRef();
  let {fieldProps: endDateFieldProps} = useDateField({...startFieldProps, label: 's'}, endFieldState, endFieldRef);

  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, ref: groupRef}],
        [ButtonContext, buttonProps],
        [LabelContext, labelProps],
        [RangeCalendarContext, calendarProps],
        [PopoverContext, {state, triggerRef: groupRef}],
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
