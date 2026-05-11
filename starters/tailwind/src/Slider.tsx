'use client';
import React from 'react';
import {
  Slider as AriaSlider,
  type SliderProps as AriaSliderProps,
  SliderOutput,
  SliderThumb,
  SliderTrack,
  SliderFill
} from 'react-aria-components/Slider';
import {tv} from 'tailwind-variants';
import {Label} from './Field';
import {composeTailwindRenderProps, focusRing} from './utils';

const trackStyles = tv({
  base: 'relative rounded-full',
  variants: {
    orientation: {
      horizontal: 'w-full h-[6px]',
      vertical: 'h-full w-[6px] ml-[50%] -translate-x-[50%]'
    },
    isDisabled: {
      false: 'bg-neutral-300 dark:bg-neutral-700 forced-colors:bg-[ButtonBorder]',
      true: 'bg-neutral-200 dark:bg-neutral-800 forced-colors:bg-[ButtonBorder]'
    }
  }
});

const fillStyles = tv({
  base: 'rounded-full',
  variants: {
    isDisabled: {
      false: 'bg-blue-500 forced-colors:bg-[Highlight]',
      true: 'bg-neutral-300 dark:bg-neutral-600 forced-colors:bg-[GrayText]'
    }
  }
});

const thumbStyles = tv({
  extend: focusRing,
  base: 'w-4.5 h-4.5 group-orientation-horizontal:mt-5 group-orientation-vertical:ml-2.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-700 dark:border-neutral-300',
  variants: {
    isDragging: {
      true: 'bg-neutral-700 dark:bg-neutral-300 forced-colors:bg-[ButtonBorder]'
    },
    isDisabled: {
      true: 'border-neutral-300 dark:border-neutral-700 forced-colors:border-[GrayText]'
    }
  }
});

export interface SliderProps<T> extends AriaSliderProps<T> {
  /** Label for the slider. */
  label?: string;
  /** Aria labels for each thumb. */
  thumbLabels?: string[];
  /**
   * The offset from which to start the fill.
   * @default 0
   */
  fillOffset?: number;
}

export function Slider<T extends number | number[]>({
  label,
  thumbLabels,
  fillOffset,
  ...props
}: SliderProps<T>) {
  return (
    <AriaSlider
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'font-sans orientation-horizontal:grid orientation-vertical:flex grid-cols-[1fr_auto] flex-col items-center gap-2 orientation-horizontal:w-64 orientation-horizontal:max-w-[calc(100%-10px)]'
      )}>
      <Label>{label}</Label>
      <SliderOutput className="text-sm text-neutral-500 dark:text-neutral-400 orientation-vertical:hidden" />
      <SliderTrack className="group col-span-2 orientation-horizontal:h-5 orientation-vertical:w-5 orientation-vertical:h-38 flex items-center">
        {({state, ...renderProps}) => (
          <>
            <div className={trackStyles(renderProps)}>
              <SliderFill offset={fillOffset} className={fillStyles(renderProps)} />
            </div>
            {state.values.map((_, i) => (
              <SliderThumb
                key={i}
                index={i}
                aria-label={thumbLabels?.[i]}
                className={thumbStyles}
              />
            ))}
          </>
        )}
      </SliderTrack>
    </AriaSlider>
  );
}
