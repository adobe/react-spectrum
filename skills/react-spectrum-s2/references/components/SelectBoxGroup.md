# Select

BoxGroup

SelectBoxGroup allows users to select one or more options from a list.

```tsx
import {SelectBoxGroup, SelectBox, Text} from '@react-spectrum/s2'
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Server from '@react-spectrum/s2/illustrations/linear/Server';
import StarFilled1 from '@react-spectrum/s2/illustrations/linear/Star';
import AlertNotice from '@react-spectrum/s2/illustrations/linear/AlertNotice';
import PaperAirplane from '@react-spectrum/s2/illustrations/linear/Paperairplane';

<SelectBoxGroup
  aria-label="Select a cloud"
  
  styles={style({width: 'full'})}>
  <SelectBox id="aws" textValue="Amazon Web Services">
    <Server />
    <Text slot="label">Amazon Web Services</Text>
    <Text slot="description">Reliable cloud infrastructure</Text>
  </SelectBox>
  <SelectBox id="azure" textValue="Microsoft Azure">
    <AlertNotice />
    <Text slot="label">Microsoft Azure</Text>
  </SelectBox>
  <SelectBox id="gcp" textValue="Google Cloud Platform">
    <PaperAirplane />
    <Text slot="label">Google Cloud Platform</Text>
  </SelectBox>
  <SelectBox id="ibm" textValue="IBM Cloud">
    <StarFilled1 />
    <Text slot="label">IBM Cloud</Text>
    <Text slot="description">Hybrid cloud solutions</Text>
  </SelectBox>
</SelectBoxGroup>
```

## Content

`SelectBoxGroup` follows the [Collection Components API](collections.md?component=SelectBoxGroup), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children.

```tsx
import {SelectBoxGroup, SelectBox, Text} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Home from '@react-spectrum/s2/illustrations/linear/Home';
import Phone from '@react-spectrum/s2/illustrations/linear/Phone';
import MailOpen from '@react-spectrum/s2/illustrations/linear/MailOpen';

let options = [
  { id: 'address', name: 'Home address', illustration: <Home /> },
  { id: 'email', name: 'Email address', illustration: <MailOpen /> },
  { id: 'phone', name: 'Phone number', illustration: <Phone /> }
];

function Example() {

  return (
    <SelectBoxGroup
      aria-label="Contact info"
      /*- begin highlight -*/
      items={options}
      /*- end highlight -*/
      selectionMode="multiple"
      styles={style({width: 'full'})}>
      {/*- begin highlight -*/}
      {((item) => (
        <SelectBox id={item.id} textValue={item.name}>
          {item.illustration}
          <Text slot="label">{item.name}</Text>
        </SelectBox>
      ))}
      {/*- end highlight -*/}
    </SelectBoxGroup>
  );
}
```

## Selection

Use the `selectionMode` prop to enable single or multiple selection. The selected items can be controlled via the `selectedKeys` prop, matching the `id` prop of the items. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=SelectBoxGroup) for more details.

```tsx
import {SelectBoxGroup, SelectBox, Text, type Selection} from '@react-spectrum/s2'
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';
import Server from '@react-spectrum/s2/illustrations/linear/Server';
import StarFilled1 from '@react-spectrum/s2/illustrations/linear/Star';
import AlertNotice from '@react-spectrum/s2/illustrations/linear/AlertNotice';
import PaperAirplane from '@react-spectrum/s2/illustrations/linear/Paperairplane';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set());

  return (
    <>
      <SelectBoxGroup
        {...props}
        aria-label="Select a cloud"
        
        selectedKeys={selected}
        onSelectionChange={setSelected}
        styles={style({width: 'full'})}>
        <SelectBox id="aws" textValue="Amazon Web Services">
          <Server />
          <Text slot="label">Amazon Web Services</Text>
          <Text slot="description">Reliable cloud infrastructure</Text>
        </SelectBox>
        <SelectBox id="azure" textValue="Microsoft Azure">
          <AlertNotice />
          <Text slot="label">Microsoft Azure</Text>
        </SelectBox>
        <SelectBox id="gcp" textValue="Google Cloud Platform">
          <PaperAirplane />
          <Text slot="label">Google Cloud Platform</Text>
        </SelectBox>
        <SelectBox id="ibm" textValue="IBM Cloud">
          <StarFilled1 />
          <Text slot="label">IBM Cloud</Text>
          <Text slot="description">Hybrid cloud solutions</Text>
        </SelectBox>
      </SelectBoxGroup>
      <p>Current selection: {selected === 'all' ? 'all' : [...selected].join(', ')}</p>
    </>
  );
}
```

## A

PI

```tsx
<SelectBoxGroup>
  <SelectBox>
    <Illustration />
    <Text slot="label" />
    <Text slot="description" />
  </SelectBox>
</SelectBoxGroup>
```

### Select

BoxGroup

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | FocusStrategy | undefined` | — | Whether to auto focus the listbox or an option. |
| `children` | `React.ReactNode | ((item: T) => ReactNode)` | — | The SelectBox elements contained within the SelectBoxGroup. |
| `defaultSelectedKeys` | `"all" | Iterable<Key> | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `escapeKeyBehavior` | `"clearSelection" | "none" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the listbox or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the SelectBoxGroup is disabled. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
| `orientation` | `Orientation | undefined` | 'vertical' | The layout direction of the content in each SelectBox. |
| `selectedKeys` | `"all" | Iterable<Key> | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `"single" | "multiple" | undefined` | 'single' | The selection mode for the SelectBoxGroup. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Select

Box

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for this item. |
| `children` | `React.ReactNode` | — | The contents of the SelectBox. |
| `id` | `Key | undefined` | — | The unique id of the SelectBox. |
| `isDisabled` | `boolean | undefined` | — | Whether the SelectBox is disabled. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `textValue` | `string | undefined` | — | A string representation of the SelectBox's contents, used for features like typeahead. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
