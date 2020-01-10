import {DOMProps, LabelPosition, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

interface ProgressBaseProps {
  value?: number,
  minValue?: number,
  maxValue?: number
}

export interface ProgressBarBaseProps extends ProgressBaseProps {
  label?: ReactNode,
  showValueLabel?: boolean, // true by default if label, false by default if not
  formatOptions?: Intl.NumberFormatOptions, // defaults to formatting as a percentage.
  valueLabel?: ReactNode // custom value label (e.g. 1 of 4)
}

export interface ProgressBarProps extends ProgressBarBaseProps {
  isIndeterminate?: boolean
}

export interface ProgressCircleProps extends ProgressBaseProps {
  isIndeterminate?: boolean
}

export interface SpectrumProgressCircleProps extends ProgressCircleProps, DOMProps, StyleProps {
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean
}

export interface SpectrumProgressBarBaseProps extends ProgressBarBaseProps, DOMProps, StyleProps {
  size?: 'S' | 'L',
  labelPosition?: LabelPosition
}

export interface SpectrumProgressBarProps extends SpectrumProgressBarBaseProps, ProgressBarProps {
  variant?: 'overBackground'
}
