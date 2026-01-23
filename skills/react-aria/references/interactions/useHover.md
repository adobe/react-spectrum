# use

Hover

Handles pointer hover interactions for an element. Normalizes behavior
across browsers and platforms, and ignores emulated mouse events on touch devices.

```tsx
import React from 'react';
import {useHover} from 'react-aria';

function Example() {
  let [events, setEvents] = React.useState<string[]>([]);
  let {hoverProps, isHovered} = useHover({
    onHoverStart: e => setEvents(
      events => [...events, `hover start with ${e.pointerType}`]
    ),
    onHoverEnd: e => setEvents(
      events => [...events, `hover end with ${e.pointerType}`]
    )
  });

  return (
    <>
      <div
        {...hoverProps}
        style={{
          background: isHovered ? 'darkgreen' : 'green',
          color: 'white',
          display: 'inline-block',
          padding: '8px 12px',
          borderRadius: 8,
          cursor: 'pointer'
        }}
        role="button"
        tabIndex={0}>
        Hover me!
      </div>
      <ul
        style={{
          maxHeight: '200px',
          overflow: 'auto'
        }}>
        {events.map((e, i) => <li key={i}>{e}</li>)}
      </ul>
    </>
  );
}
```

## Features

`useHover` is similar to the [:hover](https://developer.mozilla.org/en-US/docs/Web/CSS/:hover) CSS pseudo class, but only applies on mouse interactions. `:hover` is sticky on touch devices, applying continuously until the user interacts with another element, and on devices with both mouse and touch support there is no CSS-only way to apply hover states only when interacting with a pointer. Read our [blog post](blog/building-a-button-part-2.md) to learn more.

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>Hover interactions should never be the only way to interact with an element because they are not
  supported across all devices. Alternative interactions should be provided on touch devices, for
  example a long press or an explicit button to tap.</Content>
</InlineAlert>

## A

PI

<FunctionAPI
  function={docs.exports.useHover}
  links={docs.links}
/>

### Hover

Props

| Name | Type | Description |
|------|------|-------------|
| `isDisabled` | `boolean | undefined` | Whether the hover events should be disabled. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | Handler that is called when a hover interaction starts. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | Handler that is called when a hover interaction ends. |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | Handler that is called when the hover state changes. |

### Hover

Result

| Name | Type | Description |
|------|------|-------------|
| `hoverProps` \* | `DOMAttributes<FocusableElement>` | Props to spread on the target element. |
| `isHovered` \* | `boolean` | — |

### Hover

Event
