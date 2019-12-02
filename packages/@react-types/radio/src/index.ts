import {InputBase, ValueBase} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export type LabelPosition = 'side' | 'bottom'

export interface RadioGroupProps extends ValueBase<string>, InputBase {
  orientation?: 'horizontal' | 'vertical',
  labelPosition?: LabelPosition,
  children: ReactElement<RadioProps> | ReactElement<RadioProps>[],
  name?: string, // HTML form name. Not displayed.
  isEmphasized?: boolean,
  label?: string,
}

export interface RadioProps {
  value: string, // HTML form value. Not displayed.
  children?: ReactNode, // pass in children to render label
  isDisabled?: boolean
}
