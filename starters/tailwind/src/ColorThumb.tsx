'use client';
import React from 'react';
import {ColorThumb as AriaColorThumb, ColorThumbProps} from 'react-aria-components';
import { tv } from 'tailwind-variants';

const thumbStyles = tv({
  base: 'w-4.5 h-4.5 top-[50%] left-[50%] rounded-full border-2 border-white box-border',
  variants: {
    isFocusVisible: {
      true: 'w-8 h-8'
    },
    isDragging: {
      true: 'bg-neutral-700 dark:bg-neutral-300 forced-colors:bg-[ButtonBorder]'
    },
    isDisabled: {
      true: 'border-neutral-300 dark:border-neutral-700 forced-colors:border-[GrayText] bg-neutral-300 dark:bg-neutral-800 forced-colors:bg-[GrayText]'
    }
  }
});

export function ColorThumb(props: ColorThumbProps) {
  return (
    <AriaColorThumb
      {...props}
      style={({ defaultStyle, isDisabled }) => ({
        ...defaultStyle,
        backgroundColor: isDisabled ? undefined : defaultStyle.backgroundColor,
        boxShadow: '0 0 0 1px black, inset 0 0 0 1px black'}
      )}
      className={thumbStyles} />
  );
}
