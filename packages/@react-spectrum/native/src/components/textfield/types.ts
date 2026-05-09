import type {ReactNode} from 'react';
import type {
  NativeSyntheticEvent,
  StyleProp,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  ViewProps,
  ViewStyle
} from 'react-native';
import type {SpectrumAccessibilityProps} from '../../accessibility';
import type {NativeStyleProps} from '../../styles/styleProps';

export type NecessityIndicator = 'icon' | 'label';
export type ValidationState = 'valid' | 'invalid';

export interface FieldProps
  extends Omit<ViewProps, 'children' | 'style'>, SpectrumAccessibilityProps, NativeStyleProps {
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  label?: ReactNode;
  necessityIndicator?: NecessityIndicator;
  validationState?: ValidationState;
  style?: StyleProp<ViewStyle>;
}

export interface TextFieldBaseProps
  extends
    Omit<
      TextInputProps,
      | 'accessibilityLabel'
      | 'accessibilityState'
      | 'defaultValue'
      | 'editable'
      | 'multiline'
      | 'onChange'
      | 'onChangeText'
      | 'onBlur'
      | 'onFocus'
      | 'readOnly'
      | 'style'
      | 'value'
    >,
    Omit<FieldProps, 'children' | 'onBlur' | 'onFocus' | 'style'> {
  defaultValue?: string;
  inputClassName?: string;
  inputStyle?: StyleProp<TextStyle>;
  onBlur?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onChange?: (value: string) => void;
  onChangeText?: (value: string) => void;
  onFocus?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  style?: StyleProp<ViewStyle>;
  value?: string;
}

export interface TextFieldProps extends TextFieldBaseProps {}

export interface TextAreaProps extends TextFieldBaseProps {
  numberOfLines?: number;
}

export interface SearchFieldProps extends TextFieldBaseProps {
  onClear?: () => void;
}
