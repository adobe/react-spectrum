import React, {forwardRef} from 'react';
import {Pressable as RNPressable} from 'react-native';
import {mapAccessibilityProps} from '../../accessibility';
import {Pressable} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {ButtonTextClassProvider} from './ButtonText';
import {renderButtonChildren} from './renderButtonChildren';
import {actionButtonTextVariants, actionButtonVariants} from './styles';
import {useNativePress} from './useNativePress';
import {getNativeButtonAccessibilityProps} from './accessibility';
import type {ActionButtonProps} from './types';

export const ActionButton = forwardRef<React.ElementRef<typeof RNPressable>, ActionButtonProps>(
  function ActionButton(rawProps, ref) {
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
      isDisabled,
      isInvalid,
      isQuiet,
      isReadOnly,
      isRequired,
      isSelected,
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
    let resolvedStaticColor: ActionButtonProps['staticColor'] = staticColor ?? 'none';
    let {pressProps} = useNativePress({
      isDisabled: resolvedDisabled,
      onPress,
      onPressChange,
      onPressEnd,
      onPressStart,
      onPressUp
    });
    let textClassName = actionButtonTextVariants({staticColor: resolvedStaticColor});

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
            isDisabled: resolvedDisabled
          })}
          accessibilityRole="button"
          accessibilityState={{
            ...otherProps.accessibilityState,
            disabled: resolvedDisabled || undefined
          }}
          className={cn(
            actionButtonVariants({
              isDisabled: resolvedDisabled,
              isQuiet: !!isQuiet,
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
