import React, {forwardRef} from 'react';
import {Pressable as RNPressable} from 'react-native';
import {useToggleState} from 'react-stately/useToggleState';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {mapAccessibilityProps} from '../../accessibility';
import {cn} from '../../styles/cn';
import {useNativePress} from '../button/useNativePress';
import {
  switchErrorTextVariants,
  switchHelpTextVariants,
  switchLabelVariants,
  switchRootVariants,
  switchThumbVariants,
  switchTrackVariants
} from './styles';
import type {SwitchProps} from './types';

export const Switch = forwardRef<React.ElementRef<typeof RNPressable>, SwitchProps>(
  function Switch(rawProps, ref) {
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
      isInvalid,
      isReadOnly,
      isRequired,
      isSelected,
      onChange,
      onPress,
      onPressChange,
      ...otherProps
    } = props;
    let provider = useProvider();
    let state = useToggleState({defaultSelected, isReadOnly, isSelected, onChange});
    let resolvedDisabled = !!(isDisabled || provider.isDisabled);
    let resolvedReadOnly = !!(isReadOnly || provider.isReadOnly);
    let resolvedInvalid = !!isInvalid;
    let {pressProps} = useNativePress({
      isDisabled: resolvedDisabled || resolvedReadOnly,
      onPress(event) {
        state.toggle();
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
          isRequired,
          isSelected: state.isSelected
        })}
        accessibilityRole="switch"
        accessibilityState={{
          ...otherProps.accessibilityState,
          checked: state.isSelected,
          disabled: resolvedDisabled || undefined
        }}
        className={cn(switchRootVariants({isDisabled: resolvedDisabled}), className)}
        isDisabled={resolvedDisabled}
        ref={ref}>
        <View
          className={switchTrackVariants({
            isInvalid: resolvedInvalid,
            isSelected: state.isSelected
          })}>
          <View className={switchThumbVariants()} />
        </View>
        {children != null && (
          <View className="min-w-0 flex-1 gap-50">
            <Text className={switchLabelVariants({isDisabled: resolvedDisabled})}>{children}</Text>
            {description != null && <Text className={switchHelpTextVariants()}>{description}</Text>}
            {resolvedInvalid && errorMessage != null && (
              <Text className={switchErrorTextVariants()}>{errorMessage}</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);
