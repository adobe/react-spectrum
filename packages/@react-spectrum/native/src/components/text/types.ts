import type {ReactNode} from 'react';
import type {TextProps as RNTextProps} from 'react-native';

export type TextSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface SpectrumTextProps extends Omit<RNTextProps, 'children'> {
  children?: ReactNode;
  className?: string;
  isDisabled?: boolean;
  size?: TextSize;
  variant?: 'body' | 'detail' | 'code';
}

export interface HeadingProps extends Omit<RNTextProps, 'children'> {
  children?: ReactNode;
  className?: string;
  level?: HeadingLevel;
  size?: TextSize;
}
