import {ReactNode} from 'react';
import {TextFieldProps} from '@react-types/textfield';

export interface SpectrumTextFieldProps extends TextFieldProps {
  icon?: ReactNode,
  isQuiet?: boolean,
  validationTooltip?: ReactNode,
  multiLine?: boolean
}
