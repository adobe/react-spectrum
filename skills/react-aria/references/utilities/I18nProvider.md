# I18n

Provider

Provides the locale for the application to all child components.

```tsx
import {I18nProvider} from '@react-aria/i18n';

<I18nProvider locale="fr-FR">
  <YourApp />
</I18nProvider>
```

## Introduction

`I18nProvider` allows you to override the default locale as determined by the browser/system setting
with a locale defined by your application (e.g. application setting). This should be done by wrapping
your entire application in the provider, which will be cause all child elements to receive the new locale
information via [useLocale](useLocale.md).

## A

PI

### I18n

Provider

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | Contents that should have the locale applied. |
| `locale` | `string | undefined` | — | The locale to apply to the children. |
