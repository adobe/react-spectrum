import type {AccessibilityValue} from 'react-native';
import type {ReactNode} from 'react';
import type {SpectrumAccessibilityProps} from '../../accessibility';
import type {SpectrumViewProps} from '../../primitives';

export type ProgressSize = 'S' | 'M' | 'L';
export type ProgressStaticColor = 'black' | 'none' | 'white';
export type MeterVariant = 'informative' | 'positive' | 'notice' | 'negative';

export interface BaseProgressProps
  extends
    Omit<SpectrumViewProps, 'accessibilityRole' | 'accessibilityValue' | 'children'>,
    SpectrumAccessibilityProps {
  label?: ReactNode;
  maxValue?: number;
  minValue?: number;
  showValueLabel?: boolean;
  value?: number;
  valueLabel?: string;
}

export interface ProgressBarProps extends BaseProgressProps {
  isIndeterminate?: boolean;
  size?: ProgressSize;
  staticColor?: ProgressStaticColor;
}

export interface MeterProps extends BaseProgressProps {
  size?: ProgressSize;
  variant?: MeterVariant;
}

export interface ProgressCircleProps extends BaseProgressProps {
  isIndeterminate?: boolean;
  size?: ProgressSize;
  staticColor?: ProgressStaticColor;
}

export interface ProgressState {
  accessibilityValue: AccessibilityValue;
  maxValue: number;
  minValue: number;
  percentage: number;
  value: number;
  valueText: string | undefined;
}
