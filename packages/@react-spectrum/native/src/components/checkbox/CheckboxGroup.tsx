import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {useCheckboxGroupState} from 'react-stately/useCheckboxGroupState';
import {Text, View} from '../../primitives';
import {useProviderProps} from '../../provider';
import {mapAccessibilityProps} from '../../accessibility';
import {cn} from '../../styles/cn';
import {CheckboxGroupContext} from './context';
import {
  errorTextVariants,
  groupItemsVariants,
  groupLabelVariants,
  groupRootVariants,
  helpTextVariants
} from './styles';
import type {CheckboxGroupProps} from './types';

export const CheckboxGroup = forwardRef<React.ElementRef<typeof RNView>, CheckboxGroupProps>(
  function CheckboxGroup(rawProps, ref) {
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
    let state = useCheckboxGroupState({
      defaultValue,
      isDisabled,
      isInvalid,
      isReadOnly,
      isRequired,
      name,
      onChange,
      value,
      validationState: isInvalid ? 'invalid' : undefined
    });
    let resolvedInvalid = !!(isInvalid || state.isInvalid);

    return (
      <CheckboxGroupContext.Provider
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
          accessibilityState={{
            ...otherProps.accessibilityState,
            disabled: isDisabled || undefined
          }}
          className={cn(groupRootVariants({isDisabled: !!isDisabled}), className)}
          ref={ref}>
          {label != null && <Text className={groupLabelVariants()}>{label}</Text>}
          <View className={groupItemsVariants({orientation})}>{children}</View>
          {description != null && <Text className={helpTextVariants()}>{description}</Text>}
          {resolvedInvalid && errorMessage != null && (
            <Text className={errorTextVariants()}>{errorMessage}</Text>
          )}
        </View>
      </CheckboxGroupContext.Provider>
    );
  }
);
