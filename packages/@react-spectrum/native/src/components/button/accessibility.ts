import type {NativeButtonBaseProps} from './types';

export function getNativeButtonAccessibilityProps(props: NativeButtonBaseProps) {
  return {
    'aria-describedby': props['aria-describedby'],
    'aria-label': props['aria-label'],
    'aria-labelledby': props['aria-labelledby'],
    accessibilityHint: props.accessibilityHint,
    accessibilityLabel: props.accessibilityLabel,
    isDisabled: props.isDisabled,
    isInvalid: props.isInvalid,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isSelected: props.isSelected
  };
}
