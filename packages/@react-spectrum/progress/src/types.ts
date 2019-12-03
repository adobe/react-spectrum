import {ProgressBarProps} from '@react-types/progress';
import {ReactNode} from 'react';

export interface SpectrumProgressCircleProps extends ProgressBarProps {
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean
}

export interface SpectrumProgressBarProps extends ProgressBarProps {
  size?: 'S' | 'L',
  labelPosition?: 'top' | 'side',
  showValueLabel?: boolean, // true by default if label, false by default if not
  formatOptions?: Intl.NumberFormatOptions, // defaults to formatting as a percentage.
  valueLabel?: ReactNode, // custom value label (e.g. 1 of 4)
  variant?: 'positive' | 'warning' | 'critical' | 'overBackground'
}
