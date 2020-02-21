import {DOMProps, RangeValue, StyleProps, ValueBase} from '@react-types/shared';

export type DateValue = string | number | Date;
export interface CalendarPropsBase {
  minValue?: DateValue,
  maxValue?: DateValue,
  isDisabled?: boolean,
  isReadOnly?: boolean,
  autoFocus?: boolean
}

export type DateRange = RangeValue<DateValue>;
export interface CalendarProps extends CalendarPropsBase, ValueBase<DateValue> {}
export interface RangeCalendarProps extends CalendarPropsBase, ValueBase<DateRange> {}

export interface SpectrumCalendarProps extends CalendarProps, DOMProps, StyleProps {}
export interface SpectrumRangeCalendarProps extends RangeCalendarProps, DOMProps, StyleProps {}
