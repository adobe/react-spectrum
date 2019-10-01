import {DOMProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface PogressBaseProps extends DOMProps {
  value?: number,
  isIndeterminate?: boolean
}

export interface ProgressCircleProps extends PogressBaseProps {
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean
}

export interface ProgressBarProps extends PogressBaseProps {
  size?: 'S' | 'L',
  children?: ReactNode, // pass in children to render label
  'aria-label'?: string, // if no children, aria-label is required
  labelPosition?: 'top' | 'side',
  showValueLabel?: boolean, // true by default if label, false by default if not
  formatOptions?: Intl.NumberFormatOptions, // defaults to formatting as a percentage.
  valueLabel?: ReactNode, // custom value label (e.g. 1 of 4)
  variant?: 'positive' | 'warning' | 'critical' | 'overBackground',
  min?: number,
  max?: number
}
