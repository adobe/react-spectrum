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
   * Whether the input should display its "valid" or "invalid" visual styling. 
   * @default "valid"
   */
  validationState?: ValidationState,
  /** Whether the input can be selected but not changed by the user. */
  isReadOnly?: boolean
}

export interface ValueBase<T> {
  /** The current value (controlled). */
  value?: T,
  /** The default value (uncontrolled). */
  defaultValue?: T,
  /** Handler that is called when the value changes. */
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
