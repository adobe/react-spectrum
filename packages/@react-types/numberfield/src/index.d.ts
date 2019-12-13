import {DOMProps, InputBase, RangeInputBase, StyleProps, TextInputBase, ValueBase} from '@react-types/shared';

export interface NumberFieldProps extends InputBase, TextInputBase, ValueBase<number>, RangeInputBase<number> {
  decrementAriaLabel?: string,
  incrementAriaLabel?: string,
  formatOptions?: Intl.NumberFormatOptions
}

export interface SpectrumNumberFieldProps extends NumberFieldProps, DOMProps, StyleProps {
  isQuiet?: boolean,
  showStepper?: boolean
}
