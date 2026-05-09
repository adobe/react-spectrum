import {View as RNView} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import type {ProgressCircleProps} from './types';
import {cn} from '../../styles/cn';
import {getLabelText, getProgressColor, getProgressState, getTrackColor} from './utils';
import {mapAccessibilityProps} from '../../accessibility';
import React, {forwardRef, useEffect} from 'react';
import Svg, {Circle} from 'react-native-svg';
import {Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';

const AnimatedView = Animated.View as React.ComponentType<
  React.ComponentProps<typeof Animated.View> & {className?: string}
>;

const circleSizes = {
  S: {size: 24, strokeWidth: 3},
  M: {size: 32, strokeWidth: 4},
  L: {size: 48, strokeWidth: 5}
};

export const ProgressCircle = forwardRef<React.ElementRef<typeof RNView>, ProgressCircleProps>(
  function ProgressCircle(rawProps, ref) {
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
    let rotation = useSharedValue(0);
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
    let shouldShowValue = showValueLabel ?? (!!label && !isIndeterminate);
    let color = getProgressColor(provider.theme, staticColor);
    let trackColor = getTrackColor(provider.theme, staticColor);
    let metrics = circleSizes[size];
    let radius = (metrics.size - metrics.strokeWidth) / 2;
    let circumference = 2 * Math.PI * radius;
    let dashOffset = isIndeterminate
      ? circumference * 0.32
      : circumference - (progress.percentage / 100) * circumference;

    useEffect(() => {
      if (!isIndeterminate) {
        rotation.value = 0;
        return;
      }

      rotation.value = withRepeat(
        withTiming(1, {
          duration: provider.theme.motion.slow * 4,
          easing: Easing.linear
        }),
        -1,
        false
      );
    }, [isIndeterminate, provider.theme.motion.slow, rotation]);

    let animatedCircleStyle = useAnimatedStyle(() => ({
      transform: [{rotate: `${rotation.value * 360}deg`}]
    }));

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
        className={cn(
          'self-start flex-row items-center gap-200',
          isDisabled && 'opacity-disabled',
          className
        )}
        ref={ref}
        style={style}>
        <AnimatedView
          style={[
            {
              height: metrics.size,
              width: metrics.size
            },
            animatedCircleStyle
          ]}>
          <Svg
            height={metrics.size}
            viewBox={`0 0 ${metrics.size} ${metrics.size}`}
            width={metrics.size}>
            <Circle
              cx={metrics.size / 2}
              cy={metrics.size / 2}
              fill="none"
              r={radius}
              stroke={trackColor}
              strokeWidth={metrics.strokeWidth}
            />
            <Circle
              cx={metrics.size / 2}
              cy={metrics.size / 2}
              fill="none"
              r={radius}
              stroke={color}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth={metrics.strokeWidth}
              transform={`rotate(-90 ${metrics.size / 2} ${metrics.size / 2})`}
            />
          </Svg>
        </AnimatedView>
        {(label || (shouldShowValue && progress.valueText)) && (
          <View className="gap-50">
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
      </View>
    );
  }
);
