import type {ReactNode} from 'react';
import type {
  PressableProps as RNPressableProps,
  TextProps as RNTextProps,
  ViewProps as RNViewProps
} from 'react-native';
import type {NativeStyleProps} from '../styles/styleProps';

export interface ClassNameProp {
  className?: string;
}

export interface SpectrumViewProps extends RNViewProps, ClassNameProp, NativeStyleProps {
  children?: ReactNode;
}

export interface SpectrumTextProps extends RNTextProps, ClassNameProp {
  children?: ReactNode;
}

export interface SpectrumPressableProps extends RNPressableProps, ClassNameProp, NativeStyleProps {
  children?: ReactNode;
  isDisabled?: boolean;
}
