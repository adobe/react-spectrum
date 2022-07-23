import {useRef, createContext, useContext} from 'react';
import {useDatePickerState, useDateFieldState, useDateRangePickerState} from 'react-stately';
import {useDatePicker, useDateRangePicker, useDateField} from 'react-aria';
import {LabelContext} from './Label';
import {DateFieldContext, DateField, DateInput} from './DateField';
import {ButtonContext} from './Button';
import {DialogContext} from './Dialog';
import {CalendarContext} from './Calendar';
import {PopoverContext} from './Popover';
import {useLocale} from 'react-aria';
import {createCalendar} from '@internationalized/date';
import {GroupContext} from './Group';
import {Provider} from './utils';

export function DatePicker(props) {
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
    value: state.value,
    onChange: state.setValue,
    locale,
    createCalendar
  });
  
  let fieldRef = useRef();
  let { fieldProps: dateFieldProps } = useDateField({...fieldProps, label: 's'}, fieldState, fieldRef);
  
  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, groupRef}],
        [DateFieldContext, {state: fieldState, fieldProps: dateFieldProps, fieldRef}],
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

const DateRangePickerContext = createContext();

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
  
  return (
    <Provider
      values={[
        [DateRangePickerContext, {state, startFieldProps, endFieldProps}],
        [GroupContext, {...groupProps, groupRef}],
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

export function StartDateInput(props) {
  let {state, startFieldProps} = useContext(DateRangePickerContext);
  return (
    <DateField {...startFieldProps}>
      <DateInput {...props} />
    </DateField>
  );
}

export function EndDateInput(props) {
  let {state, endFieldProps} = useContext(DateRangePickerContext);
  return (
    <DateField {...endFieldProps}>
      <DateInput {...props} />
    </DateField>
  );
}
