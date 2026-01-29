# use

FocusVisible

Manages focus visible state for the page, and subscribes individual components for updates.

```tsx
import {useFocusVisible} from 'react-aria';

function Example() {
  let {isFocusVisible} = useFocusVisible({isTextInput: true});

  return (
    <>
      <div>Focus visible: {String(isFocusVisible)}</div>
      <label style={{display: 'block'}}>
        First Name: <input />
      </label>
      <label style={{display: 'block'}}>
        Last Name: <input />
      </label>
    </>
  );
}
```

## Features

`useFocusVisible` handles focus interactions for the page and determines whether keyboard focus
should be visible (e.g. with a focus ring). Focus visibility is computed based on the current
interaction mode of the user. When the user interacts via a mouse or touch, then focus is not
visible. When the user interacts via a keyboard or screen reader, then focus is visible. This is similar to
the [:focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) pseudo class
in CSS.

To determine whether a focus ring should be visible for an individual component rather than
globally, see [useFocusRing](useFocusRing.md).

## A

PI

<FunctionAPI
  function={docs.exports.useFocusVisible}
  links={docs.links}
/>

### Focus

VisibleProps

| Name | Type | Description |
|------|------|-------------|
| `isTextInput` | `boolean | undefined` | Whether the element is a text input. |
| `autoFocus` | `boolean | undefined` | Whether the element will be auto focused. |

### Focus

VisibleResult

| Name | Type | Description |
|------|------|-------------|
| `isFocusVisible` \* | `boolean` | Whether keyboard focus is visible globally. |
