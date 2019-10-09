import {DOMProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface ProgressBaseProps extends DOMProps {
  'aria-label'?: string, // if no children, aria-label is required
  value?: number,
  isIndeterminate?: boolean
}

export interface ProgressCircleProps extends ProgressBaseProps {
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean
}

export interface ProgressBarProps extends ProgressBaseProps {
  size?: 'S' | 'L',
  children?: ReactNode, // pass in children to render label
  labelPosition?: 'top' | 'side',
  showValueLabel?: boolean, // true by default if label, false by default if not
  formatOptions?: Intl.NumberFormatOptions, // defaults to formatting as a percentage.
  valueLabel?: ReactNode, // custom value label (e.g. 1 of 4)
  variant?: 'positive' | 'warning' | 'critical' | 'overBackground',
  min?: number,
  max?: number
}
