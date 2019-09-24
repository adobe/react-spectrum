import {DateValue} from '@react-types/datepicker';

export function setTime(date: Date, time: Date) {
  if (!date || !time) {
    return;
  }

  date.setHours(time.getHours());
  date.setMinutes(time.getMinutes());
  date.setSeconds(time.getSeconds());
  date.setMilliseconds(time.getMilliseconds());
}

export function isInvalid(value: Date, minValue: DateValue, maxValue: DateValue) {
  return value != null && (
    (minValue != null && value < new Date(minValue)) || 
    (maxValue != null && value > new Date(maxValue))
  );
}
