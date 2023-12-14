import {focusRing} from './utils';
import {Label} from './Field';
import {
  Slider as AriaSlider,
  SliderOutput,
  SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack
} from 'react-aria-components';
import React from 'react';
import {tv} from 'tailwind-variants';

const thumbStyles = tv({
  extend: focusRing,
  base: 'w-6 h-6 mt-6 rounded-full bg-gray-50 dark:bg-zinc-900 border-2 border-gray-700 dark:border-gray-300',
  variants: {
    isDragging: {
      true: 'bg-gray-700 dark:bg-gray-300 forced-colors:!bg-[ButtonBorder]'
    }
  }
});

export interface SliderProps<T> extends AriaSliderProps<T> {
  label?: string;
  thumbLabels?: string[];
}

export function Slider<T extends number | number[]>(
  { label, thumbLabels, ...props }: SliderProps<T>
) {
  return (
    <AriaSlider {...props} className="grid grid-cols-[1fr_auto] gap-2 w-64">
      <Label>Opacity</Label>
      <SliderOutput className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
        {({ state }) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
      </SliderOutput>
      <SliderTrack className="col-span-2 h-6 flex items-center">
        {({ state }) => <>
          <div className="w-full h-[6px] rounded-full bg-gray-300 dark:bg-zinc-500 forced-colors:!bg-[ButtonBorder]" />
          {state.values.map((_, i) => <SliderThumb key={i} index={i} aria-label={thumbLabels?.[i]} className={thumbStyles} />)}
        </>}
      </SliderTrack>
    </AriaSlider>
  );
}
