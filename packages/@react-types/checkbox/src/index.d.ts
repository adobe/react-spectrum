import {InputBase} from '@react-types/shared';
import {ReactNode} from 'react';

export interface CheckboxBase extends InputBase {
  children?: ReactNode, // pass in children to render label

  defaultSelected?: boolean,
  isSelected?: boolean,
  onChange?: (isSelected: boolean) => void,
  value?: string, // dom prop for input element
  name?: string
}

export interface CheckboxProps extends CheckboxBase {
  isIndeterminate?: boolean // spectrum?
}
