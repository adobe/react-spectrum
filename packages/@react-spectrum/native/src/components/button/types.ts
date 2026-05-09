import type {ReactNode} from 'react';
import type {GestureResponderEvent, PressableProps, StyleProp, ViewStyle} from 'react-native';
import type {SpectrumAccessibilityProps} from '../../accessibility';
import type {NativeStyleProps} from '../../styles/styleProps';

export type ButtonVariant = 'accent' | 'primary' | 'secondary' | 'negative';
export type ButtonStyle = 'fill' | 'outline';
export type StaticColor = 'white' | 'black' | 'none';

export interface PressEventHandlers {
  onPress?: (event: GestureResponderEvent) => void;
  onPressStart?: (event: GestureResponderEvent) => void;
  onPressEnd?: (event: GestureResponderEvent) => void;
  onPressUp?: (event: GestureResponderEvent) => void;
  onPressChange?: (isPressed: boolean) => void;
}

export interface NativeButtonBaseProps
  extends
    Omit<
      PressableProps,
      'children' | 'disabled' | 'onPress' | 'onPressIn' | 'onPressOut' | 'style'
    >,
    PressEventHandlers,
    SpectrumAccessibilityProps,
    NativeStyleProps {
  autoFocus?: boolean;
  children?: ReactNode;
  className?: string;
  isDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ButtonProps extends NativeButtonBaseProps {
  isPending?: boolean;
  staticColor?: StaticColor;
  styleVariant?: ButtonStyle;
  variant: ButtonVariant;
}

export interface ActionButtonProps extends NativeButtonBaseProps {
  isQuiet?: boolean;
  staticColor?: StaticColor;
}

export interface ToggleButtonProps extends ActionButtonProps {
  defaultSelected?: boolean;
  isEmphasized?: boolean;
  isReadOnly?: boolean;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
}
