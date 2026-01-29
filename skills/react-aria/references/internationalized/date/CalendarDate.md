# Calendar

Date

A CalendarDate represents a date without any time components in a specific calendar system.

## Introduction

A `CalendarDate` object represents a date without any time components, in a specific calendar system such as the Gregorian calendar. Use this type to represent dates where the time is not important, such as a birthday or an all day calendar event. If you need to refer to a specific time, use a [CalendarDateTime](CalendarDateTime.md) or [ZonedDateTime](ZonedDateTime.md) instead.

A `CalendarDate` can be created using the constructor. This example creates a date that represents February 3rd, 2022 in the Gregorian calendar system.

```tsx
import {CalendarDate} from '@internationalized/date';

let date = new CalendarDate(2022, 2, 3);
```

You can also create a `CalendarDate` by parsing an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted string using the `parseDate` function.

```tsx
import {parseDate} from '@internationalized/date';

let date = parseDate('2022-02-03');
```

Today's date can be retrieved using the `today` function. This requires a time zone identifier to be provided, which is used to determine the local date. The `getLocalTimeZone` function can be used to retrieve the user's current time zone.

**Note:** the local time zone is cached after the first call. You can reset it by calling `resetLocalTimeZone`, or mock it in unit tests by calling `setLocalTimeZone`.

```tsx
import {today, getLocalTimeZone} from '@internationalized/date';

let nyDate = today('America/New_York');
let localDate = today(getLocalTimeZone());
```

