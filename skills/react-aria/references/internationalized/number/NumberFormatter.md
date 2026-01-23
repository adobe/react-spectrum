# Number

Formatter

A wrapper around Intl.NumberFormat providing additional options, polyfills, and caching for performance.

## Introduction

`NumberFormatter` is a wrapper around the native [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) API. It exposes the same API, but works around several browser bugs and provides polyfills for newer features. These are currently:

* A polyfill for the `signDisplay` option.
* A polyfill for the `unit` style, currently only for the `degree` unit in the `narrow` style

See the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) for full details on how to use the API.

## Interface

### Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| `locale` | `string` | — |
| `options` | `NumberFormatOptions` | — |
