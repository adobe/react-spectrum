# Date

Formatter

A wrapper around Intl.DateTimeFormat that fixes various browser bugs, and polyfills new features.

## Introduction

`DateFormatter` is a wrapper around the native [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) API. It exposes the same API, but works around several browser bugs and provides polyfills for newer features. These are currently:

* A simple polyfill for the `formatRange` and `formatRangeToParts` methods for older browsers.
* A workaround for a bug involving the `hour12` option in [Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=1045791) and and the [ECMAScript spec](https://github.com/tc39/ecma402/issues/402).
* A workaround for a bug involving the `hourCycle` option in [Safari](https://bugs.webkit.org/show_bug.cgi?id=229313).

See the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) for full details on how to use the API.

## Interface

### Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| `locale` | `string` | — |
| `options` | `Intl.DateTimeFormatOptions` | — |
