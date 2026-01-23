# Date

Field

A date field allows users to enter and edit date and time values using a keyboard.
Each part of a date value is displayed in an individually editable segment.

## Vanilla 

CSS example

### Date

Field.tsx

```tsx
'use client';
import {
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  DateInputProps,
  DateSegment as AriaDateSegment,
  DateSegmentProps,
  DateValue,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError, Description} from './Form';
import './DateField.css';

export interface DateFieldProps<T extends DateValue>
  extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateField<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateFieldProps<T>
) {
  return (
    <AriaDateField {...props}>
      <Label>{label}</Label>
      <DateInput>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}

export function DateSegment(props: DateSegmentProps) {
  return <AriaDateSegment {...props} />;
}

export function DateInput(props: DateInputProps) {
  return <AriaDateInput {...props} className="react-aria-DateInput inset" />;
}

```

### Date

Field.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-DateField {
  display: flex;
  flex-direction: column;
}

.react-aria-DateInput {
  display: inline;
  padding: 0 var(--spacing-3);
  box-sizing: border-box;
  border-radius: var(--radius);
  font: var(--font-size) system-ui;
  color: var(--field-text-color);
  height: var(--spacing-8);
  line-height: var(--spacing-8);
  width: fit-content;
  min-width: 150px;
  white-space: nowrap;
  forced-color-adjust: none;
  cursor: text;

  &[data-focus-within] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: -1px;
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
    cursor: default;
  }
}

.react-aria-DateSegment {
  padding: 2px;
  font-size: var(--font-size);
  font-variant-numeric: tabular-nums;
  text-align: end;
  color: var(--field-text-color);
  -webkit-tap-highlight-color: transparent;

  &[data-type=literal] {
    padding: 0;
  }

  &[data-placeholder] {
    color: var(--text-color-placeholder);
  }

  &:focus {
    color: var(--highlight-foreground);
    background: var(--highlight-background);
    outline: none;
    border-radius: 4px;
    caret-color: transparent;
  }

  &[data-invalid] {
    color: var(--invalid-color);

    &:focus {
      background: var(--highlight-background-invalid);
      color: var(--highlight-foreground);
    }
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
    cursor: default;
  }
}

```

## Tailwind example

### Date

Field.tsx

```tsx
'use client';
import React from 'react';
import {
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  DateInputProps,
  DateSegment,
  DateValue,
  ValidationResult
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Label, fieldGroupStyles } from './Field';
import { composeTailwindRenderProps } from './utils';

