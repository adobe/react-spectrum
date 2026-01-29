# Calendar

DateTime

A CalendarDateTime represents a date and time without a time zone, in a specific calendar system.

## Introduction

A `CalendarDateTime` object represents a date and time without a time zone, in a specific calendar system such as the Gregorian calendar. Use this type to represent times that occur at the same local time regardless of the time zone, such as the time of New Years Eve fireworks which always occur at midnight. Most times are better stored as a [ZonedDateTime](ZonedDateTime.md).

A `CalendarDateTime` can be created using the constructor. This example creates a date that represents February 3rd, 2022 at 9:15 AM in the Gregorian calendar system.

```tsx
import {CalendarDateTime} from '@internationalized/date';

let date = new CalendarDateTime(2022, 2, 3, 9, 15);
```

You can also create a `CalendarDateTime` by parsing an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted string using the `parseDateTime` function.

```tsx
import {parseDateTime} from '@internationalized/date';

let date = parseDateTime('2022-02-03T09:15');
```

Once you have a `CalendarDateTime` object, you can read its properties, or manipulate it as described in the [Manipulating dates](#manipulating-dates) section below. You can also convert it to an ISO 8601 string, native JavaScript `Date` object, or another representation. See the [Conversion](#conversion) section below for details.

```tsx
let date = new CalendarDateTime(2022, 2, 3, 9, 15);
date.toString(); // '2022-02-03T09:15:00'
```

## Interface

### Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| `args` | `any[]` | — |

## Calendar systems

By default, `CalendarDateTime` uses the Gregorian calendar system, but many other calendar systems that are used around the world are supported, such as Hebrew, Indian, Islamic, Buddhist, Ethiopic, and more. A `Calendar` instance can be passed to the `CalendarDateTime` constructor to represent dates in that calendar system.

This example creates a date in the Buddhist calendar system, which is equivalent to April 4th, 2020 at 9:15 AM in the Gregorian calendar.

```tsx
import {BuddhistCalendar} from '@internationalized/date';

let date = new CalendarDateTime(new BuddhistCalendar(), 2563, 4, 30, 9, 15);
```

See the [Calendar](Calendar.md#implementations) docs for details about the supported calendars.

### Eras

Many calendar systems have only one era, or a modern era and a pre-modern era (e.g. AD and BC in the Gregorian calendar). However, other calendar systems may have many eras. For example, the Japanese calendar has eras for the reign of each Emperor. `CalendarDateTime` represents eras using string identifiers, which can be passed as an additional parameter to the constructor before the year. When eras are present, years are numbered starting from 1 within the era.

This example creates a date in the Japanese calendar system, which is equivalent to April 4th, 2020 at 9:15 AM in the Gregorian calendar.

```tsx
import {JapaneseCalendar} from '@internationalized/date';

let date = new CalendarDateTime(
  new JapaneseCalendar(),
  'heisei', 31, 4, 30, 9, 15
);
```

A list of valid era identifiers can be retrieved using the `getEras` method of a `Calendar` instance. If an era is not provided, the date is assumed to be in the current era.

### Converting between calendars

The `toCalendar` function can be used to convert a date from one calendar system to another.

This example converts a Gregorian date to a Hebrew one.

```tsx
import {toCalendar, HebrewCalendar} from '@internationalized/date';

let gregorianDate = new CalendarDateTime(2020, 9, 19, 10, 30);
let hebrewDate = toCalendar(gregorianDate, new HebrewCalendar());
// => new CalendarDateTime(new HebrewCalendar(), 5781, 1, 1, 10, 30)
```

## Manipulating dates

### Adding and subtracting durations

A `DateTimeDuration` is an object that represents an amount of time, with fields such as `years`, `months`, `hours`, and `minutes`. The `add` and `subtract` methods of `CalendarDateTime` objects can be used to adjust the date by the given duration. These methods return a new date, and do not mutate the original.

```tsx
let date = new CalendarDateTime(2022, 2, 3, 9, 45);

date.add({weeks: 1}); // 2022-02-10T09:45
date.add({months: 1}); // 2022-03-03T09:45
date.add({years: 1, months: 1, days: 1}); // 2023-03-04T09:45
date.add({hours: 1}); // 2022-02-03T10:45
date.add({minutes: 30}); // 2022-02-03T10:15

date.subtract({weeks: 1}); // 2022-01-27T09:45
date.subtract({months: 1}); // 2022-01-03T09:45
date.subtract({years: 1, months: 1, days: 1}); // 2021-01-02T09:45
date.subtract({hours: 1}); // 2022-02-03T8:45
date.subtract({minutes: 30}); // 2022-02-03T09:15
```

Adding or subtracting a duration that goes beyond the limits of a particular field will cause the date to be *balanced*. For example, adding one day to August 31st results in September 1st. In addition, if adding or subtracting one field causes another to be invalid, the date will be *constrained*. For example, adding one month to August 31st results in September 30th because September 31st does not exist.

### Parsing durations

The `parseDuration` function can be used to convert a [ISO 8601 duration string](https://en.wikipedia.org/wiki/ISO_8601#Durations) into a `DateTimeDuration` object. The smallest time unit may include decimal values written with a comma or period, and negative values can be written by prefixing the entire string with a minus sign.

```tsx
parseDuration('P3Y6M6W4DT12H30M5S');
// => {years: 3, months: 6, weeks: 6, days: 4, hours: 12, minutes: 30, seconds: 5}

parseDuration('-P3Y6M6W4DT12H30M5S');
// => {years: -3, months: -6, weeks: -6, days: -4, hours: -12, minutes: -30, seconds: -5}

parseDuration('P3Y6M6W4DT12H30M5.5S');
// => {years: 3, months: 6, weeks: 6, days: 4, hours: 12, minutes: 30, seconds: 5.5}
```

### Setting fields

`CalendarDateTime` objects are immutable, which means their properties cannot be set directly. Instead, use the `set` method, and pass the fields to be modified. This will return a new `CalendarDateTime` with the updated values.

```tsx
let date = new CalendarDateTime(2022, 2, 3, 9, 45);
date.set({day: 10}); // 2022-02-10T09:45
date.set({month: 5}); // 2022-05-03T09:45
date.set({year: 2023, month: 10, day: 16}); // 2023-10-16T09:45
date.set({hour: 18}); // 2022-02-03T18:45
date.set({minute: 15}); // 2022-02-03T09:15
```

Setting a field to a value that is outside the valid range will cause it to be *constrained*. For example, setting the day to a value that is greater than the number of days in the month, will result in the last day of the month.

```tsx
let date = new CalendarDateTime(2022, 2, 3, 9, 45);
date.set({day: 100}); // 2022-02-28T09:45
date.set({month: 20}); // 2022-12-03T09:45
date.set({hour: 30}); // 2022-02-03T23:45
```

### Cycling fields

The `cycle` method allows incrementing or decrementing a single field. It is similar to the `add` and `subtract` methods, but when the value reaches the minimum or maximum, it wraps around rather than affecting other fields.

```tsx
let date = new CalendarDateTime(2022, 12, 31, 23, 59);
date.cycle('day', 1); // 2022-12-01T23:59
date.cycle('month', 1); // 2022-01-31T23:59
date.cycle('hour', 1); // 2022-12-31T00:59
date.cycle('minute', 1); // 2022-12-31T23:00

let date = new CalendarDateTime(2022, 1, 1, 0, 0);
date.cycle('day', -1); // 2022-01-31T00:00
date.cycle('month', -1); // 2022-12-01T00:00
date.cycle('hour', -1); // 2022-01-01T23:00
date.cycle('minute', -1); // 2022-01-01T00:59
```

Note that if cycling a field causes another field to become invalid, the date is *constrained*. For example, adding one month to August 31st results in September 30th because September 31st does not exist.

The `round` option may also be passed, which causes the value to be rounded to increments of the given amount. For example, you could round the minute to increments of 15.

```tsx
let date = new CalendarDateTime(2022, 2, 3, 9, 22);

date.cycle('minute', 15); // 2027-02-03T09:37
date.cycle('minute', 15, {round: true}); // 2025-02-03T09:30

date.cycle('minute', -15); // 2017-02-03T09:07
date.cycle('minute', -15, {round: true}); // 2020-02-03T09:15
```

By default, the `hour` field is cycled within a 24 hour range. The `hourCycle` option can be set to `12` to use a 12 hour clock instead, which will preserve the AM/PM value when formatted.

```tsx
let date = new CalendarDateTime(2022, 2, 3, 11);
date.cycle('hour', 1); // 2022-02-03T12:00
date.cycle('hour', 1, {hourCycle: 12}); // 2022-02-03T00:00

let date = new CalendarDateTime(2022, 2, 3, 23);
date.cycle('hour', 1); // 2022-02-03T00:00
date.cycle('hour', 1, {hourCycle: 12}); // 2022-02-03T12:00
```

## Conversion

### To a string

`CalendarDateTime` objects can be converted to an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted string using the `toString` method.

```tsx
let date = new CalendarDateTime(2022, 2, 3, 9, 45);
date.toString(); // '2022-02-03T09:45:00'
```

### To a date or time only

A `CalendarDateTime` can be converted to a [CalendarDate](CalendarDate.md) or [Time](Time.md) object if only one of these components is needed.

Use the `toCalendarDate` function to convert a `CalendarDateTime` to a `CalendarDate`.

```tsx
import {toCalendarDate} from '@internationalized/date';

let date = new CalendarDateTime(2022, 2, 3, 9, 45);
toCalendarDate(date); // 2022-02-03
```

Use the `toTime` function to convert a `CalendarDateTime` to a `Time`.

```tsx
import {toTime} from '@internationalized/date';

let date = new CalendarDateTime(2022, 2, 3, 9, 45);
toTime(date); // 09:45:00
```

### To a 

ZonedDateTime

A `CalendarDateTime` can be converted to a local time in a specific time zone using the `toZoned` function. This returns a `ZonedDateTime` object, which represents an exact moment in time at a particular location on Earth.

```tsx
import {toZoned} from '@internationalized/date';

let date = new CalendarDateTime(2022, 2, 3, 9, 45);
toZoned(date, 'America/Los_Angeles'); // 2022-02-03T09:45-07:00[America/Los_Angeles]
```

Some time values during daylight saving transitions may be *ambiguous*. For example, in the United States, the 2 AM hour is skipped in the spring, and the 1 AM hour occurs twice in the fall. When converting a `CalendarDateTime` to a `ZonedDateTime`, this ambiguity must be resolved to determine the exact time. By default, the later of the two possible times is chosen for "spring forward" transitions, and the earlier time is chosen for "fall back" transitions. This can be controlled by passing the `disambiguation` parameter to the `toZoned` function.

* `'earlier'` – choose the earlier of the two possible times
* `'later'` – choose the later of the two possible times
* `'compatible'` (default) – choose the later of the two times during "spring forward" transitions, and the earlier time during "fall back" transitions.
* `'reject'` – throws an error when the time is ambiguous

```tsx
// A "spring forward" transition
let date = new CalendarDateTime(2020, 3, 8, 2);
toZoned(date, 'America/Los_Angeles'); // 2020-03-08T03:00:00-07:00[America/Los_Angeles]
toZoned(date, 'America/Los_Angeles', 'earlier'); // 2020-03-08T01:00:00-08:00[America/Los_Angeles]
toZoned(date, 'America/Los_Angeles', 'later'); // 2020-03-08T03:00:00-07:00[America/Los_Angeles]

// A "fall back" transition
let date = new CalendarDateTime(2020, 11, 1, 1);
toZoned(date, 'America/Los_Angeles'); // 2020-11-01T01:00:00-07:00[America/Los_Angeles]
toZoned(date, 'America/Los_Angeles', 'earlier'); // 2020-11-01T01:00:00-07:00[America/Los_Angeles]
toZoned(date, 'America/Los_Angeles', 'later'); // 2020-11-01T01:00:00-08:00[America/Los_Angeles]
```

### To a native 

Date object

A `CalendarDateTime` can be converted to a native JavaScript `Date` object using the `toDate` method. In general, the `Date` object should be avoided because it has many internationalization issues and other flaws. However, it is necessary to use some functionality like date formatting.

Because a `Date` represents an exact time, a time zone identifier is required to be passed to the `toDate` method. The `getLocalTimeZone` function can be used to retrieve the user's current time zone.

**Note:** the local time zone is cached after the first call. You can reset it by calling `resetLocalTimeZone`, or mock it in unit tests by calling `setLocalTimeZone`.

```tsx
import {getLocalTimeZone} from '@internationalized/date';

let date = new CalendarDateTime(2022, 2, 3, 9, 45);
date.toDate('America/Los_Angeles'); // Thu Feb 03 2022 09:45:00 GMT-0800 (Pacific Standard Time)
date.toDate(getLocalTimeZone()); // e.g. Thu Feb 03 2022 09:45:00 GMT-0500 (Eastern Standard Time)
```

Some time values during daylight saving transitions may be *ambiguous*. For example, in the United States, the 2 AM hour is skipped in the spring, and the 1 AM hour occurs twice in the fall. When converting a `CalendarDateTime` to a `Date`, this ambiguity must be resolved to determine the exact time. This behavior can be controlled using the `disambiguation` parameter, as described [above](#to-a-zoneddatetime).

```tsx
// A "spring forward" transition
let date = new CalendarDateTime(2020, 3, 8, 2);
date.toDate('America/Los_Angeles', 'earlier');
// => Sun Mar 08 2020 01:00:00 GMT-0800 (Pacific Daylight Time)
```

## Queries

### Comparison

`CalendarDateTime` objects can be compared either for full or partial equality, or in order to determine which date is before or after another.

The `compare` method can be used to determine if a date is before or after another. It returns a number less than zero if the first date is before the second, zero if the values are equal, or a number greater than zero if the first date is after the second.

```tsx
let a = new CalendarDateTime(2022, 2, 3, 9, 45);
let b = new CalendarDateTime(2022, 3, 4, 12, 20);

a.compare(b) < 0; // true
b.compare(a) > 0; // true
```

In addition, the following functions can be used to perform a partial comparison. These functions accept dates in different calendar systems, and the second date is converted to the calendar system of the first date before comparison.

* `isSameYear` – <span>{docs.exports.isSameYear.description}</span>
* `isSameMonth` – <span>{docs.exports.isSameMonth.description}</span>
* `isSameDay` – <span>{docs.exports.isSameDay.description}</span>
* `isToday` – <span>{docs.exports.isToday.description}</span>

```tsx
import {isSameMonth, IslamicUmalquraCalendar} from '@internationalized/date';

isSameMonth(new CalendarDateTime(2021, 4, 16, 9, 45), new CalendarDateTime(2021, 4, 30, 5, 15)); // true
isSameMonth(new CalendarDateTime(2021, 4, 16, 9, 45), new CalendarDateTime(2021, 8, 2, 5, 15)); // false
isSameMonth(new CalendarDateTime(2021, 4, 16, 9, 45), new CalendarDateTime(new IslamicUmalquraCalendar(), 1442, 9, 4, 5, 15)); // true
```

A similar set of functions is also available that does not convert between calendar systems and requires the calendars to be equal.

* `isEqualYear` – <span>{docs.exports.isEqualYear.description}</span>
* `isEqualMonth` – <span>{docs.exports.isEqualMonth.description}</span>
* `isEqualDay` – <span>{docs.exports.isEqualDay.description}</span>

```tsx
import {isEqualMonth, IslamicUmalquraCalendar} from '@internationalized/date';

isEqualMonth(new CalendarDateTime(2021, 4, 16, 9, 45), new CalendarDateTime(2021, 4, 30, 5, 15)); // true
isEqualMonth(new CalendarDateTime(2021, 4, 16, 9, 45), new CalendarDateTime(2021, 8, 2, 5, 15)); // false
isEqualMonth(new CalendarDateTime(2021, 4, 16, 9, 45), new CalendarDateTime(new IslamicUmalquraCalendar(), 1442, 9, 4, 5, 15)); // false
```

### Start and end dates

The following functions can be used to find the start or end dates of a particular unit of time. These only affect the date components of a `CalendarDateTime`. The time fields are left unchanged.

* `startOfYear` – <span>{docs.exports.startOfYear.description}</span>
* `endOfYear` – <span>{docs.exports.endOfYear.description}</span>
* `startOfMonth` – <span>{docs.exports.startOfMonth.description}</span>
* `endOfMonth` – <span>{docs.exports.endOfMonth.description}</span>
* `startOfWeek` – <span>{docs.exports.startOfWeek.description}</span>
* `endOfWeek` – <span>{docs.exports.endOfWeek.description}</span>

Note that `startOfWeek` and `endOfWeek` require a locale string to be provided. This is because the first day of the week changes depending on the locale. For example, in the United States, the first day of the week is on Sunday, but in France it is on Monday.

```tsx
import {startOfYear, startOfMonth, startOfWeek} from '@internationalized/date';

let date = new CalendarDateTime(2022, 2, 3, 9, 45);

startOfYear(date); // 2022-01-01T09:45
startOfMonth(date); // 2022-02-01T09:45
startOfWeek(date, 'en-US'); // 2022-01-30T09:45
startOfWeek(date, 'fr-FR'); // 2022-01-31T09:45
```

You can also provide an optional `firstDayOfWeek` argument to override the default first day of the week determined by the locale. It accepts a week day abbreviation, e.g. `sun`, `mon`, `tue`, etc.

```tsx
startOfWeek(date, 'en-US', 'mon'); // 2022-01-31T09:45
```

### Day of week

The `getDayOfWeek` function returns the day of the week for the given date and locale. Days are numbered from zero to six, where zero is the first day of the week in the given locale. For example, in the United States, the first day of the week is Sunday, but in France it is Monday.

```tsx
import {getDayOfWeek} from '@internationalized/date';

let date = new CalendarDateTime(2022, 2, 6, 8, 30); // a Sunday

getDayOfWeek(date, 'en-US'); // 0
getDayOfWeek(date, 'fr-FR'); // 6
```

You can also provide an optional `firstDayOfWeek` argument to override the default first day of the week determined by the locale. It accepts a week day abbreviation, e.g. `sun`, `mon`, `tue`, etc.

```tsx
getDayOfWeek(date, 'en-US', 'mon'); // 6
```

### Weekdays and weekends

The `isWeekday` and `isWeekend` functions can be used to determine if a date is weekday or weekend respectively. This depends on the locale. For example, in the United States, weekends are Saturday and Sunday, but in Israel they are Friday and Saturday.

```tsx
import {isWeekday, isWeekend} from '@internationalized/date';

let date = new CalendarDateTime(2022, 2, 6, 8, 30); // a Sunday

isWeekday(date, 'en-US'); // false
isWeekday(date, 'he-IL'); // true

isWeekend(date, 'en-US'); // true
isWeekend(date, 'he-IL'); // false
```

### Weeks in month

The `getWeeksInMonth` function returns the number of weeks in the given month. This depends on the number of days in the month, what day of the week the month starts on, and the given locale. For example, in the United States, the first day of the week is Sunday, but in France it is Monday.

```tsx
import {getWeeksInMonth} from '@internationalized/date';

let date = new CalendarDateTime(2021, 1, 1, 8, 30);

getWeeksInMonth(date, 'en-US'); // 6
getWeeksInMonth(date, 'fr-FR'); // 5
```

You can also provide an optional `firstDayOfWeek` argument to override the default first day of the week determined by the locale. It accepts a week day abbreviation, e.g. `sun`, `mon`, `tue`, etc.

```tsx
getWeeksInMonth(date, 'en-US', 'mon'); // 5
```

## Related 

Types

### parse

DateTime

`parseDateTime(value: string): CalendarDateTime`

Parses an ISO 8601 date and time string, with no time zone.

### Calendar

`Calendar(props: P & RefAttributes<T>): React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | null`

Calendars display a grid of days in one or more months and allow users to select a single date.

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
| `selectionAlignment` | `"start" | "end" | "center" | undefined` | 'center' | Determines the alignment of the visible months on initial render based on the current selection or current date if there is no selection. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `T | null | undefined` | — | The current value (controlled). |
| `visibleMonths` | `number | undefined` | 1 | The number of months to display at once. |

### to

Calendar

`toCalendar(date: T, calendar: Calendar): T`

Converts a date from one calendar system to another.

### Date

TimeDuration

Represents an amount of time with both date and time components, for use when performing arithmetic.

| Name | Type | Description |
|------|------|-------------|
| `years` | `number | undefined` | The number of years to add or subtract. |
| `months` | `number | undefined` | The number of months to add or subtract. |
| `weeks` | `number | undefined` | The number of weeks to add or subtract. |
| `days` | `number | undefined` | The number of days to add or subtract. |
| `hours` | `number | undefined` | The number of hours to add or subtract. |
| `minutes` | `number | undefined` | The number of minutes to add or subtract. |
| `seconds` | `number | undefined` | The number of seconds to add or subtract. |
| `milliseconds` | `number | undefined` | The number of milliseconds to add or subtract. |

### parse

Duration

`parseDuration(value: string): Required<DateTimeDuration>`

Parses an ISO 8601 duration string (e.g. "P3Y6M6W4DT12H30M5S").

### to

CalendarDate

`toCalendarDate(dateTime: AnyCalendarDate): CalendarDate`

Converts a value with date components such as a \`CalendarDateTime\` or \`ZonedDateTime\` into a \`CalendarDate\`.

### Properties

| Name | Type | Description |
|------|------|-------------|
| `calendar` \* | `Calendar` | — |
| `era` \* | `string` | — |
| `year` \* | `number` | — |
| `month` \* | `number` | — |
| `day` \* | `number` | — |

### Methods

#### `copy(): 

AnyCalendarDate`

### to

Time

`toTime(dateTime: CalendarDateTime | ZonedDateTime): Time`

Extracts the time components from a value containing a date and time.

### to

Zoned

`toZoned(date: CalendarDate | CalendarDateTime | ZonedDateTime, timeZone: string, disambiguation?: Disambiguation): ZonedDateTime`

Converts a date value to a \`ZonedDateTime\` in the provided time zone. The \`disambiguation\` option can be set
to control how values that fall on daylight saving time changes are interpreted.

### Zoned

DateTime

A ZonedDateTime represents a date and time in a specific time zone and calendar system.

### get

LocalTimeZone

`getLocalTimeZone(): string`

Returns the time zone identifier for the current user.

### reset

LocalTimeZone

`resetLocalTimeZone(): void`

Resets the time zone identifier for the current user.

### set

LocalTimeZone

`setLocalTimeZone(timeZone: string): void`

Sets the time zone identifier for the current user.

### is

SameYear

`isSameYear(a: DateValue, b: DateValue): boolean`

Returns whether the given dates occur in the same year, using the calendar system of the first date.

### is

SameMonth

`isSameMonth(a: DateValue, b: DateValue): boolean`

Returns whether the given dates occur in the same month, using the calendar system of the first date.

### is

SameDay

`isSameDay(a: DateValue, b: DateValue): boolean`

Returns whether the given dates occur on the same day, regardless of the time or calendar system.

### is

Today

`isToday(date: DateValue, timeZone: string): boolean`

Returns whether the date is today in the given time zone.

### is

EqualYear

`isEqualYear(a: DateValue, b: DateValue): boolean`

Returns whether the given dates occur in the same year, and are of the same calendar system.

### is

EqualMonth

`isEqualMonth(a: DateValue, b: DateValue): boolean`

Returns whether the given dates occur in the same month, and are of the same calendar system.

### is

EqualDay

`isEqualDay(a: DateValue, b: DateValue): boolean`

Returns whether the given dates occur on the same day, and are of the same calendar system.

### start

OfYear

`startOfYear(date: ZonedDateTime): ZonedDateTime`

Returns the first day of the year for the given date.

### end

OfYear

`endOfYear(date: ZonedDateTime): ZonedDateTime`

Returns the last day of the year for the given date.

### start

OfMonth

`startOfMonth(date: ZonedDateTime): ZonedDateTime`

Returns the first date of the month for the given date.

### end

OfMonth

`endOfMonth(date: ZonedDateTime): ZonedDateTime`

Returns the last date of the month for the given date.

### start

OfWeek

`startOfWeek(date: ZonedDateTime, locale: string, firstDayOfWeek?: DayOfWeek): ZonedDateTime`

Returns the first date of the week for the given date and locale.

### end

OfWeek

`endOfWeek(date: ZonedDateTime, locale: string, firstDayOfWeek?: DayOfWeek): ZonedDateTime`

Returns the last date of the week for the given date and locale.

### get

DayOfWeek

`getDayOfWeek(date: DateValue, locale: string, firstDayOfWeek?: DayOfWeek): number`

Returns the day of week for the given date and locale. Days are numbered from zero to six,
where zero is the first day of the week in the given locale. For example, in the United States,
the first day of the week is Sunday, but in France it is Monday.

### is

Weekday

`isWeekday(date: DateValue, locale: string): boolean`

Returns whether the given date is on a weekday in the given locale.

### is

Weekend

`isWeekend(date: DateValue, locale: string): boolean`

Returns whether the given date is on a weekend in the given locale.

### get

WeeksInMonth

`getWeeksInMonth(date: DateValue, locale: string, firstDayOfWeek?: DayOfWeek): number`

Returns the number of weeks in the given month and locale.
