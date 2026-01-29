# Color

Swatch

A ColorSwatch displays a preview of a selected color.

```tsx
import {ColorSwatch} from '@react-spectrum/s2';

<ColorSwatch />
```

## Value

A ColorSwatch displays a color value passed via the `color` prop. The value can be a string or `Color` object. When no color is provided or the color is transparent, a red slash will be displayed.

```tsx
import {ColorSwatch} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div className={style({display: 'flex', gap: 12, alignItems: 'center'})}>
  <ColorSwatch color="#ff6600" />
  <ColorSwatch color="rgb(255, 0, 255)" />
  <ColorSwatch color="hsl(120, 100%, 42%)" />
  <ColorSwatch color="rgba(0, 150, 255, 0.5)" />
  <ColorSwatch />
</div>
```

## Custom sizing

ColorSwatch can be resized using the `styles` prop.

```tsx
import {ColorSwatch} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<ColorSwatch
  color="#10b981"
  styles={style({width: 80, height: 40})} />
```

## Accessibility

By default, ColorSwatch includes a localized color description for screen reader users (e.g. "dark vibrant blue"). Use the `colorName` prop to override this. Set an `aria-label` to provide additional context. In this example, a screen reader will announce "Fire truck red, Background color".

```tsx
import {ColorSwatch} from '@react-spectrum/s2';

<ColorSwatch
  color="#f00"
  aria-label="Background color"
  colorName="Fire truck red" />
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `color` | `string | Color | undefined` | — | The color value to display in the swatch. |
| `colorName` | `string | undefined` | — | A localized accessible name for the color. By default, a description is generated from the color value, but this can be overridden if you have a more specific color name (e.g. Pantone colors). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `rounding` | `"none" | "default" | "full" | undefined` | 'default' | The corner rounding of the ColorSwatch. |
| `size` | `"XS" | "S" | "M" | "L" | undefined` | 'M' | The size of the ColorSwatch. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesPropWithHeight | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

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
