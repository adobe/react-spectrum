import {DOMProps, InputBase, TextInputBase, ValueBase} from '@react-types/shared';

export interface TextFieldProps extends DOMProps, InputBase, TextInputBase, ValueBase<string | number | string[]> {}

export interface TextFieldState {
  value: string,
  setValue: (val: string, ...args: any) => void
}
