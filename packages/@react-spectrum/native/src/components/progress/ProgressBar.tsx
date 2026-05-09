import React, {forwardRef, useEffect, useMemo, useState} from 'react';
import {type LayoutChangeEvent, View as RNView} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import {mapAccessibilityProps} from '../../accessibility';
import {Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import type {ProgressBarProps} from './types';
import {getLabelText, getProgressColor, getProgressState, getTrackColor} from './utils';

const AnimatedView = Animated.View as React.ComponentType<
  React.ComponentProps<typeof Animated.View> & {className?: string}
>;

const barHeights = {
  S: 'h-100',
  M: 'h-150',
  L: 'h-200'
};

export const ProgressBar = forwardRef<React.ElementRef<typeof RNView>, ProgressBarProps>(
  function ProgressBar(rawProps, ref) {
    let props = useProviderProps(rawProps);
    let provider = useProvider();
    let {
      accessibilityHint,
      accessibilityLabel,
      'aria-label': ariaLabel,
      className,
      isDisabled,
      isIndeterminate,
      label,
      maxValue,
      minValue,
      showValueLabel,
      size = 'M',
      staticColor = 'none',
      style,
      value,
      valueLabel,
      ...otherProps
    } = props;
    let [trackWidth, setTrackWidth] = useState(0);
    let translate = useSharedValue(0);
    let progress = getProgressState({
      isIndeterminate,
      locale: provider.locale,
      maxValue,
      minValue,
      value,
      valueLabel
    });
    let labelText = getLabelText(label);
    let resolvedAccessibilityLabel = accessibilityLabel ?? ariaLabel ?? labelText;
    let fillColor = getProgressColor(provider.theme, staticColor);
    let trackColor = getTrackColor(provider.theme, staticColor);
    let shouldShowValue = showValueLabel ?? (!!label && !isIndeterminate);
    let segmentWidth = useMemo(() => Math.max(trackWidth * 0.4, 48), [trackWidth]);

    useEffect(() => {
      if (!isIndeterminate || trackWidth <= 0) {
        translate.value = 0;
        return;
      }

      translate.value = withRepeat(
        withTiming(1, {
          duration: provider.theme.motion.slow * 4,
          easing: Easing.inOut(Easing.cubic)
        }),
        -1,
        false
      );
    }, [isIndeterminate, provider.theme.motion.slow, trackWidth, translate]);

    let indeterminateStyle = useAnimatedStyle(() => ({
      backgroundColor: fillColor,
      transform: [{translateX: -segmentWidth + translate.value * (trackWidth + segmentWidth)}],
      width: segmentWidth
    }));

    let onTrackLayout = (event: LayoutChangeEvent) => {
      setTrackWidth(event.nativeEvent.layout.width);
    };

    return (
      <View
        {...otherProps}
        {...mapAccessibilityProps({
          accessibilityHint,
          accessibilityLabel: resolvedAccessibilityLabel,
          'aria-label': ariaLabel,
          isDisabled
        })}
        accessibilityRole="progressbar"
        accessibilityValue={progress.accessibilityValue}
        className={cn('w-full gap-150', isDisabled && 'opacity-disabled', className)}
        ref={ref}
        style={style}>
        {(label || (shouldShowValue && progress.valueText)) && (
          <View className="flex-row items-center justify-between gap-300">
            {typeof label === 'string' || typeof label === 'number' ? (
              <Text className="text-200 font-medium text-text">{label}</Text>
            ) : (
              label
            )}
            {shouldShowValue && progress.valueText && (
              <Text className="text-200 text-textMuted">{progress.valueText}</Text>
            )}
          </View>
        )}
        <View
          className={cn('w-full overflow-hidden rounded-full', barHeights[size])}
          onLayout={onTrackLayout}
          style={{backgroundColor: trackColor}}>
          {isIndeterminate ? (
            <AnimatedView className="h-full rounded-full" style={indeterminateStyle} />
          ) : (
            <View
              className="h-full rounded-full"
              style={{backgroundColor: fillColor, width: `${progress.percentage}%`}}
            />
          )}
        </View>
      </View>
    );
  }
);
