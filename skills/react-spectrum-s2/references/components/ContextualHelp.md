# Contextual

Help

Contextual help shows a user extra information about the state of an adjacent component, or a total view.

```tsx
import {ContextualHelp, Heading, Content, Footer, Link} from '@react-spectrum/s2';

<ContextualHelp>
  <Heading>Permission required</Heading>
  <Content>Your admin must grant you permission before you can create a segment.</Content>
  <Footer>
    <Link isStandalone href="#" target="_blank">Learn more about segments</Link>
  </Footer>
</ContextualHelp>
```

## A

PI

```tsx
<ContextualHelp>
  <Heading />
  <Content />
  <Footer />
</ContextualHelp>
```

### Contextual

Help

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | Contents of the Contextual Help popover. |
| `containerPadding` | `number | undefined` | 12 | The placement padding that should be applied between the element and its surrounding container. |
| `crossOffset` | `number | undefined` | 0 | The additional offset applied along the cross axis between the element and its anchor element. |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
| `offset` | `number | undefined` | 8 | The additional offset applied along the main axis between the element and its anchor element. |
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Handler that is called when the overlay's open state changes. |
| `placement` | `Placement | undefined` | 'bottom start' | The placement of the popover with respect to the action button. |
| `shouldFlip` | `boolean | undefined` | true | Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely. |
| `size` | `"XS" | "S" | undefined` | 'XS' | The size of the ActionButton. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `variant` | `"info" | "help" | undefined` | 'help' | Indicates whether contents are informative or provides helpful guidance. |
