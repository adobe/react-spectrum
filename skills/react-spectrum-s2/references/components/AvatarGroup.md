# Avatar

Group

An avatar group is a grouping of avatars that are related to each other.

```tsx
import {AvatarGroup, Avatar} from '@react-spectrum/s2';

<AvatarGroup>
  <Avatar
    alt="Abraham Baker"
    src="https://www.untitledui.com/images/avatars/abraham-baker" />
  <Avatar
    alt="Adriana Sullivan"
    src="https://www.untitledui.com/images/avatars/adriana-sullivan" />
  <Avatar
    alt="Jonathan Kelly"
    src="https://www.untitledui.com/images/avatars/jonathan-kelly" />
  <Avatar
    alt="Zara Bush"
    src="https://www.untitledui.com/images/avatars/zara-bush" />
</AvatarGroup>
```

## A

PI

```tsx
<AvatarGroup>
  <Avatar />
</AvatarGroup>
```

### Avatar

Group

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | Avatar children of the avatar group. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `label` | `string | undefined` | — | The label for the avatar group. |
| `size` | `16 | 20 | 24 | 28 | 32 | 36 | 40 | undefined` | 24 | The size of the avatar group. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesPropWithoutWidth | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
