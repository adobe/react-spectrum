import {DateRange, DateRangePickerProps, DateValue} from '@react-types/datepicker';
import {isInvalid, setTime} from './utils';
import {RangeValue, ValidationState} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils/src/useControlledState';
import {useState} from 'react';

export interface DateRangePickerState {
  value: DateRange,
  setValue: (value: DateRange) => void,
  setDate: (part: keyof DateRange, value: DateValue) => void,
  selectDateRange: (value: RangeValue<Date>) => void,
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  validationState: ValidationState
}

export function useDateRangePickerState(props: DateRangePickerProps): DateRangePickerState {
  let [isOpen, setOpen] = useState(false);
  let onChange = value => {
    if (value.start && value.end && props.onChange) {
      props.onChange(value);
    }
  };

  let [value, setValue] = useControlledState(
    props.value === null ? {start: null, end: null} : props.value,
    props.defaultValue || {start: null, end: null},
    onChange
  );

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  let selectDateRange = (range: RangeValue<Date>) => {
    if (range) {
      setTime(range.start, value.start);
      setTime(range.end, value.end);
    }
    setValue(range);
    setOpen(false);
  };

  let validationState: ValidationState = props.validationState
    || (value != null && (
      isInvalid(value.start, props.minValue, props.maxValue) || 
      isInvalid(value.end, props.minValue, props.maxValue) ||
      (value.end != null && value.start != null && value.end < value.start)
    ) ? 'invalid' : null);

  return {
    value,
    setValue,
    setDate(part, date) {
      setValue({...value, [part]: date});
    },
    selectDateRange,
    isOpen,
    setOpen,
    validationState
  };
}
