# File

Trigger

A FileTrigger allows a user to access the file system with any pressable React Aria or React Spectrum component, or custom components built with usePress.

```tsx
import {FileTrigger} from 'react-aria-components';
import {Button} from 'vanilla-starter/Button';
import {useState} from 'react';

function Example(props) {
  let [files, setFiles] = useState<string[]>([]);

  return (
    <>
      {/*- begin focus -*/}
      <FileTrigger
        {...props}
        
        onSelect={(e) => {
          let files = e ? Array.from(e) : [];
          let filenames = files.map((file) => file.name);
          setFiles(filenames);
        }}>
        <Button>Select a file</Button>
      </FileTrigger>
      {/*- end focus -*/}
      {files.join(', ')}
    </>
  );
}
```

## Custom trigger

`FileTrigger` works with any pressable React Aria component (e.g. [Button](Button.md), [Link](Link.md), etc.). Use the `<Pressable>` component or [usePress](usePress.md) hook to wrap a custom trigger element such as a third party component or DOM element.

```tsx
"use client"
import {Pressable, FileTrigger} from 'react-aria-components';

<FileTrigger>
  {/*- begin highlight -*/}
  <Pressable>
    <span role="button">Custom trigger</span>
  </Pressable>
  {/*- end highlight -*/}
</FileTrigger>
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>Any `<Pressable>` child must have an [interactive ARIA role](https://www.w3.org/TR/wai-aria-1.2/#widget_roles) or use an appropriate semantic HTML element so that screen readers can announce the trigger. Trigger components must forward their `ref` and spread all props to a DOM element.</Content>
</InlineAlert>

```tsx
const CustomTrigger = React.forwardRef((props, ref) => (
  <button {...props} ref={ref} />
));
```

## A

PI

```tsx
<FileTrigger>
  <Button />
</FileTrigger>
```

### File

Trigger

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `acceptDirectory` | `boolean | undefined` | — | Enables the selection of directories instead of individual files. |
| `acceptedFileTypes` | `readonly string[] | undefined` | — | Specifies what mime type of files are allowed. |
| `allowsMultiple` | `boolean | undefined` | — | Whether multiple files can be selected. |
| `children` | `React.ReactNode` | — | The children of the component. |
| `defaultCamera` | `"user" | "environment" | undefined` | — | Specifies the use of a media capture mechanism to capture the media on the spot. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLInputElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLInputElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLInputElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLInputElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLInputElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLInputElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLInputElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLInputElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLInputElement> | undefined` | — |  |
| `onSelect` | `((files: FileList | null) => void) | undefined` | — | Handler when a user selects a file. |
| `onTouchCancel` | `React.TouchEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLInputElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLInputElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLInputElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLInputElement> | undefined` | — |  |
| `translate` | `"yes" | "no" | undefined` | — |  |