Once you have a `CalendarDate` object, you can read its properties, or manipulate it as described in the [Manipulating dates](#manipulating-dates) section below. You can also convert it to an ISO 8601 string, native JavaScript `Date` object, or another representation. See the [Conversion](#conversion) section below for details.

```tsx
let date = new CalendarDate(2022, 2, 3);
date.toString(); // '2022-02-03'
```

## Interface

### Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| `args` | `any[]` | — |

## Calendar systems

By default, `CalendarDate` uses the Gregorian calendar system, but many other calendar systems that are used around the world are supported, such as Hebrew, Indian, Islamic, Buddhist, Ethiopic, and more. A `Calendar` instance can be passed to the `CalendarDate` constructor to represent dates in that calendar system.

This example creates a date in the Buddhist calendar system, which is equivalent to April 30th, 2020 in the Gregorian calendar.

```tsx
import {BuddhistCalendar} from '@internationalized/date';

let date = new CalendarDate(new BuddhistCalendar(), 2563, 4, 30);
```

See the [Calendar](Calendar.md#implementations) docs for details about the supported calendars.

### Eras

Many calendar systems have only one era, or a modern era and a pre-modern era (e.g. AD and BC in the Gregorian calendar). However, other calendar systems may have many eras. For example, the Japanese calendar has eras for the reign of each Emperor. `CalendarDate` represents eras using string identifiers, which can be passed as an additional parameter to the constructor before the year. When eras are present, years are numbered starting from 1 within the era.

This example creates a date in the Japanese calendar system, which is equivalent to April 30th, 2019 in the Gregorian calendar.

```tsx
import {JapaneseCalendar} from '@internationalized/date';

let date = new CalendarDate(new JapaneseCalendar(), 'heisei', 31, 4, 30)
```

A list of valid era identifiers can be retrieved using the `getEras` method of a `Calendar` instance. If an era is not provided, the date is assumed to be in the current era.

### Converting between calendars

The `toCalendar` function can be used to convert a date from one calendar system to another.

This example converts a Gregorian date to a Hebrew one.

```tsx
import {toCalendar, HebrewCalendar} from '@internationalized/date';

let gregorianDate = new CalendarDate(2020, 9, 19);
let hebrewDate = toCalendar(gregorianDate, new HebrewCalendar());
// => new CalendarDate(new HebrewCalendar(), 5781, 1, 1)
```

## Manipulating dates

### Adding and subtracting durations

A `DateDuration` is an object that represents an amount of time, with fields such as `years`, `months`, and `days`. The `add` and `subtract` methods of `CalendarDate` objects can be used to adjust the date by the given duration. These methods return a new date, and do not mutate the original.

```tsx
let date = new CalendarDate(2022, 2, 3);

date.add({weeks: 1}); // 2022-02-10
date.add({months: 1}); // 2022-03-03
date.add({years: 1, months: 1, days: 1}); // 2023-03-04

date.subtract({weeks: 1}); // 2022-01-27
date.subtract({months: 1}); // 2022-01-03
date.subtract({years: 1, months: 1, days: 1}); // 2021-01-02
```

Adding or subtracting a duration that goes beyond the limits of a particular field will cause the date to be *balanced*. For example, adding one day to August 31st results in September 1st. In addition, if adding or subtracting one field causes another to be invalid, the date will be *constrained*. For example, adding one month to August 31st results in September 30th because September 31st does not exist.

### Parsing durations

The `parseDuration` function can be used to convert a [ISO 8601 duration string](https://en.wikipedia.org/wiki/ISO_8601#Durations) into a `DateTimeDuration` object. Negative values can be written by prefixing the entire string with a minus sign.

```tsx
parseDuration('P3Y6M6W4D');
// => {years: 3, months: 6, weeks: 6, days: 4}

parseDuration('-P3Y6M6W4D');
// => {years: -3, months: -6, weeks: -6, days: -4}
```

### Setting fields

`CalendarDate` objects are immutable, which means their properties cannot be set directly. Instead, use the `set` method, and pass the fields to be modified. This will return a new `CalendarDate` with the updated values.

```tsx
let date = new CalendarDate(2022, 2, 3);
date.set({day: 10}); // 2022-02-10
date.set({month: 5}); // 2022-05-03
date.set({year: 2023, month: 10, day: 16}); // 2023-10-16
```

Setting a field to a value that is outside the valid range will cause it to be *constrained*. For example, setting the day to a value that is greater than the number of days in the month, will result in the last day of the month.

```tsx
let date = new CalendarDate(2022, 2, 3);
date.set({day: 100}); // 2022-02-28
date.set({month: 20}); // 2022-12-03
```

### Cycling fields

The `cycle` method allows incrementing or decrementing a single field. It is similar to the `add` and `subtract` methods, but when the value reaches the minimum or maximum, it wraps around rather than affecting other fields.

```tsx
let date = new CalendarDate(2022, 12, 31);
date.cycle('day', 1); // 2022-12-01
date.cycle('month', 1); // 2022-01-31

let date = new CalendarDate(2022, 1, 1);
date.cycle('day', -1); // 2022-01-31
date.cycle('month', -1); // 2022-12-01
```

The `round` option may also be passed, which causes the value to be rounded to increments of the given amount. For example, you could round the year to increments of 5.

```tsx
let date = new CalendarDate(2022, 2, 3);

date.cycle('year', 5); // 2027-02-03
date.cycle('year', 5, {round: true}); // 2025-02-03

date.cycle('year', -5); // 2017-02-03
date.cycle('year', -5, {round: true}); // 2020-02-03
```

Note that if cycling a field causes another field to become invalid, the date is *constrained*. For example, adding one month to August 31st results in September 30th because September 31st does not exist.

## Conversion

### To a string

`CalendarDate` objects can be converted to an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted string using the `toString` method.

```tsx
let date = new CalendarDate(2022, 2, 3);
date.toString(); // '2022-02-03'
```

### To a native 

Date object

A `CalendarDate` can be converted to a native JavaScript `Date` object using the `toDate` method. In general, the `Date` object should be avoided because it has many internationalization issues and other flaws. However, it is necessary to use some functionality like date formatting.

Because a `Date` represents an exact time, a time zone identifier is required to be passed to the `toDate` method. The `getLocalTimeZone` function can be used to retrieve the user's current time zone.

**Note:** the local time zone is cached after the first call. You can reset it by calling `resetLocalTimeZone`, or mock it in unit tests by calling `setLocalTimeZone`.

```tsx
import {getLocalTimeZone} from '@internationalized/date';

let date = new CalendarDate(2022, 2, 3);
date.toDate('America/Los_Angeles'); // Thu Feb 03 2022 00:00:00 GMT-0800 (Pacific Standard Time)
date.toDate(getLocalTimeZone()); // e.g. Thu Feb 03 2022 00:00:00 GMT-0500 (Eastern Standard Time)
```

### To a date with time

A `CalendarDate` can be converted to a [CalendarDateTime](CalendarDateTime.md) or [ZonedDateTime](ZonedDateTime.md) by providing an optional [Time](Time.md) object and/or time zone identifier.

A `CalendarDateTime` represents a date with a time, but not in any specific time zone. Use this type to represent times that occur at the same local time regardless of the time zone, such as the time of New Years Eve fireworks which always occur at midnight. Most times are better stored as a `ZonedDateTime`.

Use the `toCalendarDateTime` function to convert a `CalendarDate` to a `CalendarDateTime`. By default, the time will be set to midnight. You can also pass a `Time` object to set the time to a specific value.

```tsx
import {toCalendarDateTime, Time} from '@internationalized/date';

let date = new CalendarDate(2022, 2, 3);

toCalendarDateTime(date); // 2022-02-03T00:00:00
toCalendarDateTime(date, new Time(8, 30)); // 2022-02-03T08:30:00
```

A `ZonedDateTime` represents a date with a time in a specific time zone. Use this type to represent an exact moment in time at a particular location on Earth.

Use the `toZoned` function to convert a `CalendarDate` to a `ZonedDateTime`. The time will be set to midnight in the given time zone. If you need to set a specific time, convert the `CalendarDate` to a `CalendarDateTime` first as described above, and pass the result to `toZoned`.

```tsx
import {toZoned, toCalendarDateTime, Time} from '@internationalized/date';

let date = new CalendarDate(2022, 2, 3);
toZoned(date, 'America/Los_Angeles'); // 2021-02-03T00:00-07:00[America/Los_Angeles]

let dateTime = toCalendarDateTime(date, new Time(8, 30));
toZoned(dateTime, 'America/Los_Angeles'); // 2021-02-03T08:30-07:00[America/Los_Angeles]
```

## Queries

### Comparison

`CalendarDate` objects can be compared either for full or partial equality, or in order to determine which date is before or after another.

The `compare` method can be used to determine if a date is before or after another. It returns a number less than zero if the first date is before the second, zero if the values are equal, or a number greater than zero if the first date is after the second.

```tsx
let a = new CalendarDate(2022, 2, 3);
let b = new CalendarDate(2022, 3, 4);

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

isSameMonth(new CalendarDate(2021, 4, 16), new CalendarDate(2021, 4, 30)); // true
isSameMonth(new CalendarDate(2021, 4, 16), new CalendarDate(2021, 8, 2)); // false
isSameMonth(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4)); // true
```

A similar set of functions is also available that does not convert between calendar systems and requires the calendars to be equal.

* `isEqualYear` – <span>{docs.exports.isEqualYear.description}</span>
* `isEqualMonth` – <span>{docs.exports.isEqualMonth.description}</span>
* `isEqualDay` – <span>{docs.exports.isEqualDay.description}</span>

```tsx
import {isEqualMonth, IslamicUmalquraCalendar} from '@internationalized/date';

isEqualMonth(new CalendarDate(2021, 4, 16), new CalendarDate(2021, 4, 30)); // true
isEqualMonth(new CalendarDate(2021, 4, 16), new CalendarDate(2021, 8, 2)); // false
isEqualMonth(new CalendarDate(2021, 4, 16), new CalendarDate(new IslamicUmalquraCalendar(), 1442, 9, 4)); // false
```

### Start and end dates

The following functions can be used to find the start or end dates of a particular unit of time.

* `startOfYear` – <span>{docs.exports.startOfYear.description}</span>
* `endOfYear` – <span>{docs.exports.endOfYear.description}</span>
* `startOfMonth` – <span>{docs.exports.startOfMonth.description}</span>
* `endOfMonth` – <span>{docs.exports.endOfMonth.description}</span>
* `startOfWeek` – <span>{docs.exports.startOfWeek.description}</span>
* `endOfWeek` – <span>{docs.exports.endOfWeek.description}</span>

Note that `startOfWeek` and `endOfWeek` require a locale string to be provided. This is because the first day of the week changes depending on the locale. For example, in the United States, the first day of the week is on Sunday, but in France it is on Monday.

```tsx
import {startOfYear, startOfMonth, startOfWeek} from '@internationalized/date';

let date = new CalendarDate(2022, 2, 3);

startOfYear(date); // 2022-01-01
startOfMonth(date); // 2022-02-01
startOfWeek(date, 'en-US'); // 2022-01-30
startOfWeek(date, 'fr-FR'); // 2022-01-31
```

You can also provide an optional `firstDayOfWeek` argument to override the default first day of the week determined by the locale. It accepts a week day abbreviation, e.g. `sun`, `mon`, `tue`, etc.

```tsx
startOfWeek(date, 'en-US', 'mon'); // 2022-01-31
```

### Day of week

The `getDayOfWeek` function returns the day of the week for the given date and locale. Days are numbered from zero to six, where zero is the first day of the week in the given locale. For example, in the United States, the first day of the week is Sunday, but in France it is Monday.

```tsx
import {getDayOfWeek} from '@internationalized/date';

let date = new CalendarDate(2022, 2, 6); // a Sunday

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

let date = new CalendarDate(2022, 2, 6); // a Sunday

isWeekday(date, 'en-US'); // false
isWeekday(date, 'he-IL'); // true

isWeekend(date, 'en-US'); // true
isWeekend(date, 'he-IL'); // false
```

### Weeks in month

The `getWeeksInMonth` function returns the number of weeks in the given month. This depends on the number of days in the month, what day of the week the month starts on, and the given locale. For example, in the United States, the first day of the week is Sunday, but in France it is Monday.

```tsx
import {getWeeksInMonth} from '@internationalized/date';

let date = new CalendarDate(2021, 1, 1);

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

Date

`parseDate(value: string): CalendarDate`

Parses an ISO 8601 date string, with no time components.

### today

`today(timeZone: string): CalendarDate`

Returns today's date in the given time zone.

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

Duration

Represents an amount of time in calendar-specific units, for use when performing arithmetic.

| Name | Type | Description |
|------|------|-------------|
| `years` | `number | undefined` | The number of years to add or subtract. |
| `months` | `number | undefined` | The number of months to add or subtract. |
| `weeks` | `number | undefined` | The number of weeks to add or subtract. |
| `days` | `number | undefined` | The number of days to add or subtract. |

### parse

Duration

`parseDuration(value: string): Required<DateTimeDuration>`

Parses an ISO 8601 duration string (e.g. "P3Y6M6W4DT12H30M5S").

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

### Calendar

DateTime

A CalendarDateTime represents a date and time without a time zone, in a specific calendar system.

### to

CalendarDateTime

`toCalendarDateTime(date: CalendarDate | CalendarDateTime | ZonedDateTime, time?: AnyTime): CalendarDateTime`

Converts a date value to a \`CalendarDateTime\`. An optional \`Time\` value can be passed to set the time
of the resulting value, otherwise it will default to midnight.

### Properties

| Name | Type | Description |
|------|------|-------------|
| `hour` \* | `number` | — |
| `minute` \* | `number` | — |
| `second` \* | `number` | — |
| `millisecond` \* | `number` | — |

### Methods

#### `copy(): 

AnyTime`

### Time

A Time represents a clock time without any date components.

### Zoned

DateTime

A ZonedDateTime represents a date and time in a specific time zone and calendar system.

### to

Zoned

`toZoned(date: CalendarDate | CalendarDateTime | ZonedDateTime, timeZone: string, disambiguation?: Disambiguation): ZonedDateTime`

Converts a date value to a \`ZonedDateTime\` in the provided time zone. The \`disambiguation\` option can be set
to control how values that fall on daylight saving time changes are interpreted.

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
