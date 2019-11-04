import {DatePickerProps} from '@react-types/datepicker';
import {isInvalid, setTime} from './utils';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';
import {ValidationState} from '@react-types/shared';

export interface DatePickerState {
  value: Date,
  setValue: (value: Date) => void,
  selectDate: (value: Date) => void,
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  validationState: ValidationState
}

export function useDatePickerState(props: DatePickerProps): DatePickerState {
  let [isOpen, setOpen] = useState(false);
  let [value, setValue] = useControlledState(props.value, props.defaultValue || null, props.onChange);
  let dateValue = value != null ? new Date(value) : null;

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  let selectDate = (newValue: Date) => {
    if (value) {
      setTime(newValue, dateValue);
    }
    setValue(newValue);
    setOpen(false);
  };
  
  let validationState: ValidationState = props.validationState || 
    (isInvalid(dateValue, props.minValue, props.maxValue) ? 'invalid' : null);

  return {
    value: dateValue,
    setValue,
    selectDate,
    isOpen,
    setOpen,
    validationState
  };
}
