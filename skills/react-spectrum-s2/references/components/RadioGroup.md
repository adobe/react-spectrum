# Radio

Group

Radio groups allow users to select a single option from a list of mutually exclusive options.
All possible options are exposed up front for users to compare.

```tsx
import {RadioGroup, Radio} from '@react-spectrum/s2';

<RadioGroup>
  <Radio value="cats">Cat</Radio>
  <Radio value="dogs">Dog</Radio>
  <Radio value="dragon">Dragon</Radio>
</RadioGroup>
```

## Value

Use the `value` or `defaultValue` prop to set the selected item, and `onChange` to handle selection changes.

```tsx
import {RadioGroup, Radio} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <RadioGroup
        label="Favorite sport"
        /*- begin highlight -*/
        value={selected}
        onChange={setSelected}>
        {/*- end highlight -*/}
        <Radio value="soccer">Soccer</Radio>
        <Radio value="baseball">Baseball</Radio>
        <Radio value="basketball">Basketball</Radio>
      </RadioGroup>
      <p>Current selection: {selected || 'None'}</p>
    </>
  );
}
```

## Forms

Use the `name` prop to submit the selected radio to the server. Set the `isRequired` prop to validate that the user selects an option, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {RadioGroup, Radio, Button, Form} from '@react-spectrum/s2';

function Example(props) {
  return (
    <Form>
      <RadioGroup
        {...props}
        label="Favorite pet"
        /*- begin highlight -*/
        name="pet"
        
        /*- end highlight -*/
      >
        <Radio value="dog">Dog</Radio>
        <Radio value="cat">Cat</Radio>
        <Radio value="dragon">Dragon</Radio>
      </RadioGroup>
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## A

PI

```tsx
<RadioGroup>
  <Radio />
</RadioGroup>
```

### Radio

Group

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `React.ReactNode` | — | The Radios contained within the RadioGroup. |
| `contextualHelp` | `React.ReactNode` | — | A ContextualHelp element to place next to the label. |
| `defaultValue` | `string | null | undefined` | — | The default value (uncontrolled). |
| `description` | `React.ReactNode` | — | A description for the field. Provides a hint such as specific requirements for what to choose. |
| `errorMessage` | `React.ReactNode | ((v: ValidationResult) => ReactNode)` | — | An error message for the field. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isEmphasized` | `boolean | undefined` | — | Whether the RadioGroup should be displayed with an emphasized style. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `label` | `React.ReactNode` | — | The content to display as the label. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `necessityIndicator` | `NecessityIndicator | undefined` | 'icon' | Whether the required state should be shown as an icon or text. |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((value: string) => void) | undefined` | — | Handler that is called when the value changes. |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `orientation` | `Orientation | undefined` | 'vertical' | The axis the radio elements should align with. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the RadioGroup. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `validate` | `((value: string) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `string | null | undefined` | — | The current value (controlled). |

### Radio

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ReactNode` | — | The label for the element. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inputRef` | `RefObject<HTMLInputElement | null> | undefined` | — | A ref for the HTML input element. |
| `isDisabled` | `boolean | undefined` | — | Whether the radio button is disabled or not. Shows that a selection exists, but is not available in that circumstance. |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onFocus` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `string` | — | The value of the radio button, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#Value). |
