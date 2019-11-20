import {DOMProps} from '@react-types/shared';
import {ReactNode} from 'react';
import {StyleProps} from '@react-spectrum/view';
import {TextFieldProps} from '@react-types/textfield';

export interface SpectrumTextFieldProps extends TextFieldProps, DOMProps, StyleProps {
  icon?: ReactNode,
  isQuiet?: boolean,
  multiLine?: boolean
}
