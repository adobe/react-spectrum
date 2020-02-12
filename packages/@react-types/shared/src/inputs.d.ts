import {FocusableProps} from './events';

export type ValidationState = 'valid' | 'invalid';
export interface InputBase extends FocusableProps {
  /** Whether the input is disabled. */
  isDisabled?: boolean,
  /** 
   * Whether user input is required on the input before form submission. 
   * Often paired with the `necessityIndicator` prop to add a visual indicator to the input.
   */
  isRequired?: boolean,
  /** 
   * Whether the input should display its "invalid" visual styling. 
   * @default "valid"
   */
  validationState?: ValidationState,
  /** Whether the input can be selected but not changed by the user */
  isReadOnly?: boolean
}

export interface ValueBase<T> {
  /** The value of a input, sets input behavior to "controlled". */
  value?: T,
  /** The value of a input, sets input behavior to "uncontrolled". */
  defaultValue?: T,
  /** 
   * A user defined callback function triggered upon any change to the input's value.
   * Passes the new value as an input to the callback.
   */
  onChange?: (value: T) => void,
}

export interface TextInputBase {
  /** Temporary text that occupies the text input when it is empty. */
  placeholder?: string
}

export interface RangeValue<T> {
  /** The start value of the range. */
  start: T,
  /** The end value of the range. */
  end: T
}

export interface RangeInputBase<T> {
  /** The smallest value allowed for the input. */
  minValue?: T,
  /** The largest value allowed for the input. */
  maxValue?: T,
  /** The amount that the input value changes with each increment or decrement "tick". */
  step?: T // ??
}
