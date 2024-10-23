import React from 'react';
import {ColorThumb as AriaColorThumb, ColorThumbProps} from 'react-aria-components';
import { tv } from 'tailwind-variants';

const thumbStyles = tv({
  base: 'w-6 h-6 top-[50%] left-[50%] rounded-full border-2 border-white',
  variants: {
    isFocusVisible: {
      true: 'w-8 h-8'
    },
    isDragging: {
      true: 'bg-gray-700 dark:bg-gray-300 forced-colors:bg-[ButtonBorder]'
    },
    isDisabled: {
      true: 'border-gray-300 dark:border-zinc-700 forced-colors:border-[GrayText] bg-gray-300 dark:bg-zinc-800 forced-colors:bg-[GrayText]'
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
