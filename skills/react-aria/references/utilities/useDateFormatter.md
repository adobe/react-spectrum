# use

DateFormatter

Provides localized date formatting for the current locale. Automatically updates when the locale changes,
and handles caching of the date formatter for performance.

## Introduction

`useDateFormatter` wraps a builtin browser [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
object to provide a React Hook that integrates with the i18n system in React Aria. It handles formatting dates for the current locale,
updating when the locale changes, and caching of date formatters for performance. See the
[Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) docs for
information on formatting options.

## Example

This example displays the current date for two locales: USA, and Russia. Two instances of the `CurrentDate` component are rendered,
using the [I18nProvider](I18nProvider.md) to specify the locale to display.

```tsx
'use client';
import {I18nProvider, useDateFormatter} from 'react-aria';

function CurrentDate() {
  let formatter = useDateFormatter();

  return (
    <p>{formatter.format(new Date())}</p>
  );
}

<>
  <I18nProvider locale="en-US">
    <CurrentDate />
  </I18nProvider>
  <I18nProvider locale="ru-RU">
    <CurrentDate />
  </I18nProvider>
</>
```

## A

PI

<FunctionAPI
  function={docs.exports.useDateFormatter}
  links={docs.links}
/>

### Date

FormatterOptions

| Name | Type | Description |
|------|------|-------------|
| `calendar` | `string | undefined` | — |
| `localeMatcher` | `"best fit" | "lookup" | undefined` | — |
| `weekday` | `"long" | "short" | "narrow" | undefined` | — |
| `era` | `"long" | "short" | "narrow" | undefined` | — |
| `year` | `"numeric" | "2-digit" | undefined` | — |
| `month` | `"numeric" | "long" | "short" | "narrow" | "2-digit" | undefined` | — |
| `day` | `"numeric" | "2-digit" | undefined` | — |
| `hour` | `"numeric" | "2-digit" | undefined` | — |
| `minute` | `"numeric" | "2-digit" | undefined` | — |
| `second` | `"numeric" | "2-digit" | undefined` | — |
| `timeZoneName` | `"long" | "short" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric" | undefined` | — |
| `formatMatcher` | `"best fit" | "basic" | undefined` | — |
| `hour12` | `boolean | undefined` | — |
| `timeZone` | `string | undefined` | — |
| `dayPeriod` | `"long" | "short" | "narrow" | undefined` | — |
| `numberingSystem` | `string | undefined` | — |
| `dateStyle` | `"long" | "short" | "full" | "medium" | undefined` | — |
| `timeStyle` | `"long" | "short" | "full" | "medium" | undefined` | — |
| `hourCycle` | `"h11" | "h12" | "h23" | "h24" | undefined` | — |
| `fractionalSecondDigits` | `1 | 2 | 3 | undefined` | — |

### Date

Formatter
