import {Color, ColorChannel, ColorFieldProps, ColorSpace} from '@react-types/color';
import {NumberFieldState, useNumberFieldState} from '@react-stately/numberfield';
import {useColor} from './useColor';
import {useControlledState} from '@react-stately/utils';
import {useMemo} from 'react';

export interface ColorChannelFieldProps extends ColorFieldProps {
  colorSpace?: ColorSpace,
  channel: ColorChannel
}

export interface ColorChannelFieldStateOptions extends ColorChannelFieldProps {
  locale: string
}

export interface ColorChannelFieldState extends NumberFieldState {
  colorValue: Color
}

/**
 * Provides state management for a color channel field, allowing users to edit the
 * value of an individual color channel.
 */
export function useColorChannelFieldState(props: ColorChannelFieldStateOptions): ColorChannelFieldState {
  let {channel, colorSpace, locale} = props;
  let black = useColor('#000')!;
  let initialValue = useColor(props.value);
  let initialDefaultValue = useColor(props.defaultValue);
  let [colorValue, setColor] = useControlledState(initialValue, initialDefaultValue ?? null, props.onChange);
  let color = useMemo(() => {
    let nonNullColorValue = colorValue || black;
    return colorSpace && nonNullColorValue ? nonNullColorValue.toFormat(colorSpace) : nonNullColorValue;
  }, [black, colorValue, colorSpace]);
  let value = color.getChannelValue(channel);
  let range = color.getChannelRange(channel);
  let formatOptions = useMemo(() => color.getChannelFormatOptions(channel), [color, channel]);
  let multiplier = formatOptions.style === 'percent' && range.maxValue === 100 ? 100 : 1;

  let numberFieldState = useNumberFieldState({
    locale,
    value: colorValue === null ? NaN : value / multiplier,
    onChange: (v) => {
      if (!Number.isNaN(v)) {
        setColor(color.withChannelValue(channel, v * multiplier));
      } else {
        setColor(null);
      }
    },
    minValue: range.minValue / multiplier,
    maxValue: range.maxValue / multiplier,
    step: range.step / multiplier,
    formatOptions
  });

  return {
    ...numberFieldState,
    colorValue: color
  };
}
