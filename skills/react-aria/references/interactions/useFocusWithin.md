# use

FocusWithin

Handles focus events for the target and its descendants.

```tsx
import React from 'react';
import {useFocusWithin} from 'react-aria';

function Example() {
  let [events, setEvents] = React.useState<string[]>([]);
  let [isFocusWithin, setFocusWithin] = React.useState(false);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithin: e => setEvents(
      events => [...events, 'focus within']
    ),
    onBlurWithin: e => setEvents(
      events => [...events, 'blur within']
    ),
    onFocusWithinChange: isFocusWithin => setFocusWithin(isFocusWithin)
  });

  return (
    <>
      <div
        {...focusWithinProps}
        style={{
          display: 'inline-block',
          border: '1px solid gray',
          padding: 10,
          background: isFocusWithin ? 'goldenrod' : '',
          color: isFocusWithin ? 'black' : ''
        }}>
        <label style={{display: 'block'}}>
          First Name: <input />
        </label>
        <label style={{display: 'block'}}>
          Last Name: <input />
        </label>
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

`useFocusWithin` handles focus interactions for an element and its descendants. Focus is "within"
an element when either the element itself or a descendant element has focus. This is similar to
the [:focus-within](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-within) pseudo class
in CSS.

To handle focus events on only the target element, and not descendants, see [useFocus](useFocus.md).

## A

PI

<FunctionAPI
  function={docs.exports.useFocusWithin}
  links={docs.links}
/>

### Focus

WithinProps

| Name | Type | Description |
|------|------|-------------|
| `isDisabled` | `boolean | undefined` | Whether the focus within events should be disabled. |
| `onFocusWithin` | `((e: FocusEvent) => void) | undefined` | Handler that is called when the target element or a descendant receives focus. |
| `onBlurWithin` | `((e: FocusEvent) => void) | undefined` | Handler that is called when the target element and all descendants lose focus. |
| `onFocusWithinChange` | `((isFocusWithin: boolean) => void) | undefined` | Handler that is called when the the focus within state changes. |

### Focus

WithinResult

| Name | Type | Description |
|------|------|-------------|
| `focusWithinProps` \* | `DOMAttributes<FocusableElement>` | Props to spread onto the target element. |
