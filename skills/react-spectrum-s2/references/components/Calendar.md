# Calendar

Calendars display a grid of days in one or more months and allow users to select a single date.

```tsx
import {Calendar} from '@react-spectrum/s2';

<Calendar />
```

## Value

Use the `value` or `defaultValue` prop to set the date value, using objects in the [@internationalized/date](react-aria:internationalized/date/.md) package. This library supports parsing date strings in multiple formats, manipulation across international calendar systems, time zones, etc.

```tsx
import {parseDate, getLocalTimeZone} from '@internationalized/date';
import {Calendar} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [date, setDate] = useState(parseDate('2020-02-03'));
  
  return (
    <>
      <Calendar
        value={date}
        onChange={setDate}
      />
      <p>Selected date: {date.toDate(getLocalTimeZone()).toLocaleDateString()}</p>
    </>
  );
}
```

### International calendars

By default, `Calendar` displays the value using the calendar system for the user's locale. Use `<Provider>` to override the calendar system by setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string). The `onChange` event always receives a date in the same calendar as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale.

```tsx
import {Provider, Calendar} from '@react-spectrum/s2';
import {parseDate} from '@internationalized/date';

<Provider>
  <Calendar defaultValue={parseDate('2025-02-03')} />
</Provider>
```

### Custom calendar systems

