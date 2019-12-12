import {ProgressBarBaseProps, SpectrumProgressBarBaseProps} from '@react-types/progress';

export type MeterProps = ProgressBarBaseProps;
export interface SpectrumMeterProps extends SpectrumProgressBarBaseProps {
  variant: 'positive' | 'warning' | 'critical'
}
