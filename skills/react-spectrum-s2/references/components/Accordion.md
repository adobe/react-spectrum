# Accordion

An accordion is a container for multiple accordion items.

```tsx
import {Accordion, AccordionItem, AccordionItemTitle, AccordionItemPanel} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<Accordion styles={style({width: 220})}>
  <AccordionItem id="personal">
    <AccordionItemTitle>Personal Information</AccordionItemTitle>
    <AccordionItemPanel>Personal information form here.</AccordionItemPanel>
  </AccordionItem>
  <AccordionItem id="billing">
    <AccordionItemTitle>Billing Address</AccordionItemTitle>
    <AccordionItemPanel>Billing address form here.</AccordionItemPanel>
  </AccordionItem>
</Accordion>
```

## Expanding

Use the `defaultExpandedKeys` or `expandedKeys` prop to set the expanded items, and `onExpandedChange` to handle user interactions. The expanded keys correspond to the `id` prop of each `<AccordionItem>`.

```tsx
import {Accordion, AccordionItem, AccordionItemTitle, AccordionItemPanel, type Key} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [expandedKeys, setExpandedKeys] = useState(new Set<Key>(['settings']));

  return (
    <Accordion
      /*- begin highlight -*/
      expandedKeys={expandedKeys}
      onExpandedChange={setExpandedKeys}>
      {/*- end highlight -*/}
      <AccordionItem id="settings">
        <AccordionItemTitle>Settings</AccordionItemTitle>
        <AccordionItemPanel>Application settings content</AccordionItemPanel>
      </AccordionItem>
      <AccordionItem id="preferences">
        <AccordionItemTitle>Preferences</AccordionItemTitle>
        <AccordionItemPanel>User preferences content</AccordionItemPanel>
      </AccordionItem>
      <AccordionItem id="advanced">
        <AccordionItemTitle>Advanced</AccordionItemTitle>
        <AccordionItemPanel>Advanced configuration options</AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
}
```

## Content

Use `AccordionItemHeader` to add additional elements alongside the title, such as action buttons or icons.

```tsx
import {Accordion, AccordionItem, AccordionItemTitle, AccordionItemPanel, AccordionItemHeader, ActionButton} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<Accordion>
  <AccordionItem styles={style({width: 250})}>
    {/*- begin highlight -*/}
    <AccordionItemHeader>
      <AccordionItemTitle>Project Settings</AccordionItemTitle>
      <ActionButton>Edit</ActionButton>
    </AccordionItemHeader>
    {/*- end highlight -*/}
    <AccordionItemPanel>
      Configure your project settings including name, description, and permissions.
    </AccordionItemPanel>
  </AccordionItem>
  <AccordionItem id="preferences">
    <AccordionItemTitle>Preferences</AccordionItemTitle>
    <AccordionItemPanel>User preferences content</AccordionItemPanel>
  </AccordionItem>
</Accordion>
```

## A

PI

```tsx
<Accordion>
  <AccordionItem>
    <AccordionItemHeader>
      <AccordionItemTitle />
    </AccordionItemHeader>
    <AccordionItemPanel />
  </AccordionItem>
</Accordion>
```

### Accordion

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `allowsMultipleExpanded` | `boolean | undefined` | — | Whether multiple accordion items can be expanded at the same time. |
| `children` | `React.ReactNode` | — | The accordion item elements in the accordion. |
| `defaultExpandedKeys` | `Iterable<Key> | undefined` | — | The initial expanded keys in the accordion (uncontrolled). |
| `density` | `"compact" | "regular" | "spacious" | undefined` | 'regular' | The amount of space between the accordion items. |
| `expandedKeys` | `Iterable<Key> | undefined` | — | The currently expanded keys in the accordion (controlled). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether all accordion items are disabled. |
| `isQuiet` | `boolean | undefined` | — | Whether the accordion should be displayed with a quiet style. |
| `onExpandedChange` | `((keys: Set<Key>) => any) | undefined` | — | Handler that is called when accordion items are expanded or collapsed. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the accordion. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesPropWithHeight | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Accordion

Item

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | The contents of the accordion item, consisting of a accordion item title and accordion item panel. |
| `defaultExpanded` | `boolean | undefined` | — | Whether the accordion item is expanded by default (uncontrolled). |
| `density` | `"compact" | "regular" | "spacious" | undefined` | 'regular' | The amount of space between the accordion item. |
| `id` | `Key | undefined` | — | An id for the accordion item, matching the id used in `expandedKeys`. |
| `isDisabled` | `boolean | undefined` | — | Whether the accordion item is disabled. |
| `isExpanded` | `boolean | undefined` | — | Whether the accordion item is expanded (controlled). |
| `isQuiet` | `boolean | undefined` | — | Whether the accordion item should be displayed with a quiet style. |
| `onExpandedChange` | `((isExpanded: boolean) => void) | undefined` | — | Handler that is called when the accordion item's expanded state changes. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the accordion item. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Accordion

ItemHeader

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | The contents of the accordion item header. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Accordion

ItemTitle

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | The contents of the accordion item title. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `level` | `number | undefined` | 3 | The heading level of the accordion item title. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Accordion

ItemPanel

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `React.ReactNode` | — | The contents of the accordion item panel. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `role` | `"group" | "region" | undefined` | 'group' | The accessibility role for the accordion item panel. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
