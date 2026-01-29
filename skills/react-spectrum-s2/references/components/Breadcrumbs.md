# Breadcrumbs

Breadcrumbs show hierarchy and navigational context for a user's location within an application.

```tsx
import {Breadcrumbs, Breadcrumb} from '@react-spectrum/s2';

<Breadcrumbs>
  <Breadcrumb href="#">Home</Breadcrumb>
  <Breadcrumb href="#">React Spectrum</Breadcrumb>
  <Breadcrumb>Breadcrumbs</Breadcrumb>
</Breadcrumbs>
```

## Content

`Breadcrumbs` follows the [Collection Components API](collections.md?component=Breadcrumbs), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children. The `onAction` event is called when a user presses a breadcrumb.

```tsx
import {Breadcrumbs, Breadcrumb, type Key} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [breadcrumbs, setBreadcrumbs] = useState([
    {id: 1, label: 'Home'},
    {id: 2, label: 'Library'},
    {id: 3, label: 'Documents'},
    {id: 4, label: 'Annual Reports'}
  ]);

  let navigate = (id: Key) => {
    let i = breadcrumbs.findIndex(item => item.id === id);
    setBreadcrumbs(breadcrumbs.slice(0, i + 1));
  };

  return (
    /*- begin highlight -*/
    <Breadcrumbs items={breadcrumbs} onAction={navigate}>
      {item => <Breadcrumb>{item.label}</Breadcrumb>}
    </Breadcrumbs>
    /*- end highlight -*/
  );
}
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>When breadcrumbs are used as a main navigation element for a page, they can be placed in a [navigation landmark](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation). Landmarks help assistive technology users quickly find major sections of a page. Place breadcrumbs inside a `<nav>` element with an `aria-label` to create a navigation landmark.</Content>
</InlineAlert>

### Overflow 

Behavior

Breadcrumbs automatically collapse items into a menu when space is limited. A maximum of 4 items are shown including the root and menu button.

```tsx
import {Breadcrumbs, Breadcrumb} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div
  className={style({
    width: 400,
    maxWidth: 'full',
    padding: 16,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid', 
    borderColor: 'gray-300',
    borderRadius: 'default',
    resize: 'horizontal',
    overflow: 'hidden'
  })}>
  {/*- begin focus -*/}
  <Breadcrumbs>
    <Breadcrumb>Documents</Breadcrumb>
    <Breadcrumb>My Shared Folder</Breadcrumb>
    <Breadcrumb>Projects and Workflows</Breadcrumb>
    <Breadcrumb>Annual Reports 2024</Breadcrumb>
    <Breadcrumb>Marketing Materials</Breadcrumb>
    <Breadcrumb>Q3 Campaign Assets</Breadcrumb>
    <Breadcrumb>Final Deliverables</Breadcrumb>
  </Breadcrumbs>
  {/*- end focus -*/}
</div>
```

## A

PI

```tsx
<Breadcrumbs>
  <Breadcrumb />
</Breadcrumbs>
```

### Breadcrumbs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode | ((item: T) => ReactNode)` | — | The children of the Breadcrumbs. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the breadcrumbs are disabled. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `onAction` | `((key: Key) => void) | undefined` | — | Handler that is called when a breadcrumb is clicked. |
| `size` | `"M" | "L" | undefined` | 'M' | Size of the Breadcrumbs including spacing and layout. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Breadcrumb

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The children of the breadcrumb item. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | A unique id for the breadcrumb, which will be passed to `onAction` when the breadcrumb is pressed. |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
