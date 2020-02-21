import {FocusableRefValue, InputBase, LabelableProps, SpectrumLabelableProps, StyleProps, TextInputBase, TextInputDOMProps, ValueBase} from '@react-types/shared';
import {ReactElement} from 'react';

export interface TextFieldProps extends InputBase, TextInputBase, ValueBase<string>, LabelableProps {}

export interface SpectrumTextFieldProps extends TextFieldProps, SpectrumLabelableProps, TextInputDOMProps, StyleProps {
  /** An icon to display at the start of the textfield. */
  icon?: ReactElement,
  /** Whether the textfield should be displayed with a quiet style. */
  isQuiet?: boolean
}

export interface TextFieldRef extends FocusableRefValue<HTMLInputElement & HTMLTextAreaElement, HTMLDivElement> {
  select(): void,
  getInputElement(): HTMLInputElement & HTMLTextAreaElement
}
