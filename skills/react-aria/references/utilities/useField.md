# use

Field

Provides the accessibility implementation for input fields.
Fields accept user input, gain context from their label, and may display a description or error message.

## Introduction

The `useField` hook associates a form control with a label, and an optional description and/or error message. This is useful for providing context about how users should fill in a field, or a validation message. `useField` takes care of creating ids for each element and associating them with the correct ARIA attributes (`aria-labelledby` and `aria-describedby`).

By default, `useField` assumes that the label is a native HTML `<label>` element. However, if you are labeling a non-native form element, be sure to use an element other than a `<label>` and set the `labelElementType` prop appropriately.

**Note**: Many other React Aria hooks such as [useTextField](TextField/useTextField.md), [useSelect](Select/useSelect.md), and [useComboBox](ComboBox/useComboBox.md) already include support for description and error message elements. If you're using one of those hooks, there's no need to use `useField`.

## Example

```tsx
'use client';
import {useField} from 'react-aria';

function ContactPicker(props) {
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField(props);

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: 200, marginBottom: 20}}>
      <label {...labelProps}>{props.label}</label>
      <select {...fieldProps}>
        <option>Email</option>
        <option>Phone</option>
        <option>Fax</option>
        <option>Carrier pigeon</option>
      </select>
      {props.description &&
        <div {...descriptionProps} style={{fontSize: 12}}>{props.description}</div>
      }
      {props.errorMessage &&
        <div {...errorMessageProps} style={{color: '#b00020', fontSize: 12}}>{props.errorMessage}</div>
      }
    </div>
  );
}

<>
  <ContactPicker
    label="Preferred contact method"
    description="Select the best way to contact you about issues with your account." />
  <ContactPicker
    label="Preferred contact method"
    errorMessage="Select a contact method." />
</>
```

## A

PI

<FunctionAPI
  function={docs.exports.useField}
  links={docs.links}
/>

### Aria

FieldProps

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `labelElementType` | `ElementType | undefined` | 'label' | The HTML element used to render the label, e.g. 'label', or 'span'. |
| `label` | `ReactNode` | — | The content to display as the label. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `description` | `ReactNode` | — | A description for the field. Provides a hint such as specific requirements for what to choose. |
| `errorMessage` | `ReactNode | ((v: ValidationResult) => ReactNode)` | — | An error message for the field. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `validationState` | `ValidationState | undefined` | — | — |
| `validationBehavior` | `"aria" | "native" | undefined` | 'aria' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `validate` | `((value: any) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |

### Field

Aria

| Name | Type | Description |
|------|------|-------------|
| `descriptionProps` \* | `DOMAttributes<FocusableElement>` | Props for the description element, if any. |
| `errorMessageProps` \* | `DOMAttributes<FocusableElement>` | Props for the error message element, if any. |
| `labelProps` \* | `DOMAttributes<FocusableElement> | LabelHTMLAttributes<HTMLLabelElement>` | Props to apply to the label container element. |
| `fieldProps` \* | `AriaLabelingProps & DOMProps` | Props to apply to the field container element being labeled. |
