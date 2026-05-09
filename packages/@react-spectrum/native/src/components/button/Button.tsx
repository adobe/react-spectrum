import React, {forwardRef, useEffect, useMemo, useState} from 'react';
import {Pressable as RNPressable} from 'react-native';
import {Pressable} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {mapAccessibilityProps} from '../../accessibility';
import {buttonTextVariants, buttonVariants} from './styles';
import {ButtonTextClassProvider} from './ButtonText';
import {renderButtonChildren} from './renderButtonChildren';
import {useNativePress} from './useNativePress';
import {getNativeButtonAccessibilityProps} from './accessibility';
import type {ButtonProps} from './types';

const PENDING_INDICATOR_DELAY = 1000;

export const Button = forwardRef<React.ElementRef<typeof RNPressable>, ButtonProps>(
  function Button(rawProps, ref) {
    let props = useProviderProps(rawProps);
    let {
      accessibilityLabel,
      accessibilityHint,
      'aria-describedby': ariaDescribedby,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      autoFocus,
      children,
      className,
      isDisabled,
      isInvalid,
      isPending,
      isReadOnly,
      isRequired,
      isSelected,
      onPress,
      onPressChange,
      onPressEnd,
      onPressStart,
      onPressUp,
      staticColor,
      styleVariant,
      variant,
      ...otherProps
    } = props;
    let provider = useProvider();
    let resolvedStyleVariant = styleVariant ?? (variant === 'accent' ? 'fill' : 'outline');
    let resolvedStaticColor: ButtonProps['staticColor'] = staticColor ?? 'none';
    let resolvedDisabled = !!(isDisabled || provider.isDisabled || isPending);
    let [isProgressVisible, setProgressVisible] = useState(false);
    let {pressProps} = useNativePress({
      isDisabled: resolvedDisabled,
      onPress,
      onPressChange,
      onPressEnd,
      onPressStart,
      onPressUp
    });

    useEffect(() => {
      if (!isPending) {
        setProgressVisible(false);
        return;
      }

      let timeout = setTimeout(() => setProgressVisible(true), PENDING_INDICATOR_DELAY);
      return () => clearTimeout(timeout);
    }, [isPending]);

    let textClassName = buttonTextVariants({
      staticColor: resolvedStaticColor,
      styleVariant: resolvedStyleVariant,
      variant
    });
    let pendingAccessibilityLabel = useMemo(() => {
      let baseLabel = accessibilityLabel ?? ariaLabel;
      if (!isPending) {
        return baseLabel;
      }

      return [baseLabel, 'Pending'].filter(Boolean).join(' ');
    }, [accessibilityLabel, ariaLabel, isPending]);

    return (
      <ButtonTextClassProvider className={textClassName}>
        <Pressable
          {...otherProps}
          {...pressProps}
          {...mapAccessibilityProps({
            ...getNativeButtonAccessibilityProps({
              ...props,
              accessibilityLabel: pendingAccessibilityLabel,
              accessibilityHint,
              'aria-describedby': ariaDescribedby,
              'aria-label': ariaLabel,
              'aria-labelledby': ariaLabelledby
            }),
            isDisabled: resolvedDisabled
          })}
          accessibilityRole="button"
          accessibilityState={{
            ...otherProps.accessibilityState,
            busy: isPending || undefined,
            disabled: resolvedDisabled || undefined
          }}
          className={cn(
            buttonVariants({
              isDisabled: resolvedDisabled,
              isPending: !!isPending,
              staticColor: resolvedStaticColor,
              styleVariant: resolvedStyleVariant,
              variant
            }),
            className
          )}
          isDisabled={resolvedDisabled}
          ref={ref}>
          {renderButtonChildren({
            children,
            isProgressVisible,
            progressColor:
              resolvedStyleVariant === 'fill' && variant !== 'secondary'
                ? provider.theme.colors.accentText
                : provider.theme.colors.accent,
            textClassName
          })}
        </Pressable>
      </ButtonTextClassProvider>
    );
  }
);
