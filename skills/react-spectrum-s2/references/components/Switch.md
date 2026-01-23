# Switch

Switches allow users to turn an individual option on or off.
They are usually used to activate or deactivate a specific setting.

```tsx
import {Switch} from '@react-spectrum/s2';

<Switch />
```

## Selection

Use the `isSelected` or `defaultSelected` prop to set the selection state, and `onChange` to handle selection changes.

```tsx
import {Switch} from '@react-spectrum/s2';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelection] = useState(false);

  return (
    <>
      <Switch 
        {...props}
        isSelected={selected}
        onChange={setSelection}
      >
        Low power mode
      </Switch>
      <p>{selected ? 'Low' : 'High'} power mode active.</p>
    </>
  );
}
```

## Forms

Use the `name` and `value` props to submit the switch to the server. See the [Forms](forms.md) guide to learn more.

```tsx
import {Switch, Button, Form} from '@react-spectrum/s2';

<Form>
  {/*- begin highlight -*/}
  <Switch name="wifi">Wi-Fi</Switch>
  {/*- end highlight -*/}
  <Button type="submit">Submit</Button>
</Form>
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ReactNode` | — |  |
| `defaultSelected` | `boolean | undefined` | — | Whether the Switch should be selected (uncontrolled). |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inputRef` | `RefObject<HTMLInputElement | null> | undefined` | — | A ref for the HTML input element. |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isEmphasized` | `boolean | undefined` | — | Whether the Switch should be displayed with an emphasized style. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isSelected` | `boolean | undefined` | — | Whether the Switch should be selected (controlled). |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((isSelected: boolean) => void) | undefined` | — | Handler that is called when the Switch's selection state changes. |
| `onFocus` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Switch. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `string | undefined` | — | The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue). |
