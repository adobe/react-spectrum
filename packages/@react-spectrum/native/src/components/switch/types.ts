import type {ReactNode} from 'react';
import type {GestureResponderEvent, PressableProps, StyleProp, ViewStyle} from 'react-native';
import type {SpectrumAccessibilityProps} from '../../accessibility';
import type {NativeStyleProps} from '../../styles/styleProps';

export interface SwitchProps
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
  defaultSelected?: boolean;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  onPress?: (event: GestureResponderEvent) => void;
  onPressChange?: (isPressed: boolean) => void;
  style?: StyleProp<ViewStyle>;
}
