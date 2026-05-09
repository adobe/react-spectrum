import type {ReactNode} from 'react';
import type {GestureResponderEvent, PressableProps, StyleProp, ViewStyle} from 'react-native';
import type {SpectrumAccessibilityProps} from '../../accessibility';
import type {NativeStyleProps} from '../../styles/styleProps';

export type CheckboxGroupOrientation = 'horizontal' | 'vertical';

export interface NativeToggleControlProps
  extends
    Omit<
      PressableProps,
      | 'accessibilityRole'
      | 'children'
      | 'disabled'
      | 'onPress'
      | 'onPressIn'
      | 'onPressOut'
      | 'style'
    >,
    SpectrumAccessibilityProps,
    NativeStyleProps {
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  onPressChange?: (isPressed: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export interface CheckboxProps extends NativeToggleControlProps {
  defaultSelected?: boolean;
  isIndeterminate?: boolean;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  value?: string;
}

export interface CheckboxGroupProps extends Omit<
  NativeToggleControlProps,
  'onPress' | 'onPressChange'
> {
  children?: ReactNode;
  defaultValue?: string[];
  label?: ReactNode;
  name?: string;
  onChange?: (value: string[]) => void;
  orientation?: CheckboxGroupOrientation;
  value?: string[];
}
