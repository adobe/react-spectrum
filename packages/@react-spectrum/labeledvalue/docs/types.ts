import {DateTime, LabeledValueBaseProps} from '@react-spectrum/labeledvalue/src/LabeledValue';
import {RangeValue} from '@react-types/shared';

// The doc generator is not smart enough to handle the real types for LabeledValue so this is a simpler one.
export interface LabeledValueProps extends LabeledValueBaseProps {
  /** The value to display. */
  value: string | string[] | number | RangeValue<number> | DateTime | RangeValue<DateTime>,
  /** Formatting options for the value. The available options depend on the type passed to the `value` prop. */
  formatOptions?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | Intl.ListFormatOptions
}
