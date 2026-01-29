# use

Press

Handles press interactions across mouse, touch, keyboard, and screen readers.
It normalizes behavior across browsers and platforms, and handles many nuances
of dealing with pointer and keyboard events.

```tsx
import React from 'react';
import {usePress} from 'react-aria';

function Example() {
  let [events, setEvents] = React.useState<string[]>([]);
  let {pressProps, isPressed} = usePress({
    onPressStart: e => setEvents(
      events => [...events, `press start with ${e.pointerType}`]
    ),
    onPressEnd: e => setEvents(
      events => [...events, `press end with ${e.pointerType}`]
    ),
    onPress: e => setEvents(
      events => [...events, `press with ${e.pointerType}`]
    )
  });

  return (
    <>
      <div
        {...pressProps}
        style={{
          background: isPressed ? 'darkgreen' : 'green',
          color: 'white',
          display: 'inline-block',
          padding: '8px 12px',
          borderRadius: 8,
          cursor: 'pointer'
        }}
        role="button"
        tabIndex={0}>
        Press me!
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

`usePress` returns the current press state, which can be used to adjust the visual appearance of the target. If the pointer is released over the target, then an `onPress` event is fired.

* Handles mouse and touch events
* Handles <Keyboard>Enter</Keyboard> or <Keyboard>Space</Keyboard> key presses
* Handles screen reader virtual clicks
* Normalizes focus behavior on mouse and touch interactions across browsers
* Disables text selection while the press interaction is active
* Cancels press interactions on scroll
* Normalizes many cross browser inconsistencies

Read our [blog post](blog/building-a-button-part-1.md) learn more.

## A

PI

<FunctionAPI
  function={docs.exports.usePress}
  links={docs.links}
/>

### Press

Events

### Press

Result

| Name | Type | Description |
|------|------|-------------|
| `isPressed` \* | `boolean` | Whether the target is currently pressed. |
| `pressProps` \* | `DOMAttributes<FocusableElement>` | Props to spread on the target element. |

### Press

Event
