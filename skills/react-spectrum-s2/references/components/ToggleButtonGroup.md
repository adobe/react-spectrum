# Toggle

ButtonGroup

A ToggleButtonGroup is a grouping of related ToggleButtons, with single or multiple selection.

```tsx
import {ToggleButtonGroup, ToggleButton, Text} from '@react-spectrum/s2';
import TextBold from '@react-spectrum/s2/icons/TextBold';
import TextItalic from '@react-spectrum/s2/icons/TextItalic';
import TextUnderline from '@react-spectrum/s2/icons/TextUnderline';

<ToggleButtonGroup>
  <ToggleButton id="bold">
    <TextBold />
    <Text>Bold</Text>
  </ToggleButton>
  <ToggleButton id="italic">
    <TextItalic />
    <Text>Italic</Text>
  </ToggleButton>
  <ToggleButton id="underline">
    <TextUnderline />
    <Text>Underline</Text>
  </ToggleButton>
</ToggleButtonGroup>
```

## Selection

Use the `selectionMode` prop to enable single or multiple selection. The selected toggle buttons can be controlled via the `selectedKeys` prop, matching the `id` of each `<ToggleButton>`. Toggle buttons can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=ToggleButtonGroup) for more details.

```tsx
import {ToggleButtonGroup, ToggleButton, type Key} from '@react-spectrum/s2';
import {useState} from 'react';
import TextBold from '@react-spectrum/s2/icons/TextBold';
import TextItalic from '@react-spectrum/s2/icons/TextItalic';
import TextUnderline from '@react-spectrum/s2/icons/TextUnderline';
import TextStrikeThrough from '@react-spectrum/s2/icons/TextStrikeThrough';

function Example(props) {
  let [selected, setSelected] = useState(new Set<Key>(['bold']));

  return (
    <>
      <ToggleButtonGroup
        {...props}
        aria-label="Text style"
        density="compact"
        /*- begin highlight -*/
        
        selectedKeys={selected}
        onSelectionChange={setSelected}>
        {/*- end highlight -*/}
        <ToggleButton id="bold" aria-label="Bold">
          <TextBold />
        </ToggleButton>
        <ToggleButton id="italic" aria-label="Italic" isDisabled>
          <TextItalic />
        </ToggleButton>
        <ToggleButton id="underline" aria-label="Underline">
          <TextUnderline />
        </ToggleButton>
        <ToggleButton id="strike" aria-label="Strikethrough">
          <TextStrikeThrough />
        </ToggleButton>
      </ToggleButtonGroup>
      <p>Current selection: {[...selected].join(', ')}</p>
    </>
  );
}
```

## A

PI

```tsx
<ToggleButtonGroup>
  <ToggleButton />
</ToggleButtonGroup>
```

### Toggle

ButtonGroup

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The children of the group. |
| `defaultSelectedKeys` | `Iterable<Key> | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `density` | `"compact" | "regular" | undefined` | "regular" | Spacing between the buttons. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the group is disabled. |
| `isEmphasized` | `boolean | undefined` | — | Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). |
| `isJustified` | `boolean | undefined` | — | Whether the buttons should divide the container width equally. |
| `isQuiet` | `boolean | undefined` | — | Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). |
| `onSelectionChange` | `((keys: Set<Key>) => void) | undefined` | — | Handler that is called when the selection changes. |
| `orientation` | `"horizontal" | "vertical" | undefined` | 'horizontal' | The axis the group should align with. |
| `selectedKeys` | `Iterable<Key> | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `"single" | "multiple" | undefined` | 'single' | Whether single or multiple selection is enabled. |
| `size` | `"XS" | "S" | "M" | "L" | "XL" | undefined` | "M" | Size of the buttons. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `staticColor` | `"white" | "black" | "auto" | undefined` | — | The static color style to apply. Useful when the ActionButtonGroup appears over a color background. |
| `styles` | `StylesPropWithHeight | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
