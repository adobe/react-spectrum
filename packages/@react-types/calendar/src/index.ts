import {DOMProps, RangeValue, ValueBase} from '@react-types/shared';

export type DateValue = string | number | Date;
export interface CalendarPropsBase extends DOMProps {
  minValue?: DateValue,
  maxValue?: DateValue,
  isDisabled?: boolean,
  isReadOnly?: boolean,
  autoFocus?: boolean
}

export interface CalendarProps extends CalendarPropsBase, ValueBase<DateValue> {}
export interface RangeCalendarProps extends CalendarPropsBase, ValueBase<RangeValue<DateValue>> {}