`Calendar` also supports custom calendar systems that implement custom business rules, for example a fiscal year calendar that follows a [4-5-4 format](https://nrf.com/resources/4-5-4-calendar), where month ranges don't follow the usual Gregorian calendar. See the [@internationalized/date docs](react-aria:internationalized/date/Calendar.md#custom-calendars) for an example implementation.

```tsx
import type {AnyCalendarDate, Calendar as ICalendar} from '@internationalized/date';
import {CalendarDate, startOfWeek, GregorianCalendar} from '@internationalized/date';
import {Calendar} from '@react-spectrum/s2';

export default function Example() {
  return (
    <Calendar
      firstDayOfWeek="sun"
      createCalendar={() => new Custom454()} />
  );
}

// See @internationalized/date docs linked above.
class Custom454 extends GregorianCalendar {
  // The anchor date, in Gregorian calendar.
  // The anchor date is a date that occurs in the first week of the first month of every fiscal year.
  anchorDate = new CalendarDate(2001, 2, 4);

  private getYear(year: number): [CalendarDate, number[]] {
    let anchor = this.anchorDate.set({year});
    let startOfYear = startOfWeek(anchor, 'en', 'sun');
    let isBigYear = !startOfYear.add({weeks: 53}).compare(anchor.add({years: 1}));
    let weekPattern = [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, isBigYear ? 5 : 4];
    return [startOfYear, weekPattern];
  }

  getDaysInMonth(date: AnyCalendarDate): number {
    let [, weekPattern] = this.getYear(date.year);
    return weekPattern[date.month - 1] * 7;
  }

  fromJulianDay(jd: number): CalendarDate {
    let gregorian = super.fromJulianDay(jd);
    let year = gregorian.year;

    let [monthStart, weekPattern] = this.getYear(year);
    if (gregorian.compare(monthStart) < 0) {
      year--;
      [monthStart, weekPattern] = this.getYear(year);
    }

    for (let month = 1; month <= 12; month++) {
      let weeks = weekPattern[month - 1];
      let nextMonth = monthStart.add({weeks});
      if (nextMonth.compare(gregorian) > 0) {
        let days = gregorian.compare(monthStart);
        return new CalendarDate(this, year, month, days + 1);
      }
      monthStart = nextMonth;
    }

    throw new Error('date not found');
  }

  toJulianDay(date: AnyCalendarDate): number {
    let [monthStart, weekPattern] = this.getYear(date.year);
    for (let month = 1; month < date.month; month++) {
      monthStart = monthStart.add({weeks: weekPattern[month - 1]});
    }

    let gregorian = monthStart.add({days: date.day - 1});
    return super.toJulianDay(gregorian);
  }

  getFormattableMonth(date: AnyCalendarDate): CalendarDate {
    let anchorMonth = this.anchorDate.month - 1;
    let dateMonth = date.month - 1;
    let month = ((anchorMonth + dateMonth) % 12) + 1;
    let year = anchorMonth + dateMonth >= 12 ? date.year + 1 : date.year;
    return new CalendarDate(year, month, 1);
  }

  isEqual(other: ICalendar): boolean {
    return other instanceof Custom454 && other.anchorDate.compare(this.anchorDate) === 0;
  }
}
```

## Validation

Use the `minValue` and `maxValue` props to set the valid date range. The `isDateUnavailable` callback prevents certain dates from being selected. For custom validation rules, set the `isInvalid` and `errorMessage` props.

```tsx
import {isWeekend, today, getLocalTimeZone} from '@internationalized/date';
import {Calendar, useLocale} from '@react-spectrum/s2';

function Example(props) {
  let {locale} = useLocale();
  let now = today(getLocalTimeZone());
  let disabledRanges = [
    [now, now.add({ days: 5 })],
    [now.add({ days: 14 }), now.add({ days: 16 })],
    [now.add({ days: 23 }), now.add({ days: 24 })]
  ];

  return (
    <Calendar
      {...props}
      aria-label="Appointment date"
      
      minValue={today(getLocalTimeZone())}
      isDateUnavailable={date => (
        isWeekend(date, locale) ||
        disabledRanges.some((interval) =>
          date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0
        )
      )} />
  );
}
```

## Controlling the focused date

Use the `focusedValue` or `defaultFocusedValue` prop to control which date is focused. This controls which month is visible. The `onFocusChange` event is called when a date is focused by the user.

```tsx
import {Calendar, ActionButton} from '@react-spectrum/s2';
import {CalendarDate, today, getLocalTimeZone} from '@internationalized/date';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

function Example() {
  let defaultDate = new CalendarDate(2021, 7, 1);
  let [focusedDate, setFocusedDate] = useState(defaultDate);

  return (
    <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8})}>
      <ActionButton onPress={() => setFocusedDate(today(getLocalTimeZone()))}>
        Today
      </ActionButton>
      <Calendar
        focusedValue={focusedDate}
        onFocusChange={setFocusedDate}
      />
    </div>
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
| `autoFocus` | `boolean | undefined` | false | Whether to automatically focus the calendar when it mounts. |
| `createCalendar` | `((identifier: CalendarIdentifier) => Calendar) | undefined` | — | A function to create a new [Calendar](https://react-spectrum.adobe.com/internationalized/date/Calendar.html) object for a given calendar identifier. If not provided, the `createCalendar` function from `@internationalized/date` will be used. |
| `defaultFocusedValue` | `DateValue | null | undefined` | — | The date that is focused when the calendar first mounts (uncontrolled). |
| `defaultValue` | `T | null | undefined` | — | The default value (uncontrolled). |
| `errorMessage` | `React.ReactNode` | — | The error message to display when the calendar is invalid. |
| `firstDayOfWeek` | `"sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | undefined` | — | The day that starts the week. |
| `focusedValue` | `DateValue | null | undefined` | — | Controls the currently focused date within the calendar. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDateUnavailable` | `((date: DateValue) => boolean) | undefined` | — | Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. |
| `isDisabled` | `boolean | undefined` | false | Whether the calendar is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the current selection is invalid according to application logic. |
| `isReadOnly` | `boolean | undefined` | false | Whether the calendar value is immutable. |
| `maxValue` | `DateValue | null | undefined` | — | The maximum allowed date that a user may select. |
| `minValue` | `DateValue | null | undefined` | — | The minimum allowed date that a user may select. |
| `onChange` | `((value: MappedDateValue<T>) => void) | undefined` | — | Handler that is called when the value changes. |
| `onFocusChange` | `((date: CalendarDate) => void) | undefined` | — | Handler that is called when the focused date changes. |
| `pageBehavior` | `PageBehavior | undefined` | visible | Controls the behavior of paging. Pagination either works by advancing the visible page by visibleDuration (default) or one unit of visibleDuration. |
| `selectionAlignment` | `"start" | "center" | "end" | undefined` | 'center' | Determines the alignment of the visible months on initial render based on the current selection or current date if there is no selection. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `T | null | undefined` | — | The current value (controlled). |
| `visibleMonths` | `number | undefined` | 1 | The number of months to display at once. |
