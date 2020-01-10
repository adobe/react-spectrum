import {DOMProps, InputBase, LabelableProps, RangeValue, SpectrumLabelableProps, StyleProps, ValueBase} from '@react-types/shared';

export type DateValue = string | number | Date;
interface DatePickerBase extends InputBase, LabelableProps {
  minValue?: DateValue,
  maxValue?: DateValue,
  formatOptions?: Intl.DateTimeFormatOptions,
  placeholderDate?: DateValue
}

export interface DatePickerProps extends DatePickerBase, ValueBase<DateValue> {}

export type DateRange = RangeValue<DateValue>;
export interface DateRangePickerProps extends DatePickerBase, ValueBase<DateRange> {}

interface SpectrumDatePickerBase extends SpectrumLabelableProps, DOMProps, StyleProps {
  isQuiet?: boolean
}

export interface SpectrumDatePickerProps extends DatePickerProps, SpectrumDatePickerBase {}
export interface SpectrumDateRangePickerProps extends DateRangePickerProps, SpectrumDatePickerBase {}
