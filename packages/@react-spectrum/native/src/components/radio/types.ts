import type {ReactNode} from 'react';
import type {GestureResponderEvent, PressableProps, StyleProp, ViewStyle} from 'react-native';
import type {SpectrumAccessibilityProps} from '../../accessibility';
import type {NativeStyleProps} from '../../styles/styleProps';

export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface NativeRadioBaseProps
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

export interface RadioProps extends NativeRadioBaseProps {
  value: string;
}

export interface RadioGroupProps extends Omit<NativeRadioBaseProps, 'onPress' | 'onPressChange'> {
  children?: ReactNode;
  defaultValue?: string;
  label?: ReactNode;
  name?: string;
  onChange?: (value: string) => void;
  orientation?: RadioGroupOrientation;
  value?: string | null;
}
