'use client';
import {
  ColorSwatchPicker as AriaColorSwatchPicker,
  ColorSwatchPickerItem as AriaColorSwatchPickerItem,
  ColorSwatchPickerItemProps,
  ColorSwatchPickerProps
} from 'react-aria-components';

import {ColorSwatch} from './ColorSwatch';

import './ColorSwatchPicker.css';

export function ColorSwatchPicker(
  { children, ...props }: ColorSwatchPickerProps
) {
  return (
    (
      <AriaColorSwatchPicker {...props}>
        {children}
      </AriaColorSwatchPicker>
    )
  );
}

export function ColorSwatchPickerItem(props: ColorSwatchPickerItemProps) {
  return (
    (
      <AriaColorSwatchPickerItem {...props}>
        <ColorSwatch />
      </AriaColorSwatchPickerItem>
    )
  );
}
