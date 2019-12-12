import {DOMProps, InputBase, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface CheckboxBase extends InputBase {
  children?: ReactNode, // pass in children to render label

  defaultSelected?: boolean,
  isSelected?: boolean,
  onChange?: (isSelected: boolean) => void,

  /* Cannot use InputProps because value is a
  valid dom prop for input as well as checked */
  value?: string, // dom prop for input element
  name?: string
}

export interface CheckboxProps extends CheckboxBase {
  isIndeterminate?: boolean
}

export interface SpectrumCheckboxProps extends CheckboxProps, DOMProps, StyleProps {
  isEmphasized?: boolean
}
