import {AllHTMLAttributes, ReactElement, ReactNode} from 'react';
import {DOMProps, InputBase, ValueBase} from '@react-types/shared';

export type LabelPosition = 'side' | 'bottom'

export interface RadioGroupProps extends ValueBase<string>, InputBase, DOMProps {
  orientation?: 'horizontal' | 'vertical',
  labelPosition?: LabelPosition,
  children: ReactElement<RadioProps> | ReactElement<RadioProps>[],
  className?: string,
  name?: string, // HTML form name. Not displayed.
  isEmphasized?: boolean,
  label?: string,
}

export interface RadioProps extends AllHTMLAttributes<HTMLElement> {
  value: string, // HTML form value. Not displayed.
  children?: ReactNode, // pass in children to render label
  'aria-label'?: string, // if no children, aria-label is required
  isDisabled?: boolean
}
