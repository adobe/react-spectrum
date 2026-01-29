# Toast

A ToastContainer renders the queued toasts in an application. It should be placed
at the root of the app.

```tsx
import {ToastContainer, ButtonGroup, Button, ToastQueue} from '@react-spectrum/s2';

function App(props) {
  return (
    <>
      <ToastContainer {...props} />
      <ButtonGroup>
        <Button
          onPress={() => ToastQueue.neutral('Toast available')}
          variant="secondary">
          Show Neutral Toast
        </Button>
        <Button
          onPress={() => ToastQueue.positive('Toast is done!')}
          variant="primary">
          Show Positive Toast
        </Button>
        <Button
          onPress={() => ToastQueue.negative('Toast is burned!')}
          variant="negative">
          Show Negative Toast
        </Button>
        <Button
          onPress={() => ToastQueue.info('Toasting…')}
          variant="accent">
          Show Info Toast
        </Button>
      </ButtonGroup>
    </>
  );
}
```

## Actions

Use the `actionLabel` and `onAction` options to add an action button to the toast. Set `shouldCloseOnAction` to true to close the toast when the user presses the button.

```tsx
import {Button, ToastQueue} from '@react-spectrum/s2';

<Button
  onPress={() => ToastQueue.info('An update is available', {
    /*- begin highlight -*/
    actionLabel: 'Update',
    onAction: () => alert('Updating!'),
    shouldCloseOnAction: true
    /*- end highlight -*/
  })}>
  Show actionable toast
</Button>
```

## Dismissal

Use the `timeout` option to automatically hide a toast after a delay. For accessibility, toasts have a minimum timeout of 5 seconds, and actionable toasts will not auto dismiss. Timers will pause when the user focuses or hovers over a toast.

```tsx
import {Button, ToastQueue} from '@react-spectrum/s2';

<Button
  onPress={() => ToastQueue.positive('Toast is done!', {
    /*- begin highlight -*/
    timeout: 5000
    /*- end highlight -*/
  })}>
  Show auto-dismissing toast
</Button>
```

### Programmatic dismissal

Use the close function returned by `ToastQueue` to programmatically dismiss a toast that is no longer relevant. The `onClose` event is triggered when a toast is dismissed, either by user action or programmatically.

```tsx
import {Button, ToastQueue, Text} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [close, setClose] = useState<(() => void) | null>(null);

  return (
    <Button
      onPress={() => {
        /*- begin highlight -*/
        if (!close) {
          let close = ToastQueue.negative('Unable to save', {
            onClose: () => setClose(null)
          });
          setClose(() => close);
        } else {
          close();
        }
        /*- end highlight -*/
      }}>
      <Text>{close ? 'Hide Toast' : 'Show Toast'}</Text>
    </Button>
  );
}
```

## A

PI

### Toast

Container

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | "Notifications" | An accessibility label for the toast region. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancel` | `TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `placement` | `ToastPlacement | undefined` | "bottom" | Placement of the toast container on the page. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Toast

Queue

#### Toast 

Options

| Name | Type | Description |
|------|------|-------------|
| `actionLabel` | `string | undefined` | A label for the action button within the toast. |
| `onAction` | `(() => void) | undefined` | Handler that is called when the action button is pressed. |
| `shouldCloseOnAction` | `boolean | undefined` | Whether the toast should automatically close when an action is performed. |
| `onClose` | `(() => void) | undefined` | Handler that is called when the toast is closed, either by the user or after a timeout. |
| `timeout` | `number | undefined` | A timeout to automatically close the toast after, in milliseconds. |
| `id` | `string | undefined` | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
