# Date

Picker

A date picker combines a DateField and a Calendar popover to allow users to enter or select a date and time value.

## Vanilla 

CSS example

### Date

Picker.tsx

```tsx
'use client';
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateValue,
  Group,
  ValidationResult
} from 'react-aria-components';
import {DateInput, DateSegment} from './DateField';
import {Label, FieldError, Description} from './Form';
import {FieldButton} from './Form';
import {Calendar} from './Calendar';
import {Popover} from './Popover';
import {ChevronDown} from 'lucide-react';

import './DatePicker.css';

export interface DatePickerProps<T extends DateValue> extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DatePicker<T extends DateValue>(
  { label, description, errorMessage, ...props }: DatePickerProps<T>
) {
  return (
    <AriaDatePicker {...props}>
      <Label>{label}</Label>
      <Group>
        <DateInput>
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <FieldButton><ChevronDown /></FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow>
        <Calendar />
      </Popover>
    </AriaDatePicker>
  );
}

```

### Date

Picker.css

```css
@import "./theme.css";

.react-aria-DatePicker {
  max-width: 100%;

  .react-aria-Group {
    display: flex;
    width: 100%;
    align-items: center;
    height: var(--spacing-8);
  }

  .react-aria-DateInput {
    flex: 1;
    min-width: 0;
    padding-right: var(--spacing-10);
    overflow-x: auto;
    overflow-y: clip;
    scrollbar-width: none;
  }
}

```

## Tailwind example

### Date

Picker.tsx

```tsx
'use client';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateValue,
  ValidationResult
} from 'react-aria-components';
import { Calendar } from './Calendar';
import { DateInput } from './DateField';
import { Description, FieldError, FieldGroup, Label } from './Field';
import { Popover } from './Popover';
import { composeTailwindRenderProps } from './utils';
import { FieldButton } from './FieldButton';

export interface DatePickerProps<T extends DateValue>
  extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DatePicker<T extends DateValue>(
  { label, description, errorMessage, ...props }: DatePickerProps<T>
) {
  return (
    <AriaDatePicker {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 font-sans')}>
      {label && <Label>{label}</Label>}
      <FieldGroup className="min-w-[208px] w-auto cursor-text disabled:cursor-default">
        <DateInput className="flex-1 min-w-[150px] px-3 text-sm" />
        <FieldButton className="w-6 mr-1 outline-offset-0">
          <CalendarIcon aria-hidden className="w-4 h-4" />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="p-2">
        <Calendar />
      </Popover>
    </AriaDatePicker>
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the date value, using objects in the [@internationalized/date](internationalized/date/.md) package. This library supports parsing date strings in multiple formats, manipulation across international calendar systems, time zones, etc.

```tsx
import {parseDate, getLocalTimeZone, type CalendarDate} from '@internationalized/date';
import {useDateFormatter} from 'react-aria';
import {DatePicker} from 'vanilla-starter/DatePicker';
import {useState} from 'react';

function Example() {
  let [date, setDate] = useState<CalendarDate | null>(parseDate('2020-02-03'));
  let formatter = useDateFormatter({ dateStyle: 'full' });

  return (
    <>
      <DatePicker
        value={date}
        onChange={setDate} />
        {/*- end highlight -*/}
      <p>Selected date: {date ? formatter.format(date.toDate(getLocalTimeZone())) : '--'}</p>
    </>
  );
}
```

### Format options

The date format is automatically determined based on the user's locale. `DatePicker` supports several props to control how values are displayed.

```tsx
import {parseZonedDateTime} from '@internationalized/date';
import {DatePicker} from 'vanilla-starter/DatePicker';

<DatePicker
  
  defaultValue={parseZonedDateTime('2025-02-03T08:45:00[America/Los_Angeles]')} />
```

### International calendars

By default, `DatePicker` displays the value using the calendar system for the user's locale. Use `<I18nProvider>` to override the calendar system by setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string). The `onChange` event always receives a date in the same calendar as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale.

```tsx
import {I18nProvider} from 'react-aria-components';
import {parseZonedDateTime} from '@internationalized/date';
import {DatePicker} from 'vanilla-starter/DatePicker';

<I18nProvider>
  <DatePicker defaultValue={parseZonedDateTime('2025-02-03T08:45:00[America/Los_Angeles]')} />
</I18nProvider>
```

## Forms

Use the `name` prop to submit the selected date to the server as an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string. Set the `isRequired`, `minValue`, or `maxValue` props to validate the value, or implement custom client or server-side validation. The `isDateUnavailable` callback prevents certain dates from being selected. See the [Forms](forms.md) guide to learn more.

```tsx
import {isWeekend, today, getLocalTimeZone} from '@internationalized/date';
import {useLocale} from 'react-aria-components';
import {DatePicker} from 'vanilla-starter/DatePicker';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';;

function Example() {
  let {locale} = useLocale();
  let now = today(getLocalTimeZone());
  let disabledRanges = [
    [now, now.add({ days: 5 })],
    [now.add({ days: 14 }), now.add({ days: 16 })],
    [now.add({ days: 23 }), now.add({ days: 24 })]
  ];

  return (
    <Form>
      <DatePicker
        label="Appointment date"
        name="date"
        isRequired
        minValue={today(getLocalTimeZone())}
        isDateUnavailable={date => (
          isWeekend(date, locale) ||
          disabledRanges.some((interval) =>
            date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0
          )
        )}
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## A

PI

```tsx
<DatePicker>
  <Label />
  <Group>
    <DateInput />
    <Button />
  </Group>
  <Text slot="description" />
  <FieldError />
  <Popover>
    <Calendar />
  </Popover>
</DatePicker>
```

### Date

Picker

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoComplete` | `string | undefined` | — | Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete). |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<DatePickerRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<DatePickerRenderProps> | undefined` | 'react-aria-DatePicker' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `defaultValue` | `T | null | undefined` | — | The default value (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `firstDayOfWeek` | `"sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | undefined` | — | The day that starts the week. |
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
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `isTriggerUpWhenOpen` | `boolean | undefined` | — | Whether the trigger is up when the overlay is open. |
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
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Handler that is called when the overlay's open state changes. |
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
| `pageBehavior` | `PageBehavior | undefined` | visible | Controls the behavior of paging. Pagination either works by advancing the visible page by visibleDuration (default) or one unit of visibleDuration. |
| `placeholderValue` | `T | null | undefined` | — | A placeholder date that influences the format of the placeholder shown when no value is selected. Defaults to today's date at midnight. |
| `shouldCloseOnSelect` | `boolean | (() => boolean) | undefined` | true | Determines whether the date picker popover should close automatically when a date is selected. |
| `shouldForceLeadingZeros` | `boolean | undefined` | — | Whether to always show leading zeros in the month, day, and hour fields. By default, this is determined by the user's locale. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: DatePickerRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `validate` | `((value: MappedDateValue<T>) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `T | null | undefined` | — | The current value (controlled). |
