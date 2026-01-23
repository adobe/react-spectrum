# Badge

Badges are used for showing a small amount of color-categorized metadata, ideal for getting a user's attention.

```tsx
import {Badge} from '@react-spectrum/s2';

<Badge />
```

## A

PI

```tsx
<Badge>
  <Icon />
  <Text />
</Badge>
```

### Badge

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `React.ReactNode` | — | The content to display in the badge. |
| `fillStyle` | `"bold" | "subtle" | "outline" | undefined` | 'bold' | The fill of the badge. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `overflowMode` | `"wrap" | "truncate" | undefined` | 'wrap' | Sets the text behavior for the contents. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'S' | The size of the badge. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `variant` | `"accent" | "informative" | "neutral" | "positive" | "notice" | "negative" | "gray" | "red" | "orange" | "yellow" | "chartreuse" | "celery" | "green" | "seafoam" | "cyan" | "blue" | "indigo" | "purple" | "fuchsia" | "magenta" | "pink" | "turquoise" | "brown" | "cinnamon" | "silver" | undefined` | 'neutral' | The variant changes the background color of the badge. When badge has a semantic meaning, they should use the variant for semantic colors. |
