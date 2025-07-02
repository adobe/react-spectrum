'use client';
import {
  Button,
  ColorPicker as AriaColorPicker,
  ColorPickerProps as AriaColorPickerProps,
  Dialog,
  DialogTrigger,
  Popover
} from 'react-aria-components';
import {ColorSwatch} from './ColorSwatch';
import {ColorSlider} from './ColorSlider';
import {ColorArea} from './ColorArea';
import {ColorField} from './ColorField';

import './ColorPicker.css';

export interface ColorPickerProps extends AriaColorPickerProps {
  label?: string;
  children?: React.ReactNode;
}

export function ColorPicker({ label, children, ...props }: ColorPickerProps) {
  return (
    (
      <AriaColorPicker {...props}>
        <DialogTrigger>
          <Button className="color-picker">
            <ColorSwatch />
            <span>{label}</span>
          </Button>
          <Popover placement="bottom start">
            <Dialog className="color-picker-dialog">
              {children || (
                <>
                  <ColorArea
                    colorSpace="hsb"
                    xChannel="saturation"
                    yChannel="brightness"
                  />
                  <ColorSlider colorSpace="hsb" channel="hue" />
                  <ColorField label="Hex" />
                </>
              )}
            </Dialog>
          </Popover>
        </DialogTrigger>
      </AriaColorPicker>
    )
  );
}
