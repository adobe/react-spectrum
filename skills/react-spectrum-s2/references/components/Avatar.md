# Avatar

An avatar is a thumbnail representation of an entity, such as a user or an organization.

```tsx
import {Avatar} from '@react-spectrum/s2';

<Avatar />
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `alt` | `string | undefined` | — | Text description of the avatar. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isOverBackground` | `boolean | undefined` | — | Whether the avatar is over a color background. |
| `size` | `28 | 16 | 20 | 24 | 32 | 36 | 40 | 44 | 48 | 56 | 64 | 80 | 96 | 112 | (number & {}) | undefined` | 24 | The size of the avatar. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `src` | `string | undefined` | — | The image URL for the avatar. |
| `styles` | `StylesPropWithoutWidth | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
