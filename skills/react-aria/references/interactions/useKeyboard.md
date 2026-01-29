# use

Keyboard

Handles keyboard interactions for a focusable element.

```tsx
"use client"
import React from 'react';
import {useKeyboard} from 'react-aria';

function Example() {
  let [events, setEvents] = React.useState<string[]>([]);
  let {keyboardProps} = useKeyboard({
    onKeyDown: e => setEvents(
      events => [`key down: ${e.key}`, ...events]
    ),
    onKeyUp: e => setEvents(
      events => [`key up: ${e.key}`, ...events]
    )
  });

  return (
    <>
      <label htmlFor="example">Example</label>
      <input
        {...keyboardProps}
        id="example" />
      <ul style={{
        height: 100,
        overflow: 'auto',
        border: '1px solid gray',
        width: 200
      }}>
        {events.map((e, i) => <li key={i}>{e}</li>)}
      </ul>
    </>
  );
}
```

## Features

`useKeyboard` handles keyboard interactions. The only difference from DOM events is that propagation
is stopped by default if there is an event handler, unless `event.continuePropagation()` is called.
This provides better modularity by default, so that a parent component doesn't respond to an event
that a child already handled. If the child doesn't handle the event (e.g. it was for an unknown key),
it can call `event.continuePropagation()` to allow parents to handle the event.

## A

PI

<FunctionAPI
  function={docs.exports.useKeyboard}
  links={docs.links}
/>

### Keyboard

Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` \* | `ReactNode` | — | Keyboard shortcut text. |
| `slot` | `string | undefined` | 'keyboard' | A slot to place the keyboard shortcut in. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `UNSAFE_className` | `string | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use style props instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use style props instead. |
| `margin` | `Responsive<DimensionValue> | undefined` | — | The margin for all four sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin). |
| `marginStart` | `Responsive<DimensionValue> | undefined` | — | The margin for the logical start side of the element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-start). |
| `marginEnd` | `Responsive<DimensionValue> | undefined` | — | The margin for the logical end side of an element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-end). |
| `marginTop` | `Responsive<DimensionValue> | undefined` | — | The margin for the top side of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top). |
| `marginBottom` | `Responsive<DimensionValue> | undefined` | — | The margin for the bottom side of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom). |
| `marginX` | `Responsive<DimensionValue> | undefined` | — | The margin for both the left and right sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin). |
| `marginY` | `Responsive<DimensionValue> | undefined` | — | The margin for both the top and bottom sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin). |
| `width` | `Responsive<DimensionValue> | undefined` | — | The width of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/width). |
| `height` | `Responsive<DimensionValue> | undefined` | — | The height of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/height). |
| `minWidth` | `Responsive<DimensionValue> | undefined` | — | The minimum width of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width). |
| `minHeight` | `Responsive<DimensionValue> | undefined` | — | The minimum height of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/min-height). |
| `maxWidth` | `Responsive<DimensionValue> | undefined` | — | The maximum width of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/max-width). |
| `maxHeight` | `Responsive<DimensionValue> | undefined` | — | The maximum height of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/max-height). |
| `flex` | `Responsive<string | number | boolean> | undefined` | — | When used in a flex layout, specifies how the element will grow or shrink to fit the space available. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex). |
| `flexGrow` | `Responsive<number> | undefined` | — | When used in a flex layout, specifies how the element will grow to fit the space available. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow). |
| `flexShrink` | `Responsive<number> | undefined` | — | When used in a flex layout, specifies how the element will shrink to fit the space available. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink). |
| `flexBasis` | `Responsive<string | number> | undefined` | — | When used in a flex layout, specifies the initial main size of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis). |
| `justifySelf` | `Responsive<"auto" | "normal" | "start" | "end" | "flex-start" | "flex-end" | "self-start" | "self-end" | "center" | "left" | "right" | "stretch"> | undefined` | — | Specifies how the element is justified inside a flex or grid container. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self). |
| `alignSelf` | `Responsive<"auto" | "normal" | "start" | "end" | "flex-start" | "flex-end" | "self-start" | "self-end" | "center" | "stretch"> | undefined` | — | Overrides the `alignItems` property of a flex or grid container. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/align-self). |
| `order` | `Responsive<number> | undefined` | — | The layout order for the element within a flex or grid container. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/order). |
| `gridArea` | `Responsive<string> | undefined` | — | When used in a grid layout, specifies the named grid area that the element should be placed in within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area). |
| `gridColumn` | `Responsive<string> | undefined` | — | When used in a grid layout, specifies the column the element should be placed in within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column). |
| `gridRow` | `Responsive<string> | undefined` | — | When used in a grid layout, specifies the row the element should be placed in within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row). |
| `gridColumnStart` | `Responsive<string> | undefined` | — | When used in a grid layout, specifies the starting column to span within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start). |
| `gridColumnEnd` | `Responsive<string> | undefined` | — | When used in a grid layout, specifies the ending column to span within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end). |
| `gridRowStart` | `Responsive<string> | undefined` | — | When used in a grid layout, specifies the starting row to span within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start). |
| `gridRowEnd` | `Responsive<string> | undefined` | — | When used in a grid layout, specifies the ending row to span within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end). |
| `position` | `Responsive<"static" | "relative" | "absolute" | "fixed" | "sticky"> | undefined` | — | Specifies how the element is positioned. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/position). |
| `zIndex` | `Responsive<number> | undefined` | — | The stacking order for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index). |
| `top` | `Responsive<DimensionValue> | undefined` | — | The top position for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/top). |
| `bottom` | `Responsive<DimensionValue> | undefined` | — | The bottom position for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/bottom). |
| `start` | `Responsive<DimensionValue> | undefined` | — | The logical start position for the element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-start). |
| `end` | `Responsive<DimensionValue> | undefined` | — | The logical end position for the element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-end). |
| `left` | `Responsive<DimensionValue> | undefined` | — | The left position for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/left). Consider using `start` instead for RTL support. |
| `right` | `Responsive<DimensionValue> | undefined` | — | The right position for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/right). Consider using `start` instead for RTL support. |
| `isHidden` | `Responsive<boolean> | undefined` | — | Hides the element. |

### Keyboard

Result

| Name | Type | Description |
|------|------|-------------|
| `keyboardProps` \* | `DOMAttributes<FocusableElement>` | Props to spread onto the target element. |
