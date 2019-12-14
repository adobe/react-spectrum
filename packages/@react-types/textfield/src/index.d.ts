import {FocusableRefValue, InputBase, StyleProps, TextInputBase, TextInputDOMProps, ValueBase} from '@react-types/shared';
import {ReactElement} from 'react';

export interface TextFieldProps extends InputBase, TextInputBase, ValueBase<string> {}

export interface SpectrumTextFieldProps extends TextFieldProps, TextInputDOMProps, StyleProps {
  icon?: ReactElement,
  isQuiet?: boolean
}

export interface TextFieldRef extends FocusableRefValue<HTMLInputElement & HTMLTextAreaElement, HTMLDivElement> {
  select(): void,
  getInputElement(): HTMLInputElement & HTMLTextAreaElement
}
