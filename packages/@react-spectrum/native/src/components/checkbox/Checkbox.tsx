import React, {forwardRef} from 'react';
import {Pressable as RNPressable} from 'react-native';
import {useToggleState} from 'react-stately/useToggleState';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {mapAccessibilityProps} from '../../accessibility';
import {cn} from '../../styles/cn';
import {useNativePress} from '../button/useNativePress';
import {useCheckboxGroupContext} from './context';
import {
  checkboxBoxVariants,
  checkboxCheckVariants,
  checkboxDashVariants,
  errorTextVariants,
  helpTextVariants,
  toggleLabelVariants,
  toggleRootVariants
} from './styles';
import type {CheckboxProps} from './types';

export const Checkbox = forwardRef<React.ElementRef<typeof RNPressable>, CheckboxProps>(
  function Checkbox(rawProps, ref) {
    let props = useProviderProps(rawProps);
    let {
      accessibilityHint,
      accessibilityLabel,
      'aria-describedby': ariaDescribedby,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      children,
      className,
      defaultSelected,
      description,
      errorMessage,
      isDisabled,
      isIndeterminate,
      isInvalid,
      isReadOnly,
      isRequired,
      isSelected,
      onChange,
      onPress,
      onPressChange,
      value = 'on',
      ...otherProps
    } = props;
    let provider = useProvider();
    let group = useCheckboxGroupContext();
    let standaloneState = useToggleState({defaultSelected, isReadOnly, isSelected, onChange});
    let resolvedDisabled = !!(isDisabled || group?.isDisabled || provider.isDisabled);
    let resolvedReadOnly = !!(isReadOnly || group?.isReadOnly || provider.isReadOnly);
    let resolvedInvalid = !!(isInvalid || group?.isInvalid);
    let selected = group ? group.state.isSelected(value) : standaloneState.isSelected;
    let checkedState: boolean | 'mixed' = isIndeterminate ? 'mixed' : !!selected;
    let {pressProps} = useNativePress({
      isDisabled: resolvedDisabled || resolvedReadOnly,
      onPress(event) {
        if (group) {
          group.state.toggleValue(value);
        } else {
          standaloneState.toggle();
        }
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
        accessibilityRole="checkbox"
        accessibilityState={{
          ...otherProps.accessibilityState,
          checked: checkedState,
          disabled: resolvedDisabled || undefined
        }}
        className={cn(toggleRootVariants({isDisabled: resolvedDisabled}), className)}
        isDisabled={resolvedDisabled}
        ref={ref}>
        <View
          className={checkboxBoxVariants({
            isInvalid: resolvedInvalid,
            isSelected: selected || !!isIndeterminate
          })}>
          {isIndeterminate ? (
            <View className={checkboxDashVariants({isVisible: true})} />
          ) : (
            <View className={checkboxCheckVariants({isVisible: selected})} />
          )}
        </View>
        {children != null && (
          <View className="min-w-0 flex-1 gap-50">
            <Text className={toggleLabelVariants({isDisabled: resolvedDisabled})}>{children}</Text>
            {description != null && <Text className={helpTextVariants()}>{description}</Text>}
            {resolvedInvalid && errorMessage != null && (
              <Text className={errorTextVariants()}>{errorMessage}</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);
