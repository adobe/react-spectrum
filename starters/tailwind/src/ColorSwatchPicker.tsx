'use client';
import React from 'react';
import {
  ColorSwatchPicker as AriaColorSwatchPicker,
  ColorSwatchPickerItem as AriaColorSwatchPickerItem,
  ColorSwatchPickerItemProps,
  ColorSwatchPickerProps,
  composeRenderProps
} from 'react-aria-components';
import {ColorSwatch} from './ColorSwatch';
import {focusRing} from './utils';
import {tv} from 'tailwind-variants';

const pickerStyles = tv({
  base: 'flex gap-1',
  variants: {
    layout: {
      stack: 'flex-col',
      grid: 'flex-wrap'
    }
  }
})

export function ColorSwatchPicker(
  { children, ...props }: Omit<ColorSwatchPickerProps, 'layout'>
) {
  return (
    <AriaColorSwatchPicker {...props} className={composeRenderProps(props.className, (className, renderProps) => pickerStyles({...renderProps, className}))}>
      {children}
    </AriaColorSwatchPicker>
  );
}

const itemStyles = tv({
  extend: focusRing,
  base: 'relative rounded-xs'
});

export function ColorSwatchPickerItem(props: ColorSwatchPickerItemProps) {
  return (
    <AriaColorSwatchPickerItem {...props} className={itemStyles}>
      {({isSelected}) => <>
        <ColorSwatch />
        {isSelected && <div className="absolute top-0 left-0 w-full h-full box-border border border-2 border-black dark:border-white outline outline-2 outline-white dark:outline-black -outline-offset-4 rounded forced-color-adjust-none" />}
      </>}
    </AriaColorSwatchPickerItem>
  );
}