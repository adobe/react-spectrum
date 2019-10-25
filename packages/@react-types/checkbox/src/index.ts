import {DOMProps, InputBase} from '@react-types/shared';
import {ReactNode} from 'react';

export interface CheckboxBase extends InputBase {
  children?: ReactNode, // pass in children to render label
  className?: string,
  'aria-label'?: string, // if no children, aria-label is required

  defaultSelected?: boolean,
  isSelected?: boolean,
  onChange?: (isSelected: boolean, e: Event) => void,

  /* Cannot use InputProps because value is a
  valid dom prop for input as well as checked */
  value?: string, // dom prop for input element
  name?: string,
  isEmphasized?: boolean
}

export interface CheckboxProps extends DOMProps, CheckboxBase {
  isIndeterminate?: boolean
}
