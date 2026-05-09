import React, {useCallback} from 'react';
import {type LayoutChangeEvent} from 'react-native';
import {useSliderState} from 'react-stately/useSliderState';
import type {SliderProps} from 'react-stately/useSliderState';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';

export interface NativeSliderProps
  extends Omit<SliderProps<number>, 'label' | 'onChange' | 'onChangeEnd'> {
  'aria-label'?: string;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
  isDisabled?: boolean;
  label?: React.ReactNode;
  locale?: string;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  showValueLabel?: boolean;
  testID?: string;
}

export function Slider(rawProps: NativeSliderProps) {
  let props = useProviderProps(rawProps);
  let {
    'aria-label': ariaLabel,
    className,
    formatOptions,
    isDisabled,
    label,
    locale,
    onChange,
    onChangeEnd,
    showValueLabel = true,
    testID,
    ...sliderProps
  } = props;

  let provider = useProvider();
  let resolvedLocale = locale ?? provider.locale ?? 'en-US';
  let resolvedDisabled = !!(isDisabled || provider.isDisabled);

  let numberFormatter = new Intl.NumberFormat(resolvedLocale, formatOptions);

  let state = useSliderState({
    ...sliderProps,
    isDisabled: resolvedDisabled,
    numberFormatter,
    onChange(values) {
      onChange?.(values[0]);
    },
    onChangeEnd(values) {
      onChangeEnd?.(values[0]);
    }
  });

  let min = sliderProps.minValue ?? 0;
  let max = sliderProps.maxValue ?? 100;
  let current = state.values[0];
  let percent = Math.max(0, Math.min(1, (current - min) / (max - min)));

  let handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      let trackWidth = event.nativeEvent.layout.width;
      state.setThumbEditable(0, true);
      return trackWidth;
    },
    [state]
  );

  let handleTrackPress = useCallback(
    (event: {nativeEvent: {locationX: number; target: any}}) => {
      if (resolvedDisabled) {
        return;
      }
    },
    [resolvedDisabled]
  );

  let displayValue = numberFormatter.format(current);

  return (
    <View className={cn('gap-200', className)} testID={testID}>
      {(label != null || showValueLabel) && (
        <View className="flex-row items-center justify-between">
          {label != null && (
            <Text className="text-200 font-medium text-text">
              {typeof label === 'string' ? label : label}
            </Text>
          )}
          {showValueLabel && (
            <Text className="text-200 text-textMuted">{displayValue}</Text>
          )}
        </View>
      )}
      <View
        accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        accessibilityRole="adjustable"
        accessibilityValue={{
          max,
          min,
          now: current,
          text: displayValue
        }}
        className={cn('h-400 justify-center', resolvedDisabled && 'opacity-disabled')}
        onLayout={handleTrackLayout}
        testID={testID ? `${testID}-track` : undefined}>
        <View className="h-50 w-full rounded-full bg-border">
          <View
            className="h-full rounded-full bg-accent"
            style={{width: `${percent * 100}%`}}
          />
        </View>
        <View
          className="absolute h-1000 w-1000 -translate-y-[50%] items-center justify-center rounded-full border-2 border-accent bg-surface shadow-sm"
          style={{left: `${percent * 100}%`, top: '50%'}}
          testID={testID ? `${testID}-thumb` : undefined}
        />
      </View>
    </View>
  );
}

export interface NativeRangeSliderProps
  extends Omit<SliderProps<number[]>, 'label' | 'onChange' | 'onChangeEnd'> {
  'aria-label'?: string;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
  isDisabled?: boolean;
  label?: React.ReactNode;
  locale?: string;
  onChange?: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
  showValueLabel?: boolean;
  testID?: string;
}

export function RangeSlider(rawProps: NativeRangeSliderProps) {
  let props = useProviderProps(rawProps);
  let {
    'aria-label': ariaLabel,
    className,
    formatOptions,
    isDisabled,
    label,
    locale,
    onChange,
    onChangeEnd,
    showValueLabel = true,
    testID,
    ...sliderProps
  } = props;

  let provider = useProvider();
  let resolvedLocale = locale ?? provider.locale ?? 'en-US';
  let resolvedDisabled = !!(isDisabled || provider.isDisabled);

  let numberFormatter = new Intl.NumberFormat(resolvedLocale, formatOptions);

  let state = useSliderState({
    ...sliderProps,
    isDisabled: resolvedDisabled,
    numberFormatter,
    onChange(values) {
      onChange?.([values[0], values[1]]);
    },
    onChangeEnd(values) {
      onChangeEnd?.([values[0], values[1]]);
    }
  });

  let min = sliderProps.minValue ?? 0;
  let max = sliderProps.maxValue ?? 100;
  let startVal = state.values[0];
  let endVal = state.values[1] ?? max;
  let startPercent = Math.max(0, Math.min(1, (startVal - min) / (max - min)));
  let endPercent = Math.max(0, Math.min(1, (endVal - min) / (max - min)));

  let displayValue = `${numberFormatter.format(startVal)} – ${numberFormatter.format(endVal)}`;

  return (
    <View className={cn('gap-200', className)} testID={testID}>
      {(label != null || showValueLabel) && (
        <View className="flex-row items-center justify-between">
          {label != null && (
            <Text className="text-200 font-medium text-text">
              {typeof label === 'string' ? label : label}
            </Text>
          )}
          {showValueLabel && (
            <Text className="text-200 text-textMuted">{displayValue}</Text>
          )}
        </View>
      )}
      <View
        accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        accessibilityRole="adjustable"
        accessibilityValue={{max, min, now: startVal, text: displayValue}}
        className={cn('h-400 justify-center', resolvedDisabled && 'opacity-disabled')}
        testID={testID ? `${testID}-track` : undefined}>
        <View className="h-50 w-full rounded-full bg-border">
          <View
            className="absolute h-full rounded-full bg-accent"
            style={{
              left: `${startPercent * 100}%`,
              width: `${(endPercent - startPercent) * 100}%`
            }}
          />
        </View>
        <View
          className="absolute h-1000 w-1000 -translate-y-[50%] items-center justify-center rounded-full border-2 border-accent bg-surface shadow-sm"
          style={{left: `${startPercent * 100}%`, top: '50%'}}
          testID={testID ? `${testID}-thumb-start` : undefined}
        />
        <View
          className="absolute h-1000 w-1000 -translate-y-[50%] items-center justify-center rounded-full border-2 border-accent bg-surface shadow-sm"
          style={{left: `${endPercent * 100}%`, top: '50%'}}
          testID={testID ? `${testID}-thumb-end` : undefined}
        />
      </View>
    </View>
  );
}
