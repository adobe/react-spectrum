# Image

An image with support for skeleton loading and custom error states.

```tsx
import {Image} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<Image
  
  styles={style({width: 400, maxWidth: 'full', borderRadius: 'default'})} />
```

## Conditional sources

Set the `src` prop to an array of objects describing conditional images, e.g. media queries or image formats. These accept the same props as the \<[source](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source)> HTML element, as well as `colorScheme` to conditionally render images based on the [Provider](Provider.md) color scheme.

```tsx
import {Image, Provider} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<Provider>
  <Image
    /*- begin highlight -*/
    src={[
      {colorScheme: 'light', srcSet: 'https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
      {colorScheme: 'dark', srcSet: 'https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
    ]}
    /*- end highlight -*/
    alt="Conditional image"
    styles={style({height: 300, maxWidth: 'full', borderRadius: 'default'})} />
</Provider>
```

## Error state

Use `renderError` to display a custom error UI when an image fails to load.

```tsx
import {Image} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import ErrorIcon from '@react-spectrum/s2/illustrations/linear/AlertNotice';

<Image
  src=""
  alt="Error image"
  styles={style({width: 400, maxWidth: 'full', height: 200, borderRadius: 'default'})}
  renderError={() => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', height: 'full'})}>
      <ErrorIcon />
      <span className={style({font: 'body'})}>Error loading image</span>
    </div>
  )} />
```

## Image

Coordinator

An `ImageCoordinator` coordinates loading behavior for a group of images. Images within an ImageCoordinator are revealed together once all of them have loaded.

```tsx
import {ImageCoordinator, Image} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<ImageCoordinator>
  <div
    className={style({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gridTemplateRows: [180],
      gap: 8
    })}>
    <Image alt="" src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" styles={style({objectFit: 'cover', borderRadius: 'sm'})} />
    <Image alt="" src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" styles={style({objectFit: 'cover', borderRadius: 'sm'})} />
    <Image alt="" src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" styles={style({objectFit: 'cover', borderRadius: 'sm'})} />
    <Image alt="" src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" styles={style({objectFit: 'cover', borderRadius: 'sm'})} />
  </div>
</ImageCoordinator>
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `alt` | `string | undefined` | — | Accessible alt text for the image. |
| `crossOrigin` | `"anonymous" | "use-credentials" | undefined` | — | Indicates if the fetching of the image must be done using a CORS request. [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin). |
| `decoding` | `"auto" | "async" | "sync" | undefined` | — | Whether the browser should decode images synchronously or asynchronously. [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#decoding). |
| `fetchPriority` | `"auto" | "high" | "low" | undefined` | — | Provides a hint of the relative priority to use when fetching the image. [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#fetchpriority). |
| `group` | `ImageGroup | undefined` | — | A group of images to coordinate between, matching the group passed to the `<ImageCoordinator>` component. If not provided, the default image group is used. |
| `height` | `number | undefined` | — | The intrinsic height of the image. [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#height). |
| `itemProp` | `string | undefined` | — | Associates the image with a microdata object. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/itemprop). |
| `loading` | `"eager" | "lazy" | undefined` | — | Whether the image should be loaded immediately or lazily when scrolled into view. [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading). |
| `referrerPolicy` | `HTMLAttributeReferrerPolicy | undefined` | — | A string indicating which referrer to use when fetching the resource. [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#referrerpolicy). |
| `renderError` | `(() => ReactNode) | undefined` | — | A function that is called to render a fallback when the image fails to load. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `src` | `string | ImageSource[] | undefined` | — | The URL of the image or a list of conditional sources. |
| `styles` | `StyleString | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `width` | `number | undefined` | — | The intrinsic width of the image. [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#width). |
