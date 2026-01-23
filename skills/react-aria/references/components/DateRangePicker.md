# Date

RangePicker

DateRangePickers combine two DateFields and a RangeCalendar popover to allow users
to enter or select a date and time range.

## Vanilla 

CSS example

### Date

RangePicker.tsx

```tsx
'use client';
import {
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  DateValue,
  Group,
  ValidationResult
} from 'react-aria-components';
import {DateInput, DateSegment} from './DateField';
import {Description, FieldButton} from './Form';
import {Popover} from './Popover';
import {Label, FieldError} from './Form';
import {RangeCalendar} from './RangeCalendar';
import {ChevronDown} from 'lucide-react';
import './DateRangePicker.css';

export interface DateRangePickerProps<T extends DateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateRangePicker<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateRangePickerProps<T>
) {
  return (
    <AriaDateRangePicker {...props}>
      <Label>{label}</Label>
      <Group className="react-aria-Group inset">
        <div className="date-fields">
          <DateInput slot="start">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
          <span aria-hidden="true">–</span>
          <DateInput slot="end">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
        </div>
        <FieldButton><ChevronDown /></FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow>
        <RangeCalendar />
      </Popover>
    </AriaDateRangePicker>
  );
}

```

### Date

RangePicker.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-DateRangePicker {
  color: var(--text-color);
  max-width: 100%;

  .react-aria-Group {
    display: flex;
    align-items: center;
    width: fit-content;
    min-width: 220px;
    max-width: 100%;
    height: var(--spacing-8);
    box-sizing: border-box;
    overflow: clip;
    position: relative;
    padding: 0 var(--spacing-1) 0 var(--spacing-3);
    border-radius: var(--radius);
    font-size: var(--font-size);
    color: var(--field-text-color);
    white-space: nowrap;
    cursor: text;

    &[data-focus-within] {
      outline: 2px solid var(--focus-ring-color);
      outline-offset: -1px;
    }

    &[data-disabled] {
      color: var(--text-color-disabled);
    }
  }

  .date-fields {
    flex: 1;
    display: flex;
    align-items: center;
    width: fit-content;
    overflow-x: auto;
    overflow-y: clip;
    scrollbar-width: none;
  }

  .field-Button {
    margin-left: auto;
  }

  [slot=start] ~ span {
    padding: 0 4px;
  }

  [slot=end] {
    margin-right: 1.75rem;
    flex: 1;
  }

  .react-aria-DateInput {
    width: unset;
    min-width: unset;
    padding: unset;
    border: unset;
    box-shadow: none;
    background: none;
    height: auto;
    line-height: normal;
    &[data-focus-within] {
      outline: unset;
    }
  }
}

```

## Tailwind example

### Date

RangePicker.tsx

```tsx
'use client';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import {
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  DateValue,
  ValidationResult
} from 'react-aria-components';
import { DateInput } from './DateField';
import { Description, FieldError, FieldGroup, Label } from './Field';
import { Popover } from './Popover';
import { RangeCalendar } from './RangeCalendar';
import { composeTailwindRenderProps } from './utils';
import { FieldButton } from './FieldButton';

