# Inline

Alert

Inline alerts display a non-modal message associated with objects in a view.
These are often used in form validation, providing a place to aggregate feedback related to multiple fields.

```tsx
import {InlineAlert, Heading, Content} from '@react-spectrum/s2';

<InlineAlert>
  <Heading>Payment Information</Heading>
  <Content>Enter your billing address, shipping address, and payment method to complete your purchase.</Content>
</InlineAlert>
```

## Auto focus

Use the `autoFocus` prop to focus the alert when it first renders. This is useful for displaying alerts that need immediate attention, such as form submission errors.

```tsx
import {InlineAlert, Heading, Content, Button} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

function Example() {
  let [shown, setShown] = useState(false);

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center'})}>
      <Button variant="primary" onPress={() => setShown(!shown)}>
        {shown ? 'Hide Alert' : 'Show Alert'}
      </Button>
      {shown &&
        <InlineAlert variant="negative" autoFocus>
          <Heading>Error</Heading>
          <Content>There was an error processing your request. Please try again.</Content>
        </InlineAlert>
      }
    </div>
  );
}
```

## A

PI

```tsx
<InlineAlert>
  <Heading />
  <Content />
</InlineAlert>
```

### Inline

Alert

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `autoFocus` | `boolean | undefined` | — | Whether to automatically focus the Inline Alert when it first renders. |
| `children` | `ReactNode` | — | The contents of the Inline Alert. |
| `fillStyle` | `"border" | "subtleFill" | "boldFill" | undefined` | border | The visual style of the Inline Alert. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `variant` | `"informative" | "positive" | "notice" | "negative" | "neutral" | undefined` | neutral | The semantic tone of a Inline Alert. |
