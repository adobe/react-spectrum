import {DOMProps, InputBase, RangeValue, ValueBase} from '@react-types/shared';

export type DateValue = string | number | Date;
interface DatePickerBase extends InputBase {
  minValue?: DateValue,
  maxValue?: DateValue,
  formatOptions?: Intl.DateTimeFormatOptions,
  placeholderDate?: DateValue
}

export interface DatePickerProps extends DOMProps, DatePickerBase, ValueBase<DateValue> {}

export type DateRange = RangeValue<DateValue>;
export interface DateRangePickerProps extends DOMProps, DatePickerBase, ValueBase<DateRange> {}
