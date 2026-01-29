# Zoned

DateTime

A ZonedDateTime represents a date and time in a specific time zone and calendar system.

## Introduction

A `ZonedDateTime` object represents an exact date and time in a specific time zone, in a specific calendar system such as the Gregorian calendar. Use this type to represent an exact moment in time at a particular location on Earth.

A `ZonedDateTime` can be created using the constructor. This example creates a date that represents February 3rd, 2022 at 9:15 AM in the Gregorian calendar system, with a time zone of `"America/Los Angeles"`.

```tsx
import {ZonedDateTime} from '@internationalized/date';

let date = new ZonedDateTime(
  // Date
  2022, 2, 3,
  // Time zone and UTC offset
  'America/Los_Angeles', -28800000,
  // Time
  9, 15, 0
);
```

You can also create a `ZonedDateTime` by parsing an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted string using the one of the following functions:

* `parseZonedDateTime` – This function parses a date with an explicit time zone and optional UTC offset attached (e.g. `"2021-11-07T00:45[America/Los_Angeles]"` or `"2021-11-07T00:45-07:00[America/Los_Angeles]"`). This format preserves the maximum amount of information. If the exact local time and time zone that a user selected is important, use this format. Storing the time zone and offset that was selected rather than converting to UTC ensures that the local time is correct regardless of daylight saving rule changes (e.g. if a locale abolishes DST). Examples where this applies include calendar events, reminders, and other times that occur in a particular location.
* `parseAbsolute` – This function parses an absolute date and time that occurs at the same instant at all locations on Earth. It can be represented in UTC (e.g. `"2021-11-07T07:45:00Z"`), or stored with a particular offset (e.g. `"2021-11-07T07:45:00-07:00"`). A time zone identifier, e.g. `America/Los_Angeles`, must be passed, and the result will be converted into that time zone. Absolute times are the best way to represent events that occurred in the past, or future events where an exact time is needed, regardless of time zone.
* `parseAbsoluteToLocal` – This function parses an absolute date and time into the current user's local time zone. It is a shortcut for `parseAbsolute`, and accepts the same formats.

```tsx
import {parseZonedDateTime} from '@internationalized/date';

let date = parseZonedDateTime('2022-11-07T00:45[America/Los_Angeles]');
let date = parseAbsolute('2021-11-07T07:45:00Z', 'America/Los_Angeles');
let date = parseAbsoluteToLocal('2021-11-07T07:45:00Z');
```

You can also create a `ZonedDateTime` using a `Date` object or epoch time (milliseconds) using one of the following functions:

* `fromDate` – This function creates a `ZonedDateTime` from a `Date` object. A time zone identifier, e.g. `America/Los_Angeles`, must be passed, and the result will be converted into that time zone.
* `fromAbsolute` – This function creates a `ZonedDateTime` from a Unix epoch (e.g. `1688023843144`, representing milliseconds since 1970). A time zone identifier, e.g. `America/Los_Angeles`, must be provided, and the result will be converted into that time zone.

```tsx
import {fromDate, fromAbsolute} from '@internationalized/date';

let date = fromDate(new Date(), 'America/Los_Angeles');
let date = fromAbsolute(1688023843144, 'America/Los_Angeles');
```

The current time can be retrieved using the `now` function. This requires a time zone identifier to be provided, which is used to determine the local time. The `getLocalTimeZone` function can be used to retrieve the user's current time zone.

**Note:** the local time zone is cached after the first call. You can reset it by calling `resetLocalTimeZone`, or mock it in unit tests by calling `setLocalTimeZone`.

```tsx
import {now, getLocalTimeZone} from '@internationalized/date';

let nyTime = now('America/New_York');
let localTime = now(getLocalTimeZone());
```

