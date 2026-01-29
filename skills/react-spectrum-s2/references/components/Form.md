# Form

Forms allow users to enter data that can be submitted while providing alignment and styling for form fields.

```tsx
import {Form, TextField, Checkbox, ButtonGroup, Button} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<Form>
  <TextField label="Name" placeholder="Enter your full name" />
  <TextField label="Email" type="email" placeholder="Enter your email" />
  <Checkbox>I agree to the terms</Checkbox>
  <ButtonGroup styles={style({gridColumnStart: 'field'})}>
    <Button type="submit" variant="primary">Submit</Button>
    <Button type="reset" variant="secondary">Reset</Button>
  </ButtonGroup>
</Form>
```

## Submitting data

When using React 19, use the `action` prop to handle form submission. This receives a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object containing the values for each form field. In React 18 or earlier, use the `onSubmit` event instead. See the [Forms](forms.md) guide details about integrating with frameworks.

## Vanilla 

CSS example

```tsx
import {Form, TextField, Button} from '@react-spectrum/s2';

<Form
  /*- begin highlight -*/
  action={formData => {
    let name = formData.get('name');
    alert(`Hello, ${name}!`);
  }}>
  {/*- end highlight -*/}
  <TextField name="name" label="Name" placeholder="Enter your full name" />
  <Button type="submit">Submit</Button>
</Form>
```

```tsx
import {Form, TextField, Button} from '@react-spectrum/s2';

<Form
  /*- begin highlight -*/
  onSubmit={event => {
    // Prevent default browser page refresh.
    event.preventDefault();

    // Get data from form.
    let target = event.target as HTMLFormElement;
    let formData = new FormData(target);
    let name = formData.get('name');
    alert(`Hello, ${name}!`);

    // Reset form after submission.
    target.reset();
  }}>
  {/*- end highlight -*/}
  <TextField name="name" label="Name" placeholder="Enter your full name" />
  <Button type="submit">Submit</Button>
</Form>
```

## Validation

Use validation props on each form field to prevent submission of invalid values. When `validationBehavior="aria"`, form submission will not be prevented and validation will occur as the value is edited instead of on form submission. See the [Forms](forms.md) guide for more details.

```tsx
import {Form, TextField, Button} from '@react-spectrum/s2';

<Form>
  <TextField
    label="Username"
    placeholder="Choose a username"
    isRequired
    validate={value => value === 'admin' ? 'Nice try.' : null}
    name="username"
    defaultValue="admin" />
  <Button type="submit">Submit</Button>
</Form>
```

### Server validation

Use the `validationErrors` prop to provide server validation errors to the fields within a `<Form>`.

```tsx
import {Form, TextField} from '@react-spectrum/s2';

<Form
  /*- begin highlight -*/
  validationErrors={{
    username: 'This username is not available.'
  }}>
  {/*- end highlight -*/}
  <TextField
    name="username"
    label="Username"
    placeholder="Choose a username"
    defaultValue="admin" />
</Form>
```

### Focus management

By default, after a user submits a form with validation errors, the first invalid field will be focused. To prevent this, call `preventDefault()` in the `onInvalid` event. This example moves focus to an [alert](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alert_role) at the top of the form.

```tsx
import {Form, TextField, Button, InlineAlert, Heading, Content} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'}
import {useState} from 'react';

function Example() {
  let [isInvalid, setInvalid] = useState(false);

  return (
    <Form
      styles={style({width: 300, maxWidth: 'full'})}
      /*- begin highlight -*/
      onInvalid={e => {
        e.preventDefault();
        setInvalid(true);
      }}
      /*- end highlight -*/
      onSubmit={e => {
        e.preventDefault();
        setInvalid(false);
      }}
      onReset={() => setInvalid(false)}>
      {isInvalid &&
        <InlineAlert variant="negative" autoFocus>
          <Heading>Unable to submit</Heading>
          <Content>Please fix the validation errors below, and re-submit the form.</Content>
        </InlineAlert>
      }
      <TextField
        name="firstName"
        isRequired
        label="First name"
        placeholder="Enter your first name" />
      <TextField
        name="lastName"
        isRequired
        label="Last name"
        placeholder="Enter your last name" />
      <div className={style({display: 'flex', gap: 8})}>
        <Button type="submit" variant="accent">Submit</Button>
        <Button type="reset" variant="secondary">Reset</Button>
      </div>
    </Form>
  );
}
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `string | ((formData: FormData) => void | Promise<void>) | undefined` | — | Where to send the form-data when the form is submitted. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#action). |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoCapitalize` | `"none" | "off" | "on" | "sentences" | "words" | "characters" | undefined` | — | Controls whether inputted text is automatically capitalized and, if so, in what manner.  See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize). |
| `autoComplete` | `"off" | "on" | undefined` | — | Indicates whether input elements can by default have their values automatically completed by the browser. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#autocomplete). |
| `children` | `ReactNode` | — |  |
| `encType` | `"application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain" | undefined` | — | The enctype attribute specifies how the form-data should be encoded when submitting it to the server. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#enctype). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the Form elements are disabled. |
| `isEmphasized` | `boolean | undefined` | — | Whether the Form elements are rendered with their emphasized style. |
| `isRequired` | `boolean | undefined` | — | Whether the label is labeling a required field or group. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `method` | `"dialog" | "get" | "post" | undefined` | — | The HTTP method to submit the form with. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#method). |
| `necessityIndicator` | `NecessityIndicator | undefined` | 'icon' | Whether the required state should be shown as an icon or text. |
| `onInvalid` | `((event: FormEvent<HTMLFormElement>) => void) | undefined` | — | Triggered for each invalid field when a user submits the form. |
| `onReset` | `((event: FormEvent<HTMLFormElement>) => void) | undefined` | — | Triggered when a user resets the form. |
| `onSubmit` | `((event: FormEvent<HTMLFormElement>) => void) | undefined` | — | Triggered when a user submits the form. |
| `role` | `"search" | "presentation" | undefined` | — | An ARIA role override to apply to the form element. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | Size of the Form elements. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `"_self" | "_blank" | "_parent" | "_top" | undefined` | — | The target attribute specifies a name or a keyword that indicates where to display the response that is received after submitting the form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#target). |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when a field value is missing or invalid, or mark fields as required or invalid via ARIA. |
| `validationErrors` | `ValidationErrors | undefined` | — | Validation errors for the form, typically returned by a server. This should be set to an object mapping from input names to errors. |
