# use

Locale

Returns the current locale and layout direction.

## Introduction

`useLocale` allows components to access the current locale and interface layout direction.
By default, this is automatically detected based on the browser or system language, but it can
be overridden by using the [I18nProvider](I18nProvider.md) at the root of your app.

`useLocale` should be used in the root of your app to define the
[lang](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang)
and [dir](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir) attributes
so that the browser knows which language and direction the user interface should be rendered in.

## Example

```tsx
import {useLocale} from 'react-aria';

function YourApp() {
  let {locale, direction} = useLocale();

  return (
    <div lang={locale} dir={direction}>
      {/* your app here */}
    </div>
  );
}
```

## A

PI

<FunctionAPI
  function={docs.exports.useLocale}
  links={docs.links}
/>

### Locale
