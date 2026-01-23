# Color

Picker

A ColorPicker synchronizes a color value between multiple React Aria color components.
It simplifies building color pickers with customizable layouts via composition.

## Vanilla 

CSS example

### Color

Picker.tsx

```tsx
'use client';
import {
  Button,
  ColorPicker as AriaColorPicker,
  ColorPickerProps as AriaColorPickerProps
} from 'react-aria-components';
import {DialogTrigger} from './Dialog';
import {ColorSwatch} from './ColorSwatch';
import {ColorSlider} from './ColorSlider';
import {ColorArea} from './ColorArea';
import {ColorField} from './ColorField';
import {Popover} from './Popover';

import './ColorPicker.css';

export interface ColorPickerProps extends Omit<AriaColorPickerProps, 'children'> {
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
          <Popover hideArrow placement="bottom start" className="color-picker-dialog">
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
          </Popover>
        </DialogTrigger>
      </AriaColorPicker>
    )
  );
}

```

### Color

Picker.css

```css
@import "./theme.css";

.color-picker {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  outline: none;
  appearance: none;
  vertical-align: middle;
  font: var(--font-size) system-ui;
  color: var(--text-color);
  -webkit-tap-highlight-color: transparent;

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
  }
}

.react-aria-Popover.color-picker-dialog {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 192px;
  max-height: inherit;
  overflow: auto;
}

```

## Tailwind example

### Color

Picker.tsx

```tsx
'use client';
import React from 'react';
import {Button, ColorPicker as AriaColorPicker, ColorPickerProps as AriaColorPickerProps, DialogTrigger} from 'react-aria-components';
import {ColorSwatch} from './ColorSwatch';
import {ColorArea} from './ColorArea';
import {ColorSlider} from './ColorSlider';
import {ColorField} from './ColorField';
import {Dialog} from './Dialog';
import {Popover} from './Popover';
import { tv } from 'tailwind-variants';
import { focusRing } from './utils';

const buttonStyles = tv({
  extend: focusRing,
  base: 'border-0 bg-transparent flex gap-2 items-center cursor-default rounded-xs font-sans text-sm text-neutral-800 dark:text-neutral-200 [-webkit-tap-highlight-color:transparent]'
});

export interface ColorPickerProps extends Omit<AriaColorPickerProps, 'children'> {
  label?: string;
  children?: React.ReactNode;
}

export function ColorPicker({ label, children, ...props }: ColorPickerProps) {
  return (
    <AriaColorPicker {...props}>
      <DialogTrigger>
        <Button className={buttonStyles}>
          <ColorSwatch />
          <span>{label}</span>
        </Button>
        <Popover placement="bottom start">
          <Dialog className="flex flex-col gap-2">
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
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the color value. This may be a string or `Color` object, parsed using the `parseColor` function. The `onChange` event is always called with a `Color` object.

```tsx
import {parseColor} from 'react-aria-components';
import {ColorPicker} from 'vanilla-starter/ColorPicker';
import {useState} from 'react';

function Example() {
  let [value, setValue] = useState(parseColor('hsl(50, 100%, 50%)'));

  return (
    <>
      <ColorPicker
        label="Color"
        /*- begin highlight -*/
        value={value}
        onChange={setValue} />
        {/*- end highlight -*/}
      <pre style={{fontSize: 12}}>Selected color: {value.toString('hsl')}</pre>
    </>
  );
}
```

## Examples

### Channel sliders

This example uses [ColorSlider](ColorSlider.md) to allow a user to adjust each channel of a color value, with a [Select](Select.md) to switch between color spaces.

```tsx
import type {ColorSpace} from 'react-aria-components';
import {getColorChannels} from 'react-aria-components';
import {ColorPicker} from 'vanilla-starter/ColorPicker';
import {ColorSlider} from 'vanilla-starter/ColorSlider';
import {Select, SelectItem} from 'vanilla-starter/Select';
import {useState} from 'react';

function Example() {
  let [space, setSpace] = useState<ColorSpace>('rgb');

  return (
    <ColorPicker label="Fill color" defaultValue="#184">
      <Select aria-label="Color space" selectedKey={space} onSelectionChange={s => setSpace(s as ColorSpace)}>
        <SelectItem id="rgb">RGB</SelectItem>
        <SelectItem id="hsl">HSL</SelectItem>
        <SelectItem id="hsb">HSB</SelectItem>
      </Select>
      {getColorChannels(space).map(channel => (
        <ColorSlider
          key={channel}
          colorSpace={space}
          channel={channel} />
      ))}
      <ColorSlider channel="alpha" />
    </ColorPicker>
  );
}
```

### Color wheel

This example combines a [ColorWheel](ColorWheel.md) and [ColorArea](ColorArea.md) to build an HSB color picker.

```tsx
import {ColorPicker} from 'vanilla-starter/ColorPicker';
import {ColorWheel} from 'vanilla-starter/ColorWheel';
import {ColorArea} from 'vanilla-starter/ColorArea';

