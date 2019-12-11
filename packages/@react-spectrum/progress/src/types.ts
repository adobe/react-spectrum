import {DOMProps} from '@react-types/shared';
import {ProgressBarBaseProps, ProgressBarProps, ProgressCircleProps} from '@react-types/progress';
import {StyleProps} from '@react-spectrum/view';

export interface SpectrumProgressCircleProps extends ProgressCircleProps, DOMProps, StyleProps {
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean
}

export interface SpectrumProgressBarBaseProps extends ProgressBarBaseProps, DOMProps, StyleProps {
  size?: 'S' | 'L',
  labelPosition?: 'top' | 'side'
}

export interface SpectrumProgressBarProps extends SpectrumProgressBarBaseProps, ProgressBarProps {
  variant?: 'overBackground'
}
