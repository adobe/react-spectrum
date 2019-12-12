import {DOMProps, FocusableProps, InputBase, StyleProps, ValueBase} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export type LabelPosition = 'side' | 'bottom';

export interface RadioGroupProps extends ValueBase<string>, InputBase {
  children: ReactElement<RadioProps> | ReactElement<RadioProps>[],
  name?: string // HTML form name. Not displayed.
}

export interface RadioProps extends FocusableProps {
  value: string, // HTML form value. Not displayed.
  children?: ReactNode, // pass in children to render label
  isDisabled?: boolean
}

export interface SpectrumRadioGroupProps extends RadioGroupProps, DOMProps, StyleProps {
  orientation?: 'horizontal' | 'vertical',
  labelPosition?: LabelPosition,
  isEmphasized?: boolean
}

export interface SpectrumRadioProps extends RadioProps, DOMProps, StyleProps {}
