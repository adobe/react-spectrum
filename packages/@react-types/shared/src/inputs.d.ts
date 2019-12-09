import {FocusableProps} from './events';

export type ValidationState = 'valid' | 'invalid';
export interface InputBase extends FocusableProps {
  isDisabled?: boolean,
  isRequired?: boolean,
  validationState?: ValidationState,
  isReadOnly?: boolean
}

export interface ValueBase<T> {
  value?: T,
  defaultValue?: T,
  onChange?: (value: T, e?: React.ChangeEvent<HTMLInputElement>) => void,
}

export interface TextInputBase {
  placeholder?: string
}

export interface RangeValue<T> {
  start: T,
  end: T
}

export interface RangeInputBase<T> {
  minValue?: T,
  maxValue?: T,
  step?: T // ??
}