export interface DateFieldProps<T extends DateValue> extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateField<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateFieldProps<T>
) {
  return (
    <AriaDateField {...props} className={composeTailwindRenderProps(props.className, 'flex flex-col gap-1')}>
      {label && <Label>{label}</Label>}
      <DateInput />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}

const segmentStyles = tv({
  base: 'inline p-0.5 whitespace-nowrap type-literal:p-0 rounded-xs outline outline-0 forced-color-adjust-none caret-transparent text-neutral-800 dark:text-neutral-200 forced-colors:text-[ButtonText] [-webkit-tap-highlight-color:transparent]',
  variants: {
    isPlaceholder: {
      true: 'text-neutral-600 dark:text-neutral-400'
    },
    isDisabled: {
      true: 'text-neutral-200 dark:text-neutral-600 forced-colors:text-[GrayText]'
    },
    isFocused: {
      true: 'bg-blue-600 text-white dark:text-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
    }
  }
});

export function DateInput(props: Omit<DateInputProps, 'children'>) {
  return (
    <AriaDateInput className={renderProps => fieldGroupStyles({...renderProps, class: 'inline min-w-[150px] px-3 h-9 text-sm leading-8.5 font-sans cursor-text disabled:cursor-default whitespace-nowrap overflow-x-auto [scrollbar-width:none]'})} {...props}>
      {(segment) => <DateSegment segment={segment} className={segmentStyles} />}
    </AriaDateInput>
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the date value, using objects in the [@internationalized/date](internationalized/date/.md) package. This library supports parsing date strings in multiple formats, manipulation across international calendar systems, time zones, etc.

```tsx
import {parseDate, getLocalTimeZone, type CalendarDate} from '@internationalized/date';
import {useDateFormatter} from 'react-aria';
import {DateField} from 'vanilla-starter/DateField';
import {useState} from 'react';

function Example() {
  let [date, setDate] = useState<CalendarDate | null>(parseDate('2020-02-03'));
  let formatter = useDateFormatter({ dateStyle: 'full' });

  return (
    <>
      <DateField
        value={date}
        onChange={setDate} />
      {/*- end highlight -*/}
      <p>Selected date: {date ? formatter.format(date.toDate(getLocalTimeZone())) : '--'}</p>
    </>
  );
}
```

### Format options

The date format is automatically determined based on the user's locale. `DateField` supports several props to control how values are displayed.

```tsx
import {parseZonedDateTime} from '@internationalized/date';
import {DateField} from 'vanilla-starter/DateField';

<DateField
  
  defaultValue={parseZonedDateTime('2025-02-03T08:45:00[America/Los_Angeles]')} />
```

### International calendars

By default, `DateField` displays the value using the calendar system for the user's locale. Use `<I18nProvider>` to override the calendar system by setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string). The `onChange` event always receives a date in the same calendar as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale.

```tsx
import {I18nProvider} from 'react-aria-components';
import {parseZonedDateTime} from '@internationalized/date';
import {DateField} from 'vanilla-starter/DateField';

<I18nProvider>
  <DateField defaultValue={parseZonedDateTime('2025-02-03T08:45:00[America/Los_Angeles]')} />
</I18nProvider>
```

## Forms

Use the `name` prop to submit the selected date to the server as an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string. Set the `isRequired`, `minValue`, or `maxValue` props to validate the value, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {today, getLocalTimeZone} from '@internationalized/date';
import {DateField} from 'vanilla-starter/DateField';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';;

<Form>
  <DateField
    label="Appointment date"
    name="date"
    isRequired
    minValue={today(getLocalTimeZone())}
  />
  <Button type="submit">Submit</Button>
</Form>
```

## A

PI

```tsx
<DateField>
  <Label />
  <DateInput>
    {segment => <DateSegment segment={segment} />}
  </DateInput>
  <Text slot="description" />
  <FieldError />
</DateField>
```

### Date

Field

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoComplete` | `string | undefined` | — | Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete). |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<DateFieldRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<DateFieldRenderProps> | undefined` | 'react-aria-DateField' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultValue` | `T | null | undefined` | — | The default value (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `granularity` | `Granularity | undefined` | — | Determines the smallest unit that is displayed in the date picker. By default, this is `"day"` for dates, and `"minute"` for times. |
| `hidden` | `boolean | undefined` | — |  |
| `hideTimeZone` | `boolean | undefined` | false | Whether to hide the time zone abbreviation. |
| `hourCycle` | `12 | 24 | undefined` | — | Whether to display the time in 12 or 24 hour format. By default, this is determined by the user's locale. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isDateUnavailable` | `((date: DateValue) => boolean) | undefined` | — | Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `lang` | `string | undefined` | — |  |
| `maxValue` | `DateValue | null | undefined` | — | The maximum allowed date that a user may select. |
| `minValue` | `DateValue | null | undefined` | — | The minimum allowed date that a user may select. |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((value: MappedDateValue<T> | null) => void) | undefined` | — | Handler that is called when the value changes. |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
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
| `placeholderValue` | `T | null | undefined` | — | A placeholder date that influences the format of the placeholder shown when no value is selected. Defaults to today's date at midnight. |
| `shouldForceLeadingZeros` | `boolean | undefined` | — | Whether to always show leading zeros in the month, day, and hour fields. By default, this is determined by the user's locale. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: DateFieldRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `validate` | `((value: MappedDateValue<T>) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
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
