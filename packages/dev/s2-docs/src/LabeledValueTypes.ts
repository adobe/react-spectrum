import {
  DateTime,
  LabeledValueBaseProps,
  LabeledValueStyleProps
} from '../../../@react-spectrum/s2/src/LabeledValue';
import {RangeValue} from '@react-types/shared';
import {ReactElement} from 'react';

// The doc generator cannot handle the generic conditional types, so this is a flattened version.
export interface LabeledValueProps extends LabeledValueBaseProps, LabeledValueStyleProps {
  /** The value to display. */
  value:
    | string
    | string[]
    | number
    | RangeValue<number>
    | DateTime
    | RangeValue<DateTime>
    | ReactElement;
  /**
   * Formatting options for the value. The available options depend on the type passed to the
   * `value` prop.
   */
  formatOptions?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | Intl.ListFormatOptions;
}

export interface LabeledValueNumberProps extends LabeledValueBaseProps, LabeledValueStyleProps {
  /** The value to display. */
  value: number | RangeValue<number>;
  /**
   * Formatting options for the value. The available options depend on the type passed to the
   * `value` prop.
   */
  formatOptions?: Intl.NumberFormatOptions;
}
export interface LabeledValueDateTimeProps extends LabeledValueBaseProps, LabeledValueStyleProps {
  /** The value to display. */
  value: DateTime | RangeValue<DateTime>;
  /**
   * Formatting options for the value. The available options depend on the type passed to the
   * `value` prop.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
}
export interface LabeledValueListProps extends LabeledValueBaseProps, LabeledValueStyleProps {
  /** The value to display. */
  value: string[];
  /**
   * Formatting options for the value. The available options depend on the type passed to the
   * `value` prop.
   */
  formatOptions?: Intl.ListFormatOptions;
}
