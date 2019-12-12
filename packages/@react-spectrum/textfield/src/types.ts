import {FocusableRefValue} from '@react-spectrum/utils';
import {ReactNode} from 'react';
import {StyleProps} from '@react-spectrum/view';
import {TextFieldProps} from '@react-types/textfield';
import {TextInputDOMProps} from '@react-types/shared';

export interface SpectrumTextFieldProps extends TextFieldProps, TextInputDOMProps, StyleProps {
  icon?: ReactNode,
  isQuiet?: boolean
}

export interface TextFieldRef extends FocusableRefValue<HTMLInputElement & HTMLTextAreaElement, HTMLDivElement> {
  select(): void,
  getInputElement(): HTMLInputElement & HTMLTextAreaElement
}
