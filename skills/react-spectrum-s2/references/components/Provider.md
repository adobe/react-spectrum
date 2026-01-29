# Provider

Provider is the container for all React Spectrum components.
It loads the font and sets the colorScheme, locale, and other application level settings.

```tsx
'use client';
import {Button, Provider} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};


<Provider
  
  styles={style({padding: 12})}
>
  <Button>
    Hello React Spectrum!
  </Button>
</Provider>
```

## Locales

By default, React Spectrum chooses the locale matching the user’s browser/operating system language, but this can be overridden with the locale prop if you have an application specific setting. This prop accepts a [BCP 47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code.

```tsx
<Provider locale="en-US">
  <YourApp />
</Provider>
```

<Disclosure isQuiet>
  <DisclosureTitle>Supported Locales</DisclosureTitle>

  <DisclosurePanel>
    <ul style={{columnWidth: 200, paddingLeft: 16, fontFamily: 'adobe-clean-spectrum-vf'}}>
      <li>Arabic (United Arab Emirates)</li>
      <li>Bulgarian (Bulgaria)</li>
      <li>Chinese (Simplified)</li>
      <li>Chinese (Traditional)</li>
      <li>Croatian (Croatia)</li>
      <li>Czech (Czech Republic)</li>
      <li>Danish (Denmark)</li>
      <li>Dutch (Netherlands)</li>
      <li>English (Great Britain)</li>
      <li>English (United States)</li>
      <li>Estonian (Estonia)</li>
      <li>Finnish (Finland)</li>
      <li>French (Canada)</li>
      <li>French (France)</li>
      <li>German (Germany)</li>
      <li>Greek (Greece)</li>
      <li>Hebrew (Israel)</li>
      <li>Hungarian (Hungary)</li>
      <li>Italian (Italy)</li>
      <li>Japanese (Japan)</li>
      <li>Korean (Korea)</li>
      <li>Latvian (Latvia)</li>
      <li>Lithuanian (Lithuania)</li>
      <li>Norwegian (Norway)</li>
      <li>Polish (Poland)</li>
      <li>Portuguese (Brazil)</li>
      <li>Romanian (Romania)</li>
      <li>Russian (Russia)</li>
      <li>Serbian (Serbia)</li>
      <li>Slovakian (Slovakia)</li>
      <li>Slovenian (Slovenia)</li>
      <li>Spanish (Spain)</li>
      <li>Swedish (Sweden)</li>
      <li>Turkish (Turkey)</li>
      <li>Ukrainian (Ukraine)</li>
    </ul>
  </DisclosurePanel>
</Disclosure>

## Client side routing

The Provider component accepts an optional `router` prop. This enables React Spectrum components that render links to perform client side navigation using your application or framework's client side router. See the [getting started guide](getting-started.md) for details on how to set this up.

```tsx
let navigate = useNavigateFromYourRouter();

<Provider router={{navigate}}>
  <YourApp />
</Provider>
```

## Server side rendering

When using SSR, the `<Provider>` component can be rendered as the root `<html>` element. The `locale` prop should always be specified to avoid hydration errors.

```tsx
<Provider elementType="html" locale="en-US">
  <YourApp />
</Provider>
```

## A

PI

### Provider

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `background` | `"base" | "layer-1" | "layer-2" | undefined` | — | The background for this provider. If not provided, the background is transparent. |
| `children` | `ReactNode` | — | The content of the Provider. |
| `colorScheme` | `ColorScheme | undefined` | — | The color scheme for your application. Defaults to operating system preferences. |
| `elementType` | `keyof JSX.IntrinsicElements | undefined` | div | The DOM element to render. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `locale` | `string | undefined` | 'en-US' | The locale for your application as a [BCP 47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code. Defaults to the browser/OS language setting. |
| `router` | `Router | undefined` | — | Provides a client side router to all nested React Spectrum links to enable client side navigation. |
| `styles` | `StyleString | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
