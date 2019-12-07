import {ReactNode} from 'react';

interface ProgressBaseProps {
  value?: number,
  minValue?: number,
  maxValue?: number
}

export interface ProgressBarBaseProps extends ProgressBaseProps {
  children?: ReactNode, // pass in children to render label
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
