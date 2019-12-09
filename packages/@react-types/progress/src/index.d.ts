import {ReactNode} from 'react';

export interface ProgressBarBase {
  value?: number,
  children?: ReactNode, // pass in children to render label
  min?: number,
  max?: number
}

export interface ProgressBarProps extends ProgressBarBase {
  isIndeterminate?: boolean
}
