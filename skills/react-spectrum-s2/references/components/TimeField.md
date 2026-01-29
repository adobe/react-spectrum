# Time

Field

TimeFields allow users to enter and edit time values using a keyboard.
Each part of the time is displayed in an individually editable segment.

```tsx
import {TimeField} from '@react-spectrum/s2';

<TimeField />
```

## Value

Use the `value` or `defaultValue` prop to set the time value, using objects in the [@internationalized/date](react-aria:internationalized/date/.md) package. `TimeField` accepts plain [Time](react-aria:internationalized/date/Time.md), [CalendarDateTime](react-aria:internationalized/date/CalendarDateTime.md), or [ZonedDateTime](react-aria:internationalized/date/ZonedDateTime.md), but only displays the time.

```tsx
import {Time} from '@internationalized/date';
import {TimeField} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [time, setTime] = useState<Time | null>(new Time(11, 45));
  
  return (
    <>
      <TimeField
        value={time}
        onChange={setTime} />
      {/*- end highlight -*/}
      <p>Selected time: {time ? time.toString() : '--'}</p>
    </>
  );
}
```

### Format options

The time format is automatically determined based on the user's locale. `TimeField` supports several props to control how values are displayed.

```tsx
import {parseZonedDateTime} from '@internationalized/date';
import {TimeField} from '@react-spectrum/s2';

<TimeField
  
  defaultValue={parseZonedDateTime('2025-02-03T17:45:00[America/Los_Angeles]')} />
```

## Forms

Use the `name` prop to submit the selected date to the server as an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string. Set the `isRequired`, `minValue`, or `maxValue` props to validate the value, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {Time} from '@internationalized/date';
import {TimeField, Form, Button} from '@react-spectrum/s2';

function Example(props) {
  return (
    <Form>
      <TimeField
        {...props}
        label="Appointment time"
        name="time"
        
        minValue={new Time(9)}
        maxValue={new Time(17)}
        validate={time => time?.minute % 15 !== 0 ? 'Appointments start every 15 minutes.' : null}
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `contextualHelp` | `ReactNode` | — | A ContextualHelp element to place next to the label. |
| `defaultValue` | `T | null | undefined` | — | The default value (uncontrolled). |
| `description` | `ReactNode` | — | A description for the field. Provides a hint such as specific requirements for what to choose. |
| `errorMessage` | `ReactNode | ((v: ValidationResult) => ReactNode)` | — | An error message for the field. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `granularity` | `"hour" | "minute" | "second" | undefined` | 'minute' | Determines the smallest unit that is displayed in the time picker. |
| `hideTimeZone` | `boolean | undefined` | — | Whether to hide the time zone abbreviation. |
| `hourCycle` | `12 | 24 | undefined` | — | Whether to display the time in 12 or 24 hour format. By default, this is determined by the user's locale. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `label` | `ReactNode` | — | The content to display as the label. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `maxValue` | `TimeValue | null | undefined` | — | The maximum allowed time that a user may select. |
| `minValue` | `TimeValue | null | undefined` | — | The minimum allowed time that a user may select. |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `necessityIndicator` | `NecessityIndicator | undefined` | 'icon' | Whether the required state should be shown as an icon or text. |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((value: MappedTimeValue<T> | null) => void) | undefined` | — | Handler that is called when the value changes. |
| `onFocus` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `placeholderValue` | `T | undefined` | — | A placeholder time that influences the format of the placeholder shown when no value is selected. Defaults to 12:00 AM or 00:00 depending on the hour cycle. |
| `shouldForceLeadingZeros` | `boolean | undefined` | — | Whether to always show leading zeros in the hour field. By default, this is determined by the user's locale. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the TimeField. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `validate` | `((value: MappedTimeValue<T>) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `T | null | undefined` | — | The current value (controlled). |
