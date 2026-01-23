# Progress

Circle

ProgressCircles show the progression of a system operation such as downloading, uploading, or processing, in a visual way.
They can represent determinate or indeterminate progress.

```tsx
import {ProgressCircle} from '@react-spectrum/s2';

<ProgressCircle />
```

## Value

By default, the `value` prop is a percentage between 0 and 100. Use the `minValue`, and `maxValue` props to set a custom value scale.

```tsx
import {ProgressCircle} from '@react-spectrum/s2';

<ProgressCircle />
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isIndeterminate` | `boolean | undefined` | — | Whether presentation is indeterminate when progress isn't known. |
| `maxValue` | `number | undefined` | 100 | The largest value allowed for the input. |
| `minValue` | `number | undefined` | 0 | The smallest value allowed for the input. |
| `size` | `"S" | "M" | "L" | undefined` | 'M' | The size of the ProgressCircle. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `staticColor` | `"white" | "black" | "auto" | undefined` | — | The static color style to apply. Useful when the button appears over a color background. |
| `styles` | `StylesPropWithHeight | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `number | undefined` | 0 | The current value (controlled). |
