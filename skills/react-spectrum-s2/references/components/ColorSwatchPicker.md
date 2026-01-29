# Color

SwatchPicker

A ColorSwatchPicker displays a list of color swatches and allows a user to select one of them.

```tsx
import {ColorSwatchPicker, ColorSwatch} from '@react-spectrum/s2';

<ColorSwatchPicker>
  <ColorSwatch color="#f00" />
  <ColorSwatch color="#0f0" />
  <ColorSwatch color="#00f" />
  <ColorSwatch color="#ff0" />
  <ColorSwatch color="#f0f" />
  <ColorSwatch color="#0ff" />
</ColorSwatchPicker>
```

## Value

Use the `value` or `defaultValue` prop to set the selected color, and `onChange` to handle selection changes.  The value may be a string or `Color` object, parsed using the `parseColor` function.

```tsx
import {ColorSwatchPicker, ColorSwatch, parseColor} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

function Example() {
  let [value, setValue] = useState(parseColor('#e11d48'));

  return (
    <>
      {/*- begin highlight -*/}
      <ColorSwatchPicker value={value} onChange={setValue}>
      {/*- end highlight -*/}
        <ColorSwatch color="#e11d48" />
        <ColorSwatch color="#f97316" />
        <ColorSwatch color="#eab308" />
        <ColorSwatch color="#22c55e" />
        <ColorSwatch color="#3b82f6" />
        <ColorSwatch color="#8b5cf6" />
        <ColorSwatch color="#ec4899" />
      </ColorSwatchPicker>
      <pre className={style({font: 'body'})}>Selected color: {value.toString('rgb')}</pre>
    </>
  );
}
```

<InlineAlert variant="notice">
  <Heading>Color swatches must be unique</Heading>
  <Content>Equivalent colors in different color spaces are considered duplicates. For example, the values `#f00`, `hsl(0, 100%, 50%)`, and `hsb(0, 100%, 100%)` are all the same color. This is required for predictable selection behavior.</Content>
</InlineAlert>

## A

PI

```tsx
<ColorSwatchPicker>
  <ColorSwatch />
</ColorSwatchPicker>
```

### Color

SwatchPicker

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The ColorSwatches within the ColorSwatchPicker. |
| `defaultValue` | `string | Color | undefined` | — | The default value (uncontrolled). |
| `density` | `"compact" | "regular" | "spacious" | undefined` | 'regular' | The amount of padding between the swatches. |
| `onChange` | `((value: Color) => void) | undefined` | — | Handler that is called when the value changes. |
| `rounding` | `"none" | "default" | "full" | undefined` | 'none' | The corner rounding of the color swatches. |
| `size` | `"XS" | "S" | "M" | "L" | undefined` | 'M' | The size of the color swatches. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
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
