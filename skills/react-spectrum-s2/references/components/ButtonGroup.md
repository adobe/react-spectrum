# Button

Group

ButtonGroup handles overflow for a grouping of buttons whose actions are related to each other.

```tsx
import {ButtonGroup, Button} from '@react-spectrum/s2';

<ButtonGroup>
  <Button variant="primary">Rate Now</Button>
  <Button variant="secondary">No, thanks</Button>
  <Button variant="secondary">Remind me later</Button>
</ButtonGroup>
```

## Overflow

When horizontal space is limited, ButtonGroup switches to a vertical layout.

```tsx
import {ButtonGroup, Button} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div
  className={style({
    width: 300,
    maxWidth: 'full',
    padding: 16,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid', 
    borderColor: 'gray-300',
    borderRadius: 'default',
    resize: 'horizontal',
    overflow: 'hidden'
  })}>
  {/*- begin focus -*/}
  <ButtonGroup>
    <Button variant="primary">Rate Now</Button>
    <Button variant="secondary">No, thanks</Button>
    <Button variant="secondary">Remind me later</Button>
  </ButtonGroup>
  {/*- end focus -*/}
</div>
```

## A

PI

```tsx
<ButtonGroup>
  <Button />
  <LinkButton />
</ButtonGroup>
```

### Button

Group

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `"start" | "end" | "center" | undefined` | 'start' | The alignment of the Buttons within the ButtonGroup. |
| `children` | `ReactNode` | — | The Buttons contained within the ButtonGroup. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the Buttons in the ButtonGroup are all disabled. |
| `orientation` | `"horizontal" | "vertical" | undefined` | 'horizontal' | The axis the ButtonGroup should align with. Setting this to 'vertical' will prevent any switching behaviors between 'vertical' and 'horizontal'. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Buttons within the ButtonGroup. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
