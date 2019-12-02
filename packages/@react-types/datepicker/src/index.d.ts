import {InputBase, RangeValue, ValueBase} from '@react-types/shared';

export type DateValue = string | number | Date;
interface DatePickerBase extends InputBase {
  minValue?: DateValue,
  maxValue?: DateValue,
  formatOptions?: Intl.DateTimeFormatOptions,
  placeholderDate?: DateValue
}

export interface DatePickerProps extends DatePickerBase, ValueBase<DateValue> {}

export type DateRange = RangeValue<DateValue>;
export interface DateRangePickerProps extends DatePickerBase, ValueBase<DateRange> {}