export interface DateRangePickerProps<T extends DateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateRangePicker<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateRangePickerProps<T>
) {
  return (
    <AriaDateRangePicker {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 font-sans max-w-full')}>
      {label && <Label>{label}</Label>}
      <FieldGroup className="min-w-[208px] w-auto cursor-text disabled:cursor-default">
        <div className="flex-1 w-fit flex items-center overflow-x-auto overflow-y-clip [scrollbar-width:none]">
          <DateInput slot="start" className="ps-3 pe-2 text-sm" />
          <span aria-hidden="true" className="text-neutral-800 dark:text-neutral-200 forced-colors:text-[ButtonText] group-disabled:text-neutral-200 dark:group-disabled:text-neutral-600 forced-colors:group-disabled:text-[GrayText]">–</span>
          <DateInput slot="end" className="flex-1 ps-2 pe-3 text-sm" />
        </div>
        <FieldButton className="w-6 mr-1 outline-offset-0">
          <CalendarIcon aria-hidden className="w-4 h-4" />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="p-2">
        <RangeCalendar />
      </Popover>
    </AriaDateRangePicker>
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the selected date range, using objects in the [@internationalized/date](internationalized/date/.md) package. This library supports parsing date strings in multiple formats, manipulation across international calendar systems, time zones, etc.

```tsx
import {parseDate, getLocalTimeZone, type CalendarDate} from '@internationalized/date';
import {useDateFormatter, type RangeValue} from 'react-aria';
import {DateRangePicker} from 'vanilla-starter/DateRangePicker';
import {useState} from 'react';

function Example() {
  let [range, setRange] = useState<RangeValue<CalendarDate> | null>({
    start: parseDate('2025-02-03'),
    end: parseDate('2025-02-12')
  });
  let formatter = useDateFormatter({ dateStyle: 'long' });

  return (
    <>
      <DateRangePicker
        value={range}
        onChange={setRange} />
        {/*- end highlight -*/}
      <p>Selected range: {range ? formatter.formatRange(
        range.start.toDate(getLocalTimeZone()),
        range.end.toDate(getLocalTimeZone())
      ) : '--'}</p>
    </>
  );
}
```

### Format options

The date format is automatically determined based on the user's locale. `DateRangePicker` supports several props to control how values are displayed.

```tsx
import {parseZonedDateTime} from '@internationalized/date';
import {DateRangePicker} from 'vanilla-starter/DateRangePicker';

<DateRangePicker
  
  defaultValue={{
    start: parseZonedDateTime('2025-02-03T08:45:00[America/Los_Angeles]'),
    end: parseZonedDateTime('2025-02-14T08:45:00[America/Los_Angeles]')
  }} />
```

### International calendars

By default, `DateRangePicker` displays the value using the calendar system for the user's locale. Use `<I18nProvider>` to override the calendar system by setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string). The `onChange` event always receives a date in the same calendar as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale.

```tsx
import {I18nProvider} from 'react-aria-components';
import {parseDate} from '@internationalized/date';
import {DateRangePicker} from 'vanilla-starter/DateRangePicker';

<I18nProvider>
  <DateRangePicker
    defaultValue={{
      start: parseDate('2025-02-03'),
      end: parseDate('2025-02-14')
    }} />
</I18nProvider>
```

## Forms

Use the `name` prop to submit the selected date to the server as an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string. Set the `isRequired`, `minValue`, or `maxValue` props to validate the value, or implement custom client or server-side validation. The `isDateUnavailable` callback prevents certain dates from being selected. Use `allowsNonContiguousRanges` to allow selecting ranges containing unavailable dates. See the [Forms](forms.md) guide to learn more.

```tsx
import {isWeekend, today, getLocalTimeZone} from '@internationalized/date';
import {useLocale} from 'react-aria-components';
import {DateRangePicker} from 'vanilla-starter/DateRangePicker';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';;

function Example(props) {
  let {locale} = useLocale();
  let now = today(getLocalTimeZone());
  let disabledRanges = [
    [now, now.add({ days: 5 })],
    [now.add({ days: 14 }), now.add({ days: 16 })],
    [now.add({ days: 23 }), now.add({ days: 24 })]
  ];

  return (
    <Form>
      <DateRangePicker
        {...props}
        label="Trip dates"
        startName="startDate"
        endName="endDate"
        
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
<DateRangePicker>
  <Label />
  <Group>
    <DateInput slot="start" />
    <DateInput slot="end" />
    <Button />
  </Group>
  <Text slot="description" />
  <FieldError />
  <Popover>
    <RangeCalendar />
  </Popover>
</DateRangePicker>
```

### Date

RangePicker

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `allowsNonContiguousRanges` | `boolean | undefined` | — | When combined with `isDateUnavailable`, determines whether non-contiguous ranges, i.e. ranges containing unavailable dates, may be selected. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `contextualHelp` | `ReactNode` | — | A ContextualHelp element to place next to the label. |
| `createCalendar` | `((identifier: CalendarIdentifier) => Calendar) | undefined` | — | A function to create a new [Calendar](https://react-spectrum.adobe.com/internationalized/date/Calendar.html) object for a given calendar identifier. If not provided, the `createCalendar` function from `@internationalized/date` will be used. |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `defaultValue` | `RangeValue<T> | null | undefined` | — | The default value (uncontrolled). |
| `description` | `ReactNode` | — | A description for the field. Provides a hint such as specific requirements for what to choose. |
| `endName` | `string | undefined` | — | The name of the end date input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `errorMessage` | `ReactNode | ((v: ValidationResult) => ReactNode)` | — | An error message for the field. |
| `firstDayOfWeek` | `"sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | undefined` | — | The day that starts the week. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `granularity` | `Granularity | undefined` | — | Determines the smallest unit that is displayed in the date picker. By default, this is `"day"` for dates, and `"minute"` for times. |
| `hideTimeZone` | `boolean | undefined` | false | Whether to hide the time zone abbreviation. |
| `hourCycle` | `12 | 24 | undefined` | — | Whether to display the time in 12 or 24 hour format. By default, this is determined by the user's locale. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDateUnavailable` | `((date: DateValue) => boolean) | undefined` | — | Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `label` | `ReactNode` | — | The content to display as the label. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `maxValue` | `DateValue | null | undefined` | — | The maximum allowed date that a user may select. |
| `maxVisibleMonths` | `number | undefined` | 1 | The maximum number of months to display at once in the calendar popover, if screen space permits. |
| `minValue` | `DateValue | null | undefined` | — | The minimum allowed date that a user may select. |
| `necessityIndicator` | `NecessityIndicator | undefined` | 'icon' | Whether the required state should be shown as an icon or text. |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((value: RangeValue<MappedDateValue<T>> | null) => void) | undefined` | — | Handler that is called when the value changes. |
| `onFocus` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Handler that is called when the overlay's open state changes. |
| `pageBehavior` | `PageBehavior | undefined` | visible | Controls the behavior of paging. Pagination either works by advancing the visible page by visibleDuration (default) or one unit of visibleDuration. |
| `placeholderValue` | `T | null | undefined` | — | A placeholder date that influences the format of the placeholder shown when no value is selected. Defaults to today's date at midnight. |
| `shouldCloseOnSelect` | `boolean | (() => boolean) | undefined` | true | Determines whether the date picker popover should close automatically when a date is selected. |
| `shouldFlip` | `boolean | undefined` | true | Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely. |
| `shouldForceLeadingZeros` | `boolean | undefined` | — | Whether to always show leading zeros in the month, day, and hour fields. By default, this is determined by the user's locale. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the DateField. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `startName` | `string | undefined` | — | The name of the start date input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `validate` | `((value: RangeValue<MappedDateValue<T>>) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `RangeValue<T> | null | undefined` | — | The current value (controlled). |
