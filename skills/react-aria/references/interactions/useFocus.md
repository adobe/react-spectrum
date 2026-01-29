# use

Focus

Handles focus events for the immediate target.
Focus events on child elements will be ignored.

```tsx

import React from 'react';
import {useFocus} from 'react-aria';

function Example() {
  let [events, setEvents] = React.useState<string[]>([]);
  let {focusProps} = useFocus({
    onFocus: e => setEvents(
      events => [...events, 'focus']
    ),
    onBlur: e => setEvents(
      events => [...events, 'blur']
    ),
    onFocusChange: isFocused => setEvents(
      events => [...events, `focus change: ${isFocused}`]
    )
  });

  return (
    <>
      <label htmlFor="example">Example</label>
      <input
        {...focusProps}
        id="example" />
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

`useFocus` handles focus interactions for an element. Unlike React's built-in focus events,
`useFocus` does not fire focus events for child elements of the target. This matches DOM
behavior where focus events do not bubble. This is similar to
the [:focus](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus) pseudo class
in CSS.

To handle focus events on descendants of an element, see [useFocusWithin](useFocusWithin.md).

## A

PI

<FunctionAPI
  function={docs.exports.useFocus}
  links={docs.links}
/>

### Focus

Props

| Name | Type | Description |
|------|------|-------------|
| `isDisabled` | `boolean | undefined` | Whether the focus events should be disabled. |
| `onFocus` | `((e: FocusEvent<Target, Element>) => void) | undefined` | Handler that is called when the element receives focus. |
| `onBlur` | `((e: FocusEvent<Target, Element>) => void) | undefined` | Handler that is called when the element loses focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | Handler that is called when the element's focus status changes. |

### Focus

Result

| Name | Type | Description |
|------|------|-------------|
| `focusProps` \* | `DOMAttributes<Target>` | Props to spread onto the target element. |
