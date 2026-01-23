# Focus

Ring

A utility component that applies a CSS class when an element has keyboard focus.
Focus rings are visible only when the user is interacting with a keyboard,
not with a mouse, touch, or other input methods.

```tsx
'use client';
import {FocusRing} from '@react-aria/focus';
import './FocusRingExample.css';

<FocusRing focusRingClass="focus-ring">
  <button className="button">Test</button>
</FocusRing>
```

## Features

`FocusRing` is a utility component that can be used to apply a CSS class when an element has keyboard focus.
This helps keyboard users determine which element on a page or in an application has keyboard focus as they
navigate around. Focus rings are only visible when interacting with a keyboard so as not to distract mouse
and touch screen users. When we are unable to detect if the user is using a mouse or touch screen, such as
switching in from a different tab, we show the focus ring.

If CSS classes are not being used for styling, see [useFocusRing](useFocusRing.md) for a hooks version.

## A

PI

### Focus

Ring

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `autoFocus` | `boolean | undefined` | — | Whether the element will be auto focused. |
| `children` | `React.ReactElement<unknown, string | React.JSXElementConstructor<any>>` | — | Child element to apply CSS classes to. |
| `focusClass` | `string | undefined` | — | CSS class to apply when the element is focused. |
| `focusRingClass` | `string | undefined` | — | CSS class to apply when the element has keyboard focus. |
| `isTextInput` | `boolean | undefined` | — | Whether the element is a text input. |
| `within` | `boolean | undefined` | false | Whether to show the focus ring when something inside the container element has focus (true), or only if the container itself has focus (false). |
