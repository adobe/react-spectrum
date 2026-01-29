# Checkbox

Group

A CheckboxGroup allows users to select one or more items from a list of choices.

```tsx
import {CheckboxGroup, Checkbox} from '@react-spectrum/s2';

<CheckboxGroup>
  <Checkbox value="soccer">Soccer</Checkbox>
  <Checkbox value="baseball">Baseball</Checkbox>
  <Checkbox value="basketball">Basketball</Checkbox>
</CheckboxGroup>
```

## Value

Use the `value` or `defaultValue` prop to set the selected items, and `onChange` to handle selection changes.

```tsx
import {CheckboxGroup, Checkbox} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [selected, setSelected] = useState(['soccer', 'baseball']);

  return (
    <>
      <CheckboxGroup
        label="Favorite sports"
        /*- begin highlight -*/
        value={selected}
        onChange={setSelected}>
        {/*- end highlight -*/}
        <Checkbox value="soccer">Soccer</Checkbox>
        <Checkbox value="baseball">Baseball</Checkbox>
        <Checkbox value="basketball">Basketball</Checkbox>
      </CheckboxGroup>
      <p>Current selection: {selected.join(', ')}</p>
    </>
  );
}
```

## Forms

Use the `name` prop to submit the selected checkboxes to the server. Set the `isRequired` prop on the `<CheckboxGroup>` to validate the user selects at least one checkbox, or on individual checkboxes. See the [Forms](forms.md) guide to learn more.

```tsx
import {CheckboxGroup, Checkbox, Button, Form} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<Form>
  <CheckboxGroup
    label="Sandwich condiments"
    /*- begin highlight -*/
    name="condiments"
    isRequired>
    {/*- end highlight -*/}
    <Checkbox value="lettuce">Lettuce</Checkbox>
    <Checkbox value="tomato">Tomato</Checkbox>
    <Checkbox value="onion">Onion</Checkbox>
    <Checkbox value="sprouts">Sprouts</Checkbox>
  </CheckboxGroup>
  <CheckboxGroup label="Agree to the following" name="terms">
    {/*- begin highlight -*/}
    <Checkbox value="terms" isRequired>Terms and conditions</Checkbox>
    <Checkbox value="privacy" isRequired>Privacy policy</Checkbox>
    <Checkbox value="cookies" isRequired>Cookie policy</Checkbox>
    {/*- end highlight -*/}
  </CheckboxGroup>
  <Button type="submit" styles={style({marginTop: 8})}>Submit</Button>
</Form>
```

## A

PI

```tsx
<CheckboxGroup>
  <Checkbox />
</CheckboxGroup>
```

### Checkbox

Group

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The Checkboxes contained within the CheckboxGroup. |
| `contextualHelp` | `ReactNode` | — | A ContextualHelp element to place next to the label. |
| `defaultValue` | `string[] | undefined` | — | The default value (uncontrolled). |
| `description` | `ReactNode` | — | A description for the field. Provides a hint such as specific requirements for what to choose. |
| `errorMessage` | `ReactNode | ((v: ValidationResult) => ReactNode)` | — | An error message for the field. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isEmphasized` | `boolean | undefined` | — | By default, checkboxes are not emphasized (gray). The emphasized (blue) version provides visual prominence. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `label` | `ReactNode` | — | The content to display as the label. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `necessityIndicator` | `NecessityIndicator | undefined` | 'icon' | Whether the required state should be shown as an icon or text. |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((value: string[]) => void) | undefined` | — | Handler that is called when the value changes. |
| `onFocus` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `orientation` | `Orientation | undefined` | 'vertical' | The axis the checkboxes should align with. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Checkboxes in the CheckboxGroup. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `validate` | `((value: string[]) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `string[] | undefined` | — | The current value (controlled). |
