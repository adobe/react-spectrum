# Color

Field

A color field allows users to edit a hex color or individual color channel value.

## Vanilla 

CSS example

### Color

Field.tsx

```tsx
'use client';
import {
  ColorField as AriaColorField,
  ColorFieldProps as AriaColorFieldProps,
  Input,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError, Description} from './Form';

import './ColorField.css';

export interface ColorFieldProps extends AriaColorFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
}

export function ColorField(
  { label, description, errorMessage, placeholder, ...props }: ColorFieldProps
) {
  return (
    (
      <AriaColorField {...props}>
        {label && <Label>{label}</Label>}
        <Input className="react-aria-Input inset" placeholder={placeholder} />
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
      </AriaColorField>
    )
  );
}

```

### Color

Field.css

```css
@import "./theme.css";
@import "./TextField.css";

.react-aria-ColorField {
  display: flex;
  flex-direction: column;
}

```

## Tailwind example

### Color

Field.tsx

```tsx
'use client';
import React from 'react';
import {
  ColorField as AriaColorField,
  ColorFieldProps as AriaColorFieldProps,
  ValidationResult
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Input, Label, fieldBorderStyles } from './Field';
import { composeTailwindRenderProps, focusRing } from './utils';

const inputStyles = tv({
  extend: focusRing,
  base: 'border-1 rounded-lg min-h-9 font-sans text-sm py-0 px-3 box-border transition [-webkit-tap-highlight-color:transparent]',
  variants: {
    isFocused: fieldBorderStyles.variants.isFocusWithin,
    isInvalid: fieldBorderStyles.variants.isInvalid,
    isDisabled: fieldBorderStyles.variants.isDisabled
  }
});

export interface ColorFieldProps extends AriaColorFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function ColorField(
  { label, description, errorMessage, ...props }: ColorFieldProps
) {
  return (
    <AriaColorField {...props} className={composeTailwindRenderProps(props.className, 'flex flex-col gap-1 font-sans')}>
      {label && <Label>{label}</Label>}
      <Input className={inputStyles} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaColorField>
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the color value, and `onChange` to handle user input. The value may be a string or `Color` object, parsed using the `parseColor` function. `onChange` is always called with a `Color` object.

```tsx
import {ColorField} from 'vanilla-starter/ColorField';
import {parseColor, type Color} from 'react-aria-components';
import {useState} from 'react';

function Example() {
  let [value, setValue] = useState<Color | null>(parseColor('#e73623'));

  return (
    <div>
      <ColorField
        label="Primary color"
        placeholder="Enter a color"
        value={value}
        onChange={setValue} />
      <pre style={{fontSize: 12}}>Current value: {value?.toString('hex')}</pre>
    </div>
  );
}
```

## Channel

By default, ColorField displays a hex value. Set the `colorSpace` and `channel` props to display a specific color channel.

```tsx
import {ColorField} from 'vanilla-starter/ColorField';
import {parseColor, type Color} from 'react-aria-components';
import {useState} from 'react';

function Example() {
  let [color, setColor] = useState<Color | null>(parseColor('#7f007f'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ColorField
        label="Hue"

        value={color}
        onChange={setColor}
        /*- begin highlight -*/
        colorSpace="hsl"
        channel="hue" />
        {/*- end highlight -*/}
      <ColorField
        label="Saturation"
        value={color}
        onChange={setColor}
        colorSpace="hsl"
        channel="saturation" />
      <ColorField
        label="Lightness"
        value={color}
        onChange={setColor}
        colorSpace="hsl"
        channel="lightness" />
      <pre style={{fontSize: 12}}>Current value: {color?.toString('hex')}</pre>
    </div>
  );
}
```

## Forms

Use the `name` prop to submit the text value to the server. Set the `isRequired` prop to validate the value, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {ColorField} from 'vanilla-starter/ColorField';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';

function Example(props) {
  return (
    <Form>
      <ColorField
        {...props}
        label="Brand color"
        placeholder="Enter a color"
        name="brandColor"
        isRequired />
        {/*- end highlight -*/}
      <Button type="submit" style={{marginTop: 8}}>Submit</Button>
    </Form>
  );
}
```

## A

PI

```tsx
<ColorField>
  <Label />
  <Input />
  <Text slot="description" />
  <FieldError />
</ColorField>
```

### Color

Field

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `channel` | `ColorChannel | undefined` | — | The color channel that this field edits. If not provided,  the color is edited as a hex value. |
| `children` | `ChildrenOrFunction<ColorFieldRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ColorFieldRenderProps> | undefined` | 'react-aria-ColorField' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `colorSpace` | `ColorSpace | undefined` | — | The color space that the color field operates in if a `channel` prop is provided. If no `channel` is provided, the color field always displays the color as an RGB hex value. |
| `defaultValue` | `string | Color | null | undefined` | — | The default value (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `isWheelDisabled` | `boolean | undefined` | — | Enables or disables changing the value with scroll. |
| `lang` | `string | undefined` | — |  |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBeforeInput` | `React.FormEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the input value is about to be modified. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event). |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((color: Color | null) => void) | undefined` | — | Handler that is called when the value changes. |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionEnd` | `React.CompositionEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when a text composition system completes or cancels the current text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event). |
| `onCompositionStart` | `React.CompositionEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when a text composition system starts a new text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event). |
| `onCompositionUpdate` | `React.CompositionEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when a new character is received in the current text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionupdate_event). |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCopy` | `React.ClipboardEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the user copies text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncopy). |
| `onCut` | `React.ClipboardEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the user cuts text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncut). |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInput` | `React.FormEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the input value is modified. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event). |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPaste` | `React.ClipboardEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the user pastes text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/onpaste). |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSelect` | `React.ReactEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when text in the input is selected. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/select_event). |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: ColorFieldRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `validate` | `((value: Color | null) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `string | Color | null | undefined` | — | The current value (controlled). |

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
