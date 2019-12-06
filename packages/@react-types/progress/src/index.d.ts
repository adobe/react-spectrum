import {ReactNode} from 'react';

export interface ProgressBarBaseProps {
  value?: number,
  children?: ReactNode, // pass in children to render label
  min?: number,
  max?: number
}

export interface ProgressBarProps extends ProgressBarBaseProps {
  isIndeterminate?: boolean
}
