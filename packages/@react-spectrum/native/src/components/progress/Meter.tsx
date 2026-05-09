import {cn} from '../../styles/cn';
import {getLabelText, getMeterColor, getProgressState, getTrackColor} from './utils';
import {mapAccessibilityProps} from '../../accessibility';
import type {MeterProps} from './types';
import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';

const meterHeights = {
  S: 'h-100',
  M: 'h-150',
  L: 'h-200'
};

export const Meter = forwardRef<React.ElementRef<typeof RNView>, MeterProps>(
  function Meter(rawProps, ref) {
    let props = useProviderProps(rawProps);
    let provider = useProvider();
    let {
      accessibilityHint,
      accessibilityLabel,
      'aria-label': ariaLabel,
      className,
      isDisabled,
      label,
      maxValue,
      minValue,
      showValueLabel,
      size = 'M',
      style,
      value,
      valueLabel,
      variant = 'informative',
      ...otherProps
    } = props;
    let progress = getProgressState({
      locale: provider.locale,
      maxValue,
      minValue,
      value,
      valueLabel
    });
    let labelText = getLabelText(label);
    let resolvedAccessibilityLabel = accessibilityLabel ?? ariaLabel ?? labelText;
    let shouldShowValue = showValueLabel ?? !!label;
    let fillColor = getMeterColor(provider.theme, variant);
    let trackColor = getTrackColor(provider.theme);

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
          className={cn('w-full overflow-hidden rounded-full', meterHeights[size])}
          style={{backgroundColor: trackColor}}>
          <View
            className="h-full rounded-full"
            style={{backgroundColor: fillColor, width: `${progress.percentage}%`}}
          />
        </View>
      </View>
    );
  }
);
