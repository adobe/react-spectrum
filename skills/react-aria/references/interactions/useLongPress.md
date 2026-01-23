# use

LongPress

Handles long press interactions across mouse and touch devices. Supports a customizable time threshold,
accessibility description, and normalizes behavior across browsers and devices.

```tsx
import React from 'react';
import {mergeProps} from 'react-aria';
import {useLongPress, usePress} from '@react-aria/interactions';

function Example() {
  let [events, setEvents] = React.useState<string[]>([]);
  let [mode, setMode] = React.useState('Activate');

  /*- begin focus -*/
  // Long press to activate "Hyper speed"
  let {longPressProps} = useLongPress({
    accessibilityDescription: 'Long press to activate hyper speed',
    onLongPressStart: e => setEvents(
      events => [`long press start with ${e.pointerType}`, ...events]
    ),
    onLongPressEnd: e => setEvents(
      events => [`long press end with ${e.pointerType}`, ...events]
    ),
    onLongPress: e => {
      setMode('Hyper speed');
      setEvents(
        events => [`long press with ${e.pointerType}`, ...events]
      );
    }
  });
  /*- end focus -*/

  // Short press to activate "Normal speed"
  let {pressProps} = usePress({
    onPress: e => {
      setMode('Normal speed');
      setEvents(
        events => [`press with ${e.pointerType}`, ...events]
      );
    }
  });

  return (
    <>
      <button {...mergeProps(pressProps, longPressProps)}>{mode}</button>
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

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>This example does not have a keyboard accessible way to trigger the long press action. Because the method of triggering
  this action will differ depending on the component, it is outside the scope of `useLongPress`. Make sure to implement a keyboard
  friendly alternative to all long press interactions if you are using this hook directly.</Content>
</InlineAlert>

## Features

A long press is triggered when a user presses and holds their pointer over a target for a minimum period of time. If the user moves their pointer off of the target before the time threshold, the interaction is canceled. Once a long press event is triggered, other pointer interactions that may be active such as `usePress` and `useMove` will be canceled so that only the long press is activated.

* Handles mouse and touch events
* Prevents text selection on touch devices while long pressing
* Prevents browser and OS context menus from appearing while long pressing
* Customizable time threshold for long press
* Supports an accessibility description to indicate to assistive technology users that a long press action is available

## A

PI

<FunctionAPI
  function={docs.exports.useLongPress}
  links={docs.links}
/>

### Long

PressProps

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `isDisabled` | `boolean | undefined` | — | Whether long press events should be disabled. |
| `onLongPressStart` | `((e: LongPressEvent) => void) | undefined` | — | Handler that is called when a long press interaction starts. |
| `onLongPressEnd` | `((e: LongPressEvent) => void) | undefined` | — | Handler that is called when a long press interaction ends, either over the target or when the pointer leaves the target. |
| `onLongPress` | `((e: LongPressEvent) => void) | undefined` | — | Handler that is called when the threshold time is met while the press is over the target. |
| `threshold` | `number | undefined` | 500ms | The amount of time in milliseconds to wait before triggering a long press. |
| `accessibilityDescription` | `string | undefined` | — | A description for assistive techology users indicating that a long press action is available, e.g. "Long press to open menu". |

### Long

PressResult

| Name | Type | Description |
|------|------|-------------|
| `longPressProps` \* | `DOMAttributes<FocusableElement>` | Props to spread on the target element. |

### Long

PressEvent

Each of these handlers is fired with a `LongPressEvent`, which exposes information about the target and the
type of event that triggered the interaction.
