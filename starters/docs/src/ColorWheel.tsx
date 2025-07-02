'use client';
import {
  ColorThumb,
  ColorWheel as AriaColorWheel,
  ColorWheelProps as AriaColorWheelProps,
  ColorWheelTrack
} from 'react-aria-components';

import './ColorWheel.css';
export interface ColorWheelProps
  extends Omit<AriaColorWheelProps, 'outerRadius' | 'innerRadius'> {}

export function ColorWheel(props: ColorWheelProps) {
  return (
    (
      <AriaColorWheel {...props} outerRadius={100} innerRadius={74}>
        <ColorWheelTrack />
        <ColorThumb />
      </AriaColorWheel>
    )
  );
}
