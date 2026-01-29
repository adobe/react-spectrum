# use

NumberFormatter

Provides localized number formatting for the current locale. Automatically updates when the locale changes,
and handles caching of the number formatter for performance.

## Introduction

`useNumberFormatter` wraps a builtin browser [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
object to provide a React Hook that integrates with the i18n system in React Aria. It handles formatting numbers for the current locale,
updating when the locale changes, and caching of number formatters for performance. See the
[Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) docs for
information on formatting options.

## Example

This example displays a currency value for two locales: USA, and Germany. Two instances of the `Currency` component are rendered,
using the [I18nProvider](I18nProvider.md) to specify the locale to display.

```tsx
'use client';
import {I18nProvider, useNumberFormatter} from 'react-aria';

function Currency({value, currency}) {
  let formatter = useNumberFormatter({
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  });

  return (
    <p>{formatter.format(value)}</p>
  );
}

<>
  <I18nProvider locale="en-US">
    <Currency value={125000} currency="USD" />
  </I18nProvider>
  <I18nProvider locale="de-DE">
    <Currency value={350000} currency="EUR" />
  </I18nProvider>
</>
```

## A

PI

<FunctionAPI
  function={docs.exports.useNumberFormatter}
  links={docs.links}
/>

### Number

FormatOptions
