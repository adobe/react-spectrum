export type ValidationState = 'valid' | 'invalid';
export interface InputBase {
  isDisabled?: boolean,
  isRequired?: boolean,
  validationState?: ValidationState,
  isReadOnly?: boolean,
  autoFocus?: boolean,
  type?: string
}

export interface ValueBase<T> {
  value?: T,
  defaultValue?: T,
  onChange?: (value: T, e?: React.ChangeEvent<HTMLInputElement>) => void,
}

export interface TextInputBase {
  // DOM props that are acceptable for text <input> elements
  placeholder?: string,
  name?: string,
  pattern?: string,
  minLength?: number,
  maxLength?: number,
  autoComplete?: string
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
