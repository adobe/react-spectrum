import {AccessibilityInfo} from 'react-native';

export interface SpectrumAccessibilityProps {
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isSelected?: boolean;
}

export function mapAccessibilityProps(props: SpectrumAccessibilityProps) {
  return {
    accessibilityHint: props.accessibilityHint,
    accessibilityLabel: props.accessibilityLabel ?? props['aria-label'],
    accessibilityState: mapAccessibilityState(props)
  };
}

export function mapAccessibilityState(props: SpectrumAccessibilityProps) {
  return {
    disabled: props.isDisabled || undefined,
    invalid: props.isInvalid || undefined,
    selected: props.isSelected || undefined
  };
}

export function announceForAccessibility(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}
