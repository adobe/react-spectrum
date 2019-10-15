export type ValidationState = 'valid' | 'invalid';
export interface InputBase {
  isDisabled?: boolean,
  isRequired?: boolean,
  validationState?: ValidationState,
  isReadOnly?: boolean,
  autoFocus?: boolean
}

export interface ValueBase<T> {
  value?: T,
  defaultValue?: T,
  onChange?: (value: T, e?: Event) => void,
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
