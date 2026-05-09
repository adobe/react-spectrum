import React, {forwardRef} from 'react';
import {Pressable as RNPressable} from 'react-native';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {mapAccessibilityProps} from '../../accessibility';
import {cn} from '../../styles/cn';
import {useNativePress} from '../button/useNativePress';
import {useRadioGroupContext} from './context';
import {
  radioErrorTextVariants,
  radioHelpTextVariants,
  radioInnerVariants,
  radioLabelVariants,
  radioOuterVariants,
  radioRootVariants
} from './styles';
import type {RadioProps} from './types';

export const Radio = forwardRef<React.ElementRef<typeof RNPressable>, RadioProps>(
  function Radio(rawProps, ref) {
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
      onPress,
      onPressChange,
      value,
      ...otherProps
    } = props;
    let provider = useProvider();
    let group = useRadioGroupContext();
    let selected = group?.state.selectedValue === value;
    let resolvedDisabled = !!(isDisabled || group?.isDisabled || provider.isDisabled);
    let resolvedReadOnly = !!(isReadOnly || group?.isReadOnly || provider.isReadOnly);
    let resolvedInvalid = !!(isInvalid || group?.isInvalid);
    let {pressProps} = useNativePress({
      isDisabled: resolvedDisabled || resolvedReadOnly || !group,
      onPress(event) {
        group?.state.setSelectedValue(value);
        onPress?.(event);
      },
      onPressChange
    });

    return (
      <Pressable
        {...otherProps}
        {...pressProps}
        {...mapAccessibilityProps({
          accessibilityHint,
          accessibilityLabel,
          'aria-describedby': ariaDescribedby,
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledby,
          isDisabled: resolvedDisabled,
          isInvalid: resolvedInvalid,
          isReadOnly: resolvedReadOnly,
          isRequired: isRequired || group?.isRequired,
          isSelected: selected
        })}
        accessibilityRole="radio"
        accessibilityState={{
          ...otherProps.accessibilityState,
          checked: selected,
          disabled: resolvedDisabled || undefined,
          selected: selected || undefined
        }}
        className={cn(radioRootVariants({isDisabled: resolvedDisabled}), className)}
        isDisabled={resolvedDisabled}
        ref={ref}>
        <View className={radioOuterVariants({isInvalid: resolvedInvalid, isSelected: selected})}>
          <View
            className={radioInnerVariants({isInvalid: resolvedInvalid, isSelected: selected})}
          />
        </View>
        {children != null && (
          <View className="min-w-0 flex-1 gap-50">
            <Text className={radioLabelVariants({isDisabled: resolvedDisabled})}>{children}</Text>
            {description != null && <Text className={radioHelpTextVariants()}>{description}</Text>}
            {resolvedInvalid && errorMessage != null && (
              <Text className={radioErrorTextVariants()}>{errorMessage}</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);
