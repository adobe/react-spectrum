import React from 'react';
import {ColorWheel as AriaColorWheel, ColorWheelProps as AriaColorWheelProps, ColorWheelTrack} from 'react-aria-components';
import { ColorThumb } from './ColorThumb';

export interface ColorWheelProps extends Omit<AriaColorWheelProps, 'outerRadius' | 'innerRadius'> {}

export function ColorWheel(props: ColorWheelProps) {
  return (
    <AriaColorWheel {...props} outerRadius={100} innerRadius={74}>
      <ColorWheelTrack
        className="disabled:bg-gray-300 dark:disabled:bg-zinc-800 forced-colors:disabled:bg-[GrayText]"
        style={({ defaultStyle, isDisabled }) => ({
          ...defaultStyle,
          background: isDisabled ? undefined : `${defaultStyle.background}, repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
        })} />
      <ColorThumb />
    </AriaColorWheel>
  );
}
