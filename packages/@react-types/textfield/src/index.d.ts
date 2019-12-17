import {FocusableRefValue, InputBase, LabelableProps, SpectrumLabelableProps, StyleProps, TextInputBase, TextInputDOMProps, ValueBase} from '@react-types/shared';
import {ReactElement} from 'react';

export interface TextFieldProps extends InputBase, TextInputBase, ValueBase<string>, LabelableProps {}

export interface SpectrumTextFieldProps extends TextFieldProps, SpectrumLabelableProps, TextInputDOMProps, StyleProps {
  icon?: ReactElement,
  isQuiet?: boolean
}

export interface TextFieldRef extends FocusableRefValue<HTMLInputElement & HTMLTextAreaElement, HTMLDivElement> {
  select(): void,
  getInputElement(): HTMLInputElement & HTMLTextAreaElement
}
