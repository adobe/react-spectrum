# Tooltip

Display container for Tooltip content. Has a directional arrow dependent on its placement.

```tsx
import {Tooltip, TooltipTrigger, ActionButton} from '@react-spectrum/s2';
import Edit from '@react-spectrum/s2/icons/Edit';

<TooltipTrigger>
  <ActionButton aria-label="Edit name"><Edit /></ActionButton>
  <Tooltip>Edit name</Tooltip>
</TooltipTrigger>
```

## Interactions

Tooltips appear after a "warmup" delay when hovering, or instantly on focus. Once a tooltip is displayed, other tooltips display immediately. If the user waits for the "cooldown period" before hovering another element, the warmup timer restarts.

```tsx
import {TooltipTrigger, Tooltip, ActionButton} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Edit from '@react-spectrum/s2/icons/Edit';
import Save from '@react-spectrum/s2/icons/SaveFloppy';

function Example(props) {
  return (
    <div className={style({display: 'flex', gap: 8})}>
      {/*- begin highlight -*/}
      <TooltipTrigger {...props}>
      {/*- end highlight -*/}
        <ActionButton aria-label="Edit">
          <Edit />
        </ActionButton>
        <Tooltip>
          Edit
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props}>
        <ActionButton aria-label="Save">
          <Save />
        </ActionButton>
        <Tooltip>
          Save
        </Tooltip>
      </TooltipTrigger>
    </div>
  );
}
```

<InlineAlert
  variant="notice"
  UNSAFE_style={{marginTop: '2rem'}}
>
  <Heading>Accessibility</Heading>
  <Content>Tooltips are not shown on touch screen interactions. Ensure that your UI is usable without tooltips, or use an alternative component such as a [Popover](Popover.md) to show information in an adjacent element.</Content>
</InlineAlert>

## Non-interactive elements

Tooltips must be placed on focusable elements so they are accessible to keyboard and screen reader users. Use [ContextualHelp](ContextualHelp.md) to provide context for non-interactive elements such as plain text or disabled buttons.

```tsx
import {Button, ContextualHelp, Heading, Content} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div className={style({display: 'flex', gap: 8, alignItems: 'center'})}>
  <Button isDisabled>Delete resource</Button>
  {/*- begin highlight -*/}
  <ContextualHelp variant="info">
    <Heading>Permission required</Heading>
    <Content>
      Your admin must grant you permission before you can delete resources.
    </Content>
  </ContextualHelp>
  {/*- end highlight -*/}
</div>
```

## A

PI

```tsx
<TooltipTrigger>
  <Button />
  <Tooltip />
</TooltipTrigger>
```

### Tooltip

Trigger

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The content of the tooltip. |
| `containerPadding` | `number | undefined` | 12 | The placement padding that should be applied between the element and its surrounding container. |
| `crossOffset` | `number | undefined` | 0 | The additional offset applied along the cross axis between the element and its anchor element. |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `delay` | `number | undefined` | 1500 | The delay time for the tooltip to show up. [See guidelines](https://spectrum.adobe.com/page/tooltip/#Immediate-or-delayed-appearance). |
| `isDisabled` | `boolean | undefined` | — | Whether the tooltip should be disabled, independent from the trigger. |
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Handler that is called when the overlay's open state changes. |
| `placement` | `"start" | "end" | "top" | "bottom" | "left" | "right" | undefined` | 'top' | The placement of the element with respect to its anchor element. |
| `shouldCloseOnPress` | `boolean | undefined` | true | Whether the tooltip should close when the trigger is pressed. |
| `shouldFlip` | `boolean | undefined` | true | Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely. |
| `trigger` | `"focus" | "hover" | undefined` | 'hover' | By default, opens for both focus and hover. Can be made to open only for focus. |

### Tooltip

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The content of the tooltip. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
