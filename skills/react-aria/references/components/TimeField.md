# Time

Field

TimeFields allow users to enter and edit time values using a keyboard.
Each part of the time is displayed in an individually editable segment.

## Vanilla 

CSS example

### Time

Field.tsx

```tsx
'use client';
import {
  TimeField as AriaTimeField,
  TimeFieldProps as AriaTimeFieldProps,
  TimeValue,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError, Description} from './Form';
import {DateInput, DateSegment} from './DateField';
import './TimeField.css';

export interface TimeFieldProps<T extends TimeValue>
  extends AriaTimeFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TimeField<T extends TimeValue>(
  { label, description, errorMessage, ...props }: TimeFieldProps<T>
) {
  return (
    <AriaTimeField {...props}>
      <Label>{label}</Label>
      <DateInput>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}

```

### Time

Field.css

```css
@import "./theme.css";

.react-aria-TimeField {
  display: flex;
  flex-direction: column;
}

```

## Tailwind example

### Time

Field.tsx

```tsx
'use client';
import React from 'react';
import {
  TimeField as AriaTimeField,
  TimeFieldProps as AriaTimeFieldProps,
  TimeValue,
  ValidationResult
} from 'react-aria-components';
import { DateInput } from './DateField';
import { Description, FieldError, Label } from './Field';
import { composeTailwindRenderProps } from './utils';

export interface TimeFieldProps<T extends TimeValue>
  extends AriaTimeFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TimeField<T extends TimeValue>(
  { label, description, errorMessage, ...props }: TimeFieldProps<T>
) {
  return (
    <AriaTimeField {...props} className={composeTailwindRenderProps(props.className, 'flex flex-col gap-1 font-sans')}>
      <Label>{label}</Label>
      <DateInput />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the time value, using objects in the [@internationalized/date](internationalized/date/.md) package. `TimeField` accepts plain [Time](internationalized/date/Time.md), [CalendarDateTime](internationalized/date/CalendarDateTime.md), or [ZonedDateTime](internationalized/date/ZonedDateTime.md), but only displays the time.

```tsx
import {Time} from '@internationalized/date';
import {TimeField} from 'vanilla-starter/TimeField';
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
import {TimeField} from 'vanilla-starter/TimeField';

<TimeField
  
  defaultValue={parseZonedDateTime('2025-02-03T17:45:00[America/Los_Angeles]')} />
```

## Forms

Use the `name` prop to submit the selected date to the server as an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string. Set the `isRequired`, `minValue`, or `maxValue` props to validate the value, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {Time} from '@internationalized/date';
import {TimeField} from 'vanilla-starter/TimeField';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';;

<Form>
  <TimeField
    label="Appointment time"
    name="time"
    isRequired
    minValue={new Time(9)}
    maxValue={new Time(17)}
    validate={time => time?.minute % 15 !== 0 ? 'Appointments start every 15 minutes.' : null}
  />
  <Button type="submit">Submit</Button>
</Form>
```

## A

PI

```tsx
<TimeField>
  <Label />
  <DateInput>
    {segment => <DateSegment segment={segment} />}
  </DateInput>
  <Text slot="description" />
  <FieldError />
</TimeField>
```

### Time

Field

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

### Date

Input

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `(segment: IDateSegment) => ReactElement` | — |  |
| `className` | `ClassNameOrFunction<DateInputRenderProps> | undefined` | 'react-aria-DateInput' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: DateInputRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Date

Segment

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<DateSegmentRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<DateSegmentRenderProps> | undefined` | 'react-aria-DateSegment' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLSpanElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLSpanElement> | undefined` | — |  |
| `segment` | `IDateSegment` | — |  |
| `style` | `(React.CSSProperties | ((values: DateSegmentRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
