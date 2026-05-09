import React, {forwardRef} from 'react';
import {Pressable as RNPressable} from 'react-native';
import {useToggleState} from 'react-stately/useToggleState';
import {mapAccessibilityProps} from '../../accessibility';
import {Pressable} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {ButtonTextClassProvider} from './ButtonText';
import {renderButtonChildren} from './renderButtonChildren';
import {actionButtonTextVariants, actionButtonVariants} from './styles';
import {useNativePress} from './useNativePress';
import {getNativeButtonAccessibilityProps} from './accessibility';
import type {ToggleButtonProps} from './types';

export const ToggleButton = forwardRef<React.ElementRef<typeof RNPressable>, ToggleButtonProps>(
  function ToggleButton(rawProps, ref) {
    let props = useProviderProps(rawProps);
    let {
      accessibilityHint,
      accessibilityLabel,
      'aria-describedby': ariaDescribedby,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      autoFocus,
      children,
      className,
      defaultSelected,
      isDisabled,
      isEmphasized,
      isInvalid,
      isQuiet,
      isReadOnly,
      isRequired,
      isSelected,
      onChange,
      onPress,
      onPressChange,
      onPressEnd,
      onPressStart,
      onPressUp,
      staticColor,
      ...otherProps
    } = props;
    let provider = useProvider();
    let resolvedDisabled = !!(isDisabled || provider.isDisabled);
    let state = useToggleState({defaultSelected, isReadOnly, isSelected, onChange});
    let resolvedStaticColor: ToggleButtonProps['staticColor'] = staticColor ?? 'none';
    let {pressProps} = useNativePress({
      isDisabled: resolvedDisabled || isReadOnly,
      onPress(event) {
        state.toggle();
        onPress?.(event);
      },
      onPressChange,
      onPressEnd,
      onPressStart,
      onPressUp
    });
    let textClassName = actionButtonTextVariants({
      isSelected: state.isSelected,
      staticColor: resolvedStaticColor
    });

    return (
      <ButtonTextClassProvider className={textClassName}>
        <Pressable
          {...otherProps}
          {...pressProps}
          {...mapAccessibilityProps({
            ...getNativeButtonAccessibilityProps({
              ...props,
              accessibilityHint,
              accessibilityLabel,
              'aria-describedby': ariaDescribedby,
              'aria-label': ariaLabel,
              'aria-labelledby': ariaLabelledby
            }),
            isDisabled: resolvedDisabled,
            isSelected: state.isSelected
          })}
          accessibilityRole="button"
          accessibilityState={{
            ...otherProps.accessibilityState,
            disabled: resolvedDisabled || undefined,
            selected: state.isSelected || undefined
          }}
          className={cn(
            actionButtonVariants({
              isDisabled: resolvedDisabled,
              isEmphasized: !!isEmphasized,
              isQuiet: !!isQuiet,
              isSelected: state.isSelected,
              staticColor: resolvedStaticColor
            }),
            className
          )}
          isDisabled={resolvedDisabled}
          ref={ref}>
          {renderButtonChildren({children, textClassName})}
        </Pressable>
      </ButtonTextClassProvider>
    );
  }
);
