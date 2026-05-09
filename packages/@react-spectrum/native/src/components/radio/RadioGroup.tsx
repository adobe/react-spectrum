import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {useRadioGroupState} from 'react-stately/useRadioGroupState';
import {Text, View} from '../../primitives';
import {useProviderProps} from '../../provider';
import {mapAccessibilityProps} from '../../accessibility';
import {cn} from '../../styles/cn';
import {RadioGroupContext} from './context';
import {
  radioErrorTextVariants,
  radioGroupItemsVariants,
  radioGroupLabelVariants,
  radioGroupRootVariants,
  radioHelpTextVariants
} from './styles';
import type {RadioGroupProps} from './types';

export const RadioGroup = forwardRef<React.ElementRef<typeof RNView>, RadioGroupProps>(
  function RadioGroup(rawProps, ref) {
    let props = useProviderProps(rawProps);
    let {
      accessibilityHint,
      accessibilityLabel,
      'aria-describedby': ariaDescribedby,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      children,
      className,
      defaultValue,
      description,
      errorMessage,
      isDisabled,
      isInvalid,
      isReadOnly,
      isRequired,
      label,
      name,
      onChange,
      orientation = 'vertical',
      value,
      ...otherProps
    } = props;
    let state = useRadioGroupState({
      defaultValue,
      isDisabled,
      isInvalid,
      isReadOnly,
      isRequired,
      name,
      onChange,
      orientation,
      value,
      validationState: isInvalid ? 'invalid' : undefined
    });
    let resolvedInvalid = !!(isInvalid || state.isInvalid);

    return (
      <RadioGroupContext.Provider
        value={{
          isDisabled,
          isInvalid: resolvedInvalid,
          isReadOnly,
          isRequired,
          name,
          state
        }}>
        <View
          {...otherProps}
          {...mapAccessibilityProps({
            accessibilityHint,
            accessibilityLabel,
            'aria-describedby': ariaDescribedby,
            'aria-label': ariaLabel,
            'aria-labelledby': ariaLabelledby,
            isDisabled,
            isInvalid: resolvedInvalid,
            isReadOnly,
            isRequired
          })}
          accessibilityRole="radiogroup"
          accessibilityState={{
            ...otherProps.accessibilityState,
            disabled: isDisabled || undefined
          }}
          className={cn(radioGroupRootVariants({isDisabled: !!isDisabled}), className)}
          ref={ref}>
          {label != null && <Text className={radioGroupLabelVariants()}>{label}</Text>}
          <View className={radioGroupItemsVariants({orientation})}>{children}</View>
          {description != null && <Text className={radioHelpTextVariants()}>{description}</Text>}
          {resolvedInvalid && errorMessage != null && (
            <Text className={radioErrorTextVariants()}>{errorMessage}</Text>
          )}
        </View>
      </RadioGroupContext.Provider>
    );
  }
);