<ColorPicker label="Stroke color" defaultValue="#345">
  <ColorWheel />
  <ColorArea
    colorSpace="hsb"
    xChannel="saturation"
    yChannel="brightness"
    style={{
      width: '100px',
      height: '100px',
      position: 'absolute',
      top: 'calc(50% - 50px)',
      left: 'calc(50% - 50px)'}} />
</ColorPicker>
```

### Channel fields

This example uses [ColorField](ColorField.md) to allow a user to edit the value of each color channel as a number, along with a [Select](Select.md) to switch between color spaces.

```tsx
import type {ColorSpace} from 'react-aria-components';
import {ColorPicker} from 'vanilla-starter/ColorPicker';
import {getColorChannels} from 'react-aria-components';
import {ColorArea} from 'vanilla-starter/ColorArea';
import {ColorSlider} from 'vanilla-starter/ColorSlider';
import {Select, SelectItem} from 'vanilla-starter/Select';
import {ColorField} from 'vanilla-starter/ColorField';
import {useState} from 'react';

function Example() {
  let [space, setSpace] = useState<ColorSpace>('rgb');

  return (
    <ColorPicker label="Color" defaultValue="#f80">
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
      <ColorSlider colorSpace="hsb" channel="hue" />
      <Select aria-label="Color space" selectedKey={space} onSelectionChange={s => setSpace(s as ColorSpace)}>
        <SelectItem id="rgb">RGB</SelectItem>
        <SelectItem id="hsl">HSL</SelectItem>
        <SelectItem id="hsb">HSB</SelectItem>
      </Select>
      <div style={{display: 'flex', gap: 4, width: 192}}>
        {getColorChannels(space).map(channel => (
          <ColorField
            key={channel}
            colorSpace={space}
            channel={channel}
            style={{flex: 1}} />
        ))}
      </div>
    </ColorPicker>
  );
}
```

### Swatches

This example uses a [ColorSwatchPicker](ColorSwatchPicker.md) to provide color presets for a color picker.

```tsx
import {ColorPicker} from 'vanilla-starter/ColorPicker';
import {ColorArea} from 'vanilla-starter/ColorArea';
import {ColorSlider} from 'vanilla-starter/ColorSlider';
import {ColorSwatchPicker, ColorSwatchPickerItem} from 'vanilla-starter/ColorSwatchPicker';

<ColorPicker label="Color" defaultValue="#A00">
  <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
  <ColorSlider colorSpace="hsb" channel="hue" />
  <ColorSwatchPicker>
    <ColorSwatchPickerItem color="#A00" />
    <ColorSwatchPickerItem color="#f80" />
    <ColorSwatchPickerItem color="#080" />
    <ColorSwatchPickerItem color="#08f" />
    <ColorSwatchPickerItem color="#008" />
  </ColorSwatchPicker>
</ColorPicker>
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<ColorPickerRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `defaultValue` | `string | Color | undefined` | — | The default value (uncontrolled). |
| `onChange` | `((value: Color) => void) | undefined` | — | Handler that is called when the value changes. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `value` | `string | Color | undefined` | — | The current value (controlled). |

## Related 

Types

### Color

Represents a color value.

#### `to

Format(format: ColorFormat): Color`

Converts the color to the given color format, and returns a new Color object.

#### `to

String(format?: ColorFormat | 'css'): string`

Converts the color to a string in the given format.

#### `clone(): 

Color`

Returns a duplicate of the color value.

#### `to

HexInt(): number`

Converts the color to hex, and returns an integer representation.

#### `get

ChannelValue(channel: ColorChannel): number`

Returns the numeric value for a given channel. Throws an error if the channel is unsupported in the current color format.

#### `with

ChannelValue(channel: ColorChannel, value: number): Color`

Sets the numeric value for a given channel, and returns a new Color object. Throws an error if the channel is unsupported in the current color format.

#### `get

ChannelRange(channel: ColorChannel): ColorChannelRange`

Returns the minimum, maximum, and step values for a given channel.

#### `get

ChannelName(channel: ColorChannel, locale: string): string`

Returns a localized color channel name for a given channel and locale, for use in visual or accessibility labels.

#### `get

ChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions`

Returns the number formatting options for the given channel.

#### `format

ChannelValue(channel: ColorChannel, locale: string): string`

Formats the numeric value for a given channel for display according to the provided locale.

#### `get

ColorSpace(): ColorSpace`

Returns the color space, 'rgb', 'hsb' or 'hsl', for the current color.

#### `get

ColorSpaceAxes(xyChannels: {xChannel?: ColorChannel, yChannel?: ColorChannel}): ColorAxes`

Returns the color space axes, xChannel, yChannel, zChannel.

#### `get

ColorChannels(): [ColorChannel, ColorChannel, ColorChannel]`

Returns an array of the color channels within the current color space space.

#### `get

ColorName(locale: string): string`

Returns a localized name for the color, for use in visual or accessibility labels.

#### `get

HueName(locale: string): string`

Returns a localized name for the hue, for use in visual or accessibility labels.

### parse

Color

`parseColor(value: string): IColor`

Parses a color from a string value. Throws an error if the string could not be parsed.
