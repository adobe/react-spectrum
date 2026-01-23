# Segmented

Control

A SegmentedControl is a mutually exclusive group of buttons used for view switching.

```tsx
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';

<SegmentedControl>
  <SegmentedControlItem id="day">Day</SegmentedControlItem>
  <SegmentedControlItem id="week">Week</SegmentedControlItem>
  <SegmentedControlItem id="month">Month</SegmentedControlItem>
  <SegmentedControlItem id="year">Year</SegmentedControlItem>
</SegmentedControl>
```

## Content

SegmentedControlItem supports icons and text as children. When a visible label is omitted, provide an `aria-label`.

## Vanilla 

CSS example

```tsx
import {SegmentedControl, SegmentedControlItem, Text} from '@react-spectrum/s2';
import AlignLeft from '@react-spectrum/s2/icons/AlignLeft';
import AlignCenter from '@react-spectrum/s2/icons/AlignCenter';
import AlignRight from '@react-spectrum/s2/icons/AlignRight';

<SegmentedControl aria-label="Text alignment">
  <SegmentedControlItem id="left">
    {/*- begin highlight -*/}
    <AlignLeft />
    <Text>Left</Text>
    {/*- end highlight -*/}
  </SegmentedControlItem>
  <SegmentedControlItem id="center">
    <AlignCenter />
    <Text>Center</Text>
  </SegmentedControlItem>
  <SegmentedControlItem id="right">
    <AlignRight />
    <Text>Right</Text>
  </SegmentedControlItem>
</SegmentedControl>
```

```tsx
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import AlignLeft from '@react-spectrum/s2/icons/AlignLeft';
import AlignCenter from '@react-spectrum/s2/icons/AlignCenter';
import AlignRight from '@react-spectrum/s2/icons/AlignRight';

<SegmentedControl aria-label="Text alignment">
  <SegmentedControlItem id="left" aria-label="Align left">
    {/*- begin highlight -*/}
    <AlignLeft />
     {/*- end highlight -*/}
  </SegmentedControlItem>
  <SegmentedControlItem id="center" aria-label="Align center">
    <AlignCenter />
  </SegmentedControlItem>
  <SegmentedControlItem id="right" aria-label="Align right">
    <AlignRight />
  </SegmentedControlItem>
</SegmentedControl>
```

## Selection

Use the `defaultSelectedKey` or `selectedKey` prop to set the selected item. The selected key corresponds to the `id` prop of a `<SegmentedControlItem>`. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=Tabs#single-selection) for more details.

```tsx
import {SegmentedControl, SegmentedControlItem, type Key} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [selected, setSelected] = useState<Key>('month');

  return (
    <div>
      <SegmentedControl
        /*- begin highlight -*/
        selectedKey={selected}
        onSelectionChange={setSelected}
        /*- end highlight -*/
        aria-label="Time granularity">
        <SegmentedControlItem id="day">Day</SegmentedControlItem>
        <SegmentedControlItem id="week" isDisabled>Week</SegmentedControlItem>
        <SegmentedControlItem id="month">Month</SegmentedControlItem>
        <SegmentedControlItem id="year">Year</SegmentedControlItem>
      </SegmentedControl>
      <p>Selected: {selected}</p>
    </div>
  );
}
```

## A

PI

```tsx
<SegmentedControl>
  <SegmentedControlItem>
    <Icon />
    <Text />
  </SegmentedControlItem>
</SegmentedControl>
```

### Segmented

Control

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The content to display in the segmented control. |
| `defaultSelectedKey` | `Key | undefined` | — | The id of the initial selected item (uncontrolled). |
| `isDisabled` | `boolean | undefined` | — | Whether the segmented control is disabled. |
| `isJustified` | `boolean | undefined` | — | Whether the items should divide the container width equally. |
| `onSelectionChange` | `((id: Key) => void) | undefined` | — | Handler that is called when the selection changes. |
| `selectedKey` | `Key | null | undefined` | — | The id of the currently selected item (controlled). |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Segmented

ControlItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The content to display in the segmented control item. |
| `id` | `Key` | — | The id of the item, matching the value used in SegmentedControl's `selectedKey` prop. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled or not. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
