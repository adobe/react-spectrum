import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {mapAccessibilityProps} from '../../accessibility';
import {Text, View} from '../../primitives';
import {useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {fieldContainerVariants, fieldHelpTextVariants, fieldLabelVariants} from './styles';
import type {FieldProps} from './types';

function getLabelContent(
  label: FieldProps['label'],
  isRequired: boolean,
  necessityIndicator: FieldProps['necessityIndicator']
) {
  if (label == null) {
    return null;
  }

  if (!isRequired) {
    return label;
  }

  return (
    <>
      {label}{' '}
      <Text
        className={
          necessityIndicator === 'label' ? 'text-100 font-regular text-textMuted' : 'text-negative'
        }>
        {necessityIndicator === 'label' ? '(required)' : '*'}
      </Text>
    </>
  );
}

export const Field = forwardRef<React.ElementRef<typeof RNView>, FieldProps>(
  function Field(rawProps, ref) {
    let props = useProviderProps(rawProps);
    let {
      accessibilityHint,
      accessibilityLabel,
      'aria-describedby': ariaDescribedby,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      children,
      className,
      description,
      errorMessage,
      isDisabled,
      isInvalid,
      isReadOnly,
      isRequired,
      isSelected,
      label,
      necessityIndicator = 'icon',
      style,
      validationState,
      ...otherProps
    } = props;
    let resolvedInvalid = !!(isInvalid || validationState === 'invalid');
    let helpText = resolvedInvalid ? errorMessage : description;
    let labelContent = getLabelContent(label, !!isRequired, necessityIndicator);

    return (
      <View
        {...otherProps}
        {...mapAccessibilityProps({
          accessibilityHint,
          accessibilityLabel: accessibilityLabel ?? ariaLabel,
          'aria-describedby': ariaDescribedby,
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledby,
          isDisabled,
          isInvalid: resolvedInvalid,
          isReadOnly,
          isRequired
        })}
        className={cn(fieldContainerVariants({isDisabled: !!isDisabled}), className)}
        ref={ref}
        style={style}>
        {labelContent != null && (
          <Text className={fieldLabelVariants({isInvalid: resolvedInvalid})}>{labelContent}</Text>
        )}
        {children}
        {helpText != null && (
          <Text
            accessibilityLiveRegion={resolvedInvalid ? 'polite' : undefined}
            className={fieldHelpTextVariants({isInvalid: resolvedInvalid})}>
            {helpText}
          </Text>
        )}
      </View>
    );
  }
);