Once you have a `ZonedDateTime` object, you can read its properties, or manipulate it as described in the [Manipulating dates](#manipulating-dates) section below. You can also convert it to an ISO 8601 string, native JavaScript `Date` object, or another representation. See the [Conversion](#conversion) section below for details.

```tsx
let date = new ZonedDateTime(
  2022, 2, 3,
  'America/Los_Angeles', -28800000,
  12, 24, 45
);

date.toString(); // '2022-02-03T12:24:45-08:00[America/Los_Angeles]'
```

## Interface

### Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| `args` | `any[]` | — |

## Calendar systems

By default, `ZonedDateTime` uses the Gregorian calendar system, but many other calendar systems that are used around the world are supported, such as Hebrew, Indian, Islamic, Buddhist, Ethiopic, and more. A `Calendar` instance can be passed to the `ZonedDateTime` constructor to represent dates in that calendar system.

This example creates a date in the Buddhist calendar system, which is equivalent to April 30th, 2020 at 9:15 AM in the Gregorian calendar.

```tsx
import {BuddhistCalendar} from '@internationalized/date';

let date = new ZonedDateTime(
  new BuddhistCalendar(), 2563, 4, 30,
  'America/Los_Angeles', -28800000,
  9, 15
);
```

See the [Calendar](Calendar.md#implementations) docs for details about the supported calendars.

### Eras

Many calendar systems have only one era, or a modern era and a pre-modern era (e.g. AD and BC in the Gregorian calendar). However, other calendar systems may have many eras. For example, the Japanese calendar has eras for the reign of each Emperor. `ZonedDateTime` represents eras using string identifiers, which can be passed as an additional parameter to the constructor before the year. When eras are present, years are numbered starting from 1 within the era.

This example creates a date in the Japanese calendar system, which is equivalent to April 30th, 2019 at 9:15 AM in the Gregorian calendar.

```tsx
import {JapaneseCalendar} from '@internationalized/date';

let date = new ZonedDateTime(
  new JapaneseCalendar(), 'heisei', 31, 4, 30,
  'America/Los_Angeles', -28800000,
  9, 15
);
```

A list of valid era identifiers can be retrieved using the `getEras` method of a `Calendar` instance. If an era is not provided, the date is assumed to be in the current era.

### Converting between calendars

The `toCalendar` function can be used to convert a date from one calendar system to another.

This example converts a Gregorian date to a Hebrew one.

```tsx
import {toCalendar, HebrewCalendar} from '@internationalized/date';

let gregorianDate = new ZonedDateTime(
  2020, 9, 19,
  'America/Los_Angeles', -28800000,
  10, 30
);

let hebrewDate = toCalendar(gregorianDate, new HebrewCalendar());
```

## Manipulating dates

### Adding and subtracting durations

A `DateTimeDuration` is an object that represents an amount of time, with fields such as `years`, `months`, `hours`, and `minutes`. The `add` and `subtract` methods of `ZonedDateTime` objects can be used to adjust the date by the given duration. These methods return a new date, and do not mutate the original.

```tsx
let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');

date.add({weeks: 1}); // 2022-02-10T09:45[America/Los_Angeles]
date.add({months: 1}); // 2022-03-03T09:45[America/Los_Angeles]
date.add({years: 1, months: 1, days: 1}); // 2023-03-04T09:45[America/Los_Angeles]
date.add({hours: 1}); // 2022-02-03T10:45[America/Los_Angeles]
date.add({minutes: 30}); // 2022-02-03T10:15[America/Los_Angeles]

date.subtract({weeks: 1}); // 2022-01-27T09:45[America/Los_Angeles]
date.subtract({months: 1}); // 2022-01-03T09:45[America/Los_Angeles]
date.subtract({years: 1, months: 1, days: 1}); // 2021-01-02T09:45[America/Los_Angeles]
date.subtract({hours: 1}); // 2022-02-03T8:45[America/Los_Angeles]
date.subtract({minutes: 30}); // 2022-02-03T09:15[America/Los_Angeles]
```

Adding or subtracting a duration that goes beyond the limits of a particular field will cause the date to be *balanced*. For example, adding one day to August 31st results in September 1st. In addition, if adding or subtracting one field causes another to be invalid, the date will be *constrained*. For example, adding one month to August 31st results in September 30th because September 31st does not exist.

Adding and subtracting is time zone aware. When adjusting a date around a daylight saving time transition, the hour may be adjusted accordingly. For example, in the United States, adding one hour during a "spring forward" transition skips the 2 AM hour, and adding an hour in a "fall back" transition repeats the 1 AM hour. Under the hood, the UTC offset is changing instead.

```tsx
// A "spring forward" transition
let date = parseZonedDateTime('2020-03-08T01:00-08:00[America/Los_Angeles]');
date.add({hours: 1}); // 2020-03-08T03:00-07:00[America/Los_Angeles]

// A "fall back" transition
let date = parseZonedDateTime('2020-11-01T01:00-07:00[America/Los_Angeles]');
date.add({hours: 1}); // 2020-11-01T01:00-08:00[America/Los_Angeles]
date.add({hours: 2}); // 2020-11-01T02:00-08:00[America/Los_Angeles]
```

In addition, when changing the date portion of a `ZonedDateTime` around a daylight saving time transition, the hour may change if it is invalid in the target date. For example, during a "spring forward" transition, the 2 AM hour is skipped.

```tsx
// A "spring forward" transition
let date = parseZonedDateTime('2020-03-07T02:00-08:00[America/Los_Angeles]');
date.add({days: 1}); // 2020-03-08T03:00-07:00[America/Los_Angeles]
```

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

`ZonedDateTime` objects are immutable, which means their properties cannot be set directly. Instead, use the `set` method, and pass the fields to be modified. This will return a new `ZonedDateTime` with the updated values.

```tsx
let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');
date.set({day: 10}); // 2022-02-10T09:45[America/Los_Angeles]
date.set({month: 5}); // // 2022-05-03T09:45[America/Los_Angeles]
date.set({year: 2023, month: 10, day: 16}); // 2023-10-16T09:45[America/Los_Angeles]
date.set({hour: 18}); // 2022-02-03T18:45[America/Los_Angeles]
date.set({minute: 15}); // 2022-02-03T09:15[America/Los_Angeles]
```

Setting a field to a value that is outside the valid range will cause it to be *constrained*. For example, setting the day to a value that is greater than the number of days in the month, will result in the last day of the month.

```tsx
let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');
date.set({day: 100}); // 2022-02-28T09:45[America/Los_Angeles]
date.set({month: 20}); // 2022-12-03T09:45[America/Los_Angeles]
date.set({hour: 30}); // 2022-02-03T23:45[America/Los_Angeles]
```

Setting fields is time zone aware. When setting fields around a daylight saving time transition, the UTC offset will be adjusted accordingly. For example, when changing the `day` field from before a daylight saving transition to after, the time remains the same but the UTC offset changes.

```tsx
let date = parseZonedDateTime('2020-03-01T10:00-08:00[America/Los_Angeles]');
date.set({day: 14}); // 2020-03-14T10:00-07:00[America/Los_Angeles]
```

In addition, some time values during daylight saving transitions may be *ambiguous*. For example, in the United States, the 2 AM hour is skipped in the spring, and the 1 AM hour occurs twice in the fall. When setting date fields, this ambiguity must be resolved to determine the exact time. By default, the later of the two possible times is chosen for "spring forward" transitions, and the earlier time is chosen for "fall back" transitions. This can be controlled by passing the `disambiguation` parameter to the `set` method.

* `'earlier'` – choose the earlier of the two possible times
* `'later'` – choose the later of the two possible times
* `'compatible'` (default) – choose the later of the two times during "spring forward" transitions, and the earlier time during "fall back" transitions.
* `'reject'` – throws an error when the time is ambiguous

```tsx
// A "spring forward" transition
let date = parseZonedDateTime('2020-03-01T02:00-08:00[America/Los_Angeles]');
date.set({day: 8}); // 2020-03-08T03:00:00-07:00[America/Los_Angeles]
date.set({day: 8}, 'earlier'); // 2020-03-08T01:00:00-08:00[America/Los_Angeles]
date.set({day: 8}, 'later'); // 2020-03-08T03:00:00-07:00[America/Los_Angeles]

// A "fall back" transition
let date = parseZonedDateTime('2020-10-01T01:00-07:00[America/Los_Angeles]');
date.set({month: 11}); // 2020-11-01T01:00:00-07:00[America/Los_Angeles]
date.set({month: 11}, 'earlier'); // 2020-11-01T01:00:00-07:00[America/Los_Angeles]
date.set({month: 11}, 'later'); // 2020-11-01T01:00:00-08:00[America/Los_Angeles]
```

### Cycling fields

The `cycle` method allows incrementing or decrementing a single field. It is similar to the `add` and `subtract` methods, but when the value reaches the minimum or maximum, it wraps around rather than affecting other fields.

```tsx
let date = parseZonedDateTime('2022-12-31T23:59[America/Los_Angeles]');
date.cycle('day', 1); // 2022-12-01T23:59[America/Los_Angeles]
date.cycle('month', 1); // 2022-01-31T23:59[America/Los_Angeles]
date.cycle('hour', 1); // 2022-12-31T00:59[America/Los_Angeles]
date.cycle('minute', 1); // 2022-12-31T23:00[America/Los_Angeles]

let date = parseZonedDateTime('2022-01-01T00:00[America/Los_Angeles]');
date.cycle('day', -1); // 2022-01-31T00:00[America/Los_Angeles]
date.cycle('month', -1); // 2022-12-01T00:00[America/Los_Angeles]
date.cycle('hour', -1); // 2022-01-01T23:00[America/Los_Angeles]
date.cycle('minute', -1); // 2022-01-01T00:59[America/Los_Angeles]
```

Note that if cycling a field causes another field to become invalid, the date is *constrained*. For example, adding one month to August 31st results in September 30th because September 31st does not exist.

The `round` option may also be passed, which causes the value to be rounded to increments of the given amount. For example, you could round the minute to increments of 15.

```tsx
let date = parseZonedDateTime('2022-02-03T09:22[America/Los_Angeles]');

date.cycle('minute', 15); // 2022-02-03T09:37:00-08:00[America/Los_Angeles]
date.cycle('minute', 15, {round: true}); // 2022-02-03T09:30:00-08:00[America/Los_Angeles]

date.cycle('minute', -15); // 2022-02-03T09:07:00-08:00[America/Los_Angeles]
date.cycle('minute', -15, {round: true}); // 2022-02-03T09:15:00-08:00[America/Los_Angeles]
```

By default, the `hour` field is cycled within a 24 hour range. The `hourCycle` option can be set to `12` to use a 12 hour clock instead, which will preserve the AM/PM value when formatted.

```tsx
let date = parseZonedDateTime('2022-02-03T11:00[America/Los_Angeles]');
date.cycle('hour', 1); // 2022-02-03T12:00[America/Los_Angeles]
date.cycle('hour', 1, {hourCycle: 12}); // 2022-02-03T00:00[America/Los_Angeles]

let date = parseZonedDateTime('2022-02-03T23:00[America/Los_Angeles]');
date.cycle('hour', 1); // 2022-02-03T00:00[America/Los_Angeles]
date.cycle('hour', 1, {hourCycle: 12}); // 2022-02-03T12:00[America/Los_Angeles]
```

Cycling fields is time zone aware. When adjusting a date around a daylight saving time transition, the hour may be adjusted accordingly. For example, in the United States, adding one hour during a "spring forward" transition skips the 2 AM hour, and adding an hour in a "fall back" transition repeats the 1 AM hour. Under the hood, the UTC offset is changing instead.

```tsx
// A "spring forward" transition
let date = parseZonedDateTime('2020-03-08T01:00-08:00[America/Los_Angeles]');
date.cycle('hour', 1); // 2020-03-08T03:00-07:00[America/Los_Angeles]

// A "fall back" transition
let date = parseZonedDateTime('2020-11-01T01:00-07:00[America/Los_Angeles]');
date.cycle('hour', 1); // 2020-11-01T01:00-08:00[America/Los_Angeles]
```

In addition, when changing the date portion of a `ZonedDateTime` around a daylight saving time transition, the hour may change if it is invalid in the target date. For example, during a "spring forward" transition, the 2 AM hour is skipped.

```tsx
// A "spring forward" transition
let date = parseZonedDateTime('2020-03-07T02:00-08:00[America/Los_Angeles]');
date.cycle('day', 1); // 2020-03-08T03:00-07:00[America/Los_Angeles]
```

## Conversion

### To a string

`ZonedDateTime` objects can be converted to an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted string using the `toString` method. This format preserves the maximum amount of information, including the UTC offset and time zone identifier, in the same format used in other languages like Java.

```tsx
let date = new ZonedDateTime(
  2022, 2, 3,
  'America/Los_Angeles', -28800000,
  12, 24, 45
);

date.toString(); // '2022-02-03T12:24:45-08:00[America/Los_Angeles]'
```

If the exact local time and time zone that a user selected is important, use this format. Storing the time zone and offset that was selected rather than converting to UTC ensures that the local time is correct regardless of daylight saving rule changes (e.g. if a locale abolishes DST). Examples where this applies include calendar events, reminders, and other times that occur in a particular location.

You can also use the `toAbsoluteString` method to convert the date to a UTC string. Use this format if the exact time no matter the time zone is needed.

```tsx
date.toAbsoluteString(); // '2022-02-03T20:24:45.000Z'
```

### To a native 

Date object

A `ZonedDateTime` can be converted to a native JavaScript `Date` object using the `toDate` method. In general, the `Date` object should be avoided because it has many internationalization issues and other flaws. However, it is necessary to use some functionality like date formatting.

```tsx
let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');
date.toDate('America/Los_Angeles'); // Thu Feb 03 2022 09:45:00 GMT-0800 (Pacific Standard Time)
```

### To a date or time only

A `ZonedDateTime` can be converted to a [CalendarDate](CalendarDate.md) or [Time](Time.md) object if only one of these components is needed.

Use the `toCalendarDate` function to convert a `ZonedDateTime` to a `CalendarDate`.

```tsx
import {toCalendarDate} from '@internationalized/date';

let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');
toCalendarDate(date); // 2022-02-03
```

Use the `toTime` function to convert a `ZonedDateTime` to a `Time`.

```tsx
import {toTime} from '@internationalized/date';

let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');
toTime(date); // 09:45
```

### To a date and time without a time zone

A `ZonedDateTime` can be converted to a [CalendarDateTime](CalendarDateTime.md), which represents a date and time that is not in any specific time zone. Use this type to represent times that occur at the same local time regardless of the time zone, such as the time of New Years Eve fireworks which always occur at midnight. Most times are better stored as a `ZonedDateTime`.

Use the `toCalendarDateTime` function to convert a `ZonedDateTime` to a `CalendarDateTime`.

```tsx
import {toCalendarDateTime} from '@internationalized/date';

let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');
toCalendarDateTime(date); // 2022-02-03T09:45:00
```

### Between time zones

A `ZonedDateTime` can be converted to a different time zone using the `toTimeZone` function. The `toLocalTimeZone` function can also be used to convert to the current user's local time zone.

```tsx
import {toTimeZone, toLocalTimeZone} from '@internationalized/date';

let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');
toTimeZone(date, 'America/Chicago'); // 2022-02-03T11:45[America/Chicago]
toLocalTimeZone(date); // e.g. 2022-02-03T12:45[America/New_York]
```

## Queries

### Comparison

`ZonedDateTime` objects can be compared either for full or partial equality, or in order to determine which date is before or after another.

The `compare` method can be used to determine if a date is before or after another. It returns a number less than zero if the first date is before the second, zero if the values are equal, or a number greater than zero if the first date is after the second.

```tsx
let a = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');
let b = parseZonedDateTime('2022-03-04T09:45[America/Los_Angeles]');

a.compare(b) < 0; // true
b.compare(a) > 0; // true
```

In addition, the following functions can be used to perform a partial comparison. These functions accept dates in different calendar systems, and the second date is converted to the calendar system of the first date before comparison.

* `isSameYear` – <span>{docs.exports.isSameYear.description}</span>
* `isSameMonth` – <span>{docs.exports.isSameMonth.description}</span>
* `isSameDay` – <span>{docs.exports.isSameDay.description}</span>
* `isToday` – <span>{docs.exports.isToday.description}</span>

```tsx
import {isSameMonth} from '@internationalized/date';

isSameMonth(
  parseZonedDateTime('2022-04-16T09:45[America/Los_Angeles]'),
  parseZonedDateTime('2022-04-30T05:15[America/Los_Angeles]'),
); // true

isSameMonth(
  parseZonedDateTime('2022-04-16T09:45[America/Los_Angeles]'),
  parseZonedDateTime('2022-08-020T05:15[America/Los_Angeles]'),
); // false
```

A similar set of functions is also available that does not convert between calendar systems and requires the calendars to be equal.

* `isEqualYear` – <span>{docs.exports.isEqualYear.description}</span>
* `isEqualMonth` – <span>{docs.exports.isEqualMonth.description}</span>
* `isEqualDay` – <span>{docs.exports.isEqualDay.description}</span>

### Start and end dates

The following functions can be used to find the start or end dates of a particular unit of time. These only affect the date components of a `ZonedDateTime`. The time fields are left unchanged.

* `startOfYear` – <span>{docs.exports.startOfYear.description}</span>
* `endOfYear` – <span>{docs.exports.endOfYear.description}</span>
* `startOfMonth` – <span>{docs.exports.startOfMonth.description}</span>
* `endOfMonth` – <span>{docs.exports.endOfMonth.description}</span>
* `startOfWeek` – <span>{docs.exports.startOfWeek.description}</span>
* `endOfWeek` – <span>{docs.exports.endOfWeek.description}</span>

Note that `startOfWeek` and `endOfWeek` require a locale string to be provided. This is because the first day of the week changes depending on the locale. For example, in the United States, the first day of the week is on Sunday, but in France it is on Monday.

```tsx
import {startOfYear, startOfMonth, startOfWeek} from '@internationalized/date';

let date = parseZonedDateTime('2022-02-03T09:45[America/Los_Angeles]');

startOfYear(date); // 2022-01-01T09:45[America/Los_Angeles]
startOfMonth(date); // 2022-02-01T09:45[America/Los_Angeles]
startOfWeek(date, 'en-US'); // 2022-01-30T09:45[America/Los_Angeles]
startOfWeek(date, 'fr-FR'); // 2022-01-31T09:45[America/Los_Angeles]
```

You can also provide an optional `firstDayOfWeek` argument to override the default first day of the week determined by the locale. It accepts a week day abbreviation, e.g. `sun`, `mon`, `tue`, etc.

```tsx
startOfWeek(date, 'en-US', 'mon'); // 2022-01-31T09:45[America/Los_Angeles]
```

### Day of week

The `getDayOfWeek` function returns the day of the week for the given date and locale. Days are numbered from zero to six, where zero is the first day of the week in the given locale. For example, in the United States, the first day of the week is Sunday, but in France it is Monday.

```tsx
import {getDayOfWeek} from '@internationalized/date';

let date = parseZonedDateTime('2022-02-06T08:30[America/Los_Angeles]'); // a Sunday

getDayOfWeek(date, 'en-US'); // 0
getDayOfWeek(locale, 'fr-FR'); // 6
```

You can also provide an optional `firstDayOfWeek` argument to override the default first day of the week determined by the locale. It accepts a week day abbreviation, e.g. `sun`, `mon`, `tue`, etc.

```tsx
getDayOfWeek(date, 'en-US', 'mon'); // 6
```

### Weekdays and weekends

The `isWeekday` and `isWeekend` functions can be used to determine if a date is weekday or weekend respectively. This depends on the locale. For example, in the United States, weekends are Saturday and Sunday, but in Israel they are Friday and Saturday.

```tsx
import {isWeekday, isWeekend} from '@internationalized/date';

let date = parseZonedDateTime('2022-02-06T08:30[America/Los_Angeles]'); // a Sunday

isWeekday(date, 'en-US'); // false
isWeekday(date, 'he-IL'); // true

isWeekend(date, 'en-US'); // true
isWeekend(date, 'he-IL'); // false
```

### Weeks in month

The `getWeeksInMonth` function returns the number of weeks in the given month. This depends on the number of days in the month, what day of the week the month starts on, and the given locale. For example, in the United States, the first day of the week is Sunday, but in France it is Monday.

```tsx
import {getWeeksInMonth} from '@internationalized/date';

let date = parseZonedDateTime('2023-01-01T08:30[America/Los_Angeles]');

getWeeksInMonth(date, 'en-US'); // 5
getWeeksInMonth(date, 'fr-FR'); // 6
```

You can also provide an optional `firstDayOfWeek` argument to override the default first day of the week determined by the locale. It accepts a week day abbreviation, e.g. `sun`, `mon`, `tue`, etc.

```tsx
getWeeksInMonth(date, 'en-US', 'mon'); // 6
```

## Related 

Types

### parse

ZonedDateTime

`parseZonedDateTime(value: string, disambiguation?: Disambiguation): ZonedDateTime`

Parses an ISO 8601 date and time string with a time zone extension and optional UTC offset
(e.g. "2021-11-07T00:45\[America/Los\_Angeles]" or "2021-11-07T00:45-07:00\[America/Los\_Angeles]").
Ambiguous times due to daylight saving time transitions are resolved according to the \`disambiguation\`
parameter.

### parse

Absolute

`parseAbsolute(value: string, timeZone: string): ZonedDateTime`

Parses an ISO 8601 date and time string with a UTC offset (e.g. "2021-11-07T07:45:00Z"
or "2021-11-07T07:45:00-07:00"). The result is converted to the provided time zone.

### parse

AbsoluteToLocal

`parseAbsoluteToLocal(value: string): ZonedDateTime`

Parses an ISO 8601 date and time string with a UTC offset (e.g. "2021-11-07T07:45:00Z"
or "2021-11-07T07:45:00-07:00"). The result is converted to the user's local time zone.

### from

Date

`fromDate(date: Date, timeZone: string): ZonedDateTime`

Takes a \`Date\` object and converts it to the provided time zone.

### from

Absolute

`fromAbsolute(ms: number, timeZone: string): ZonedDateTime`

Takes a Unix epoch (milliseconds since 1970) and converts it to the provided time zone.

### now

`now(timeZone: string): ZonedDateTime`

Returns the current time in the given time zone.

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

### to

TimeZone

`toTimeZone(date: ZonedDateTime, timeZone: string): ZonedDateTime`

Converts a \`ZonedDateTime\` from one time zone to another.

### to

LocalTimeZone

`toLocalTimeZone(date: ZonedDateTime): ZonedDateTime`

Converts the given \`ZonedDateTime\` into the user's local time zone.

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
