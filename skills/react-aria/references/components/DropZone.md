# Drop

Zone

A drop zone is an area into which one or multiple objects can be dragged and dropped.

## Vanilla 

CSS example

```tsx
import {DropZone} from 'vanilla-starter/DropZone';
import {Text} from 'react-aria-components';
import {useState} from 'react';
import React from 'react';

function Example() {
  let [content, setContent] = useState<string | React.ReactElement | null>(null);
  return (
    <DropZone
      // Determine whether dragged content should be accepted.
      getDropOperation={types => (
        ['text/plain', 'image/jpeg', 'image/png', 'image.gif'].some(t => types.has(t))
          ? 'copy'
          : 'cancel'
      )}
      onDrop={async (event) => {
        // Find the first accepted item.
        let item = event.items.find(item => (
          (item.kind === 'text' && item.types.has('text/plain')) ||
          (item.kind === 'file' && item.type.startsWith('image/'))
        ));

        if (item?.kind === 'text') {
          let text = await item.getText('text/plain');
          setContent(text);
        } else if (item?.kind === 'file') {
          let file = await item.getFile();
          let url = URL.createObjectURL(file);
          setContent(<img src={url} alt={item.name} style={{maxHeight: 100, maxWidth: '100%'}} />)
        }
      }}>
      <Text slot="label">
        {content || "Drop or paste text or images here"}
      </Text>
    </DropZone>
  );
}
```

### Drop

Zone.tsx

```tsx
'use client';
import {DropZoneProps, DropZone as RACDropZone} from 'react-aria-components';
import './DropZone.css'

export function DropZone(props: DropZoneProps) {
  return <RACDropZone {...props} />;
}

```

### Drop

Zone.css

```css
@import "./theme.css";

.react-aria-DropZone {
  color: var(--text-color);
  background: var(--overlay-background);
  border: 1px solid var(--border-color);
  forced-color-adjust: none;
  border-radius: var(--radius);
  appearance: none;
  vertical-align: middle;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  margin: 0;
  outline: none;
  padding: 24px 12px;
  width: 30%;
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-wrap: balance;

  &[data-focus-visible],
  &[data-drop-target] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: -1px;
  }

  &[data-drop-target] {
    background: var(--highlight-overlay);
  }
}

```

## Tailwind example

```tsx
import {DropZone} from 'tailwind-starter/DropZone';
import {Text} from 'react-aria-components';
import {useState} from 'react';
import React from 'react';

function Example() {
  let [content, setContent] = useState<string | React.ReactElement | null>(null);
  return (
    <DropZone
      // Determine whether dragged content should be accepted.
      getDropOperation={types => (
        ['text/plain', 'image/jpeg', 'image/png', 'image/gif'].some(t => types.has(t)) ? 'copy' : 'cancel'
      )}
      onDrop={async (event) => {
        // Find the first accepted item.
        let item = event.items.find(item => (
          (item.kind === 'text' && item.types.has('text/plain')) ||
          (item.kind === 'file' && item.type.startsWith('image/'))
        ));

        if (item?.kind === 'text') {
          let text = await item.getText('text/plain');
          setContent(text);
        } else if (item?.kind === 'file') {
          let file = await item.getFile();
          let url = URL.createObjectURL(file);
          setContent(<img src={url} alt={item.name} style={{maxHeight: 100, maxWidth: '100%'}} />)
        }
      }}>
      <Text slot="label">
        {content || "Drop or paste text or images here"}
      </Text>
    </DropZone>
  );
}
```

### Drop

Zone.tsx

```tsx
'use client';
import React from "react";
import {composeRenderProps, DropZoneProps, DropZone as RACDropZone} from 'react-aria-components';
import { tv } from "tailwind-variants";

const dropZone = tv({
  base: "flex items-center justify-center p-8 min-h-24 w-[30%] font-sans text-base text-balance text-center rounded-lg border border-1 border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900",
  variants: {
    isFocusVisible: {
      true: "outline outline-2 -outline-offset-1 outline-blue-600 dark:outline-blue-500 forced-colors:outline-[Highlight]"
    },
    isDropTarget: {
      true: "bg-blue-200 dark:bg-blue-800 outline outline-2 -outline-offset-1 outline-blue-600 dark:outline-blue-500 forced-colors:outline-[Highlight]",
    }
  }
});

export function DropZone(props: DropZoneProps) {
  return (
    <RACDropZone
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) => dropZone({ ...renderProps, className }))} />
  );
}

```

## Examples

<ExampleList
  tag="dropzone"
  pages={props.pages}
/>

## A

PI

```tsx
<DropZone>
  <Text slot="label" />
</DropZone>
```

### Drop

Zone

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ChildrenOrFunction<DropZoneRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<DropZoneRenderProps> | undefined` | 'react-aria-DropZone' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `getDropOperation` | `((types: DragTypes, allowedOperations: DropOperation[]) => DropOperation) | undefined` | — | A function returning the drop operation to be performed when items matching the given types are dropped on the drop target. |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the drop target is disabled. If true, the drop target will not accept any drops. |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDrop` | `((e: DropEvent) => void) | undefined` | — | Handler that is called when a valid drag is dropped on the drop target. |
| `onDropActivate` | `((e: DropActivateEvent) => void) | undefined` | — | Handler that is called after a valid drag is held over the drop target for a period of time. This typically opens the item so that the user can drop within it. |
| `onDropEnter` | `((e: DropEnterEvent) => void) | undefined` | — | Handler that is called when a valid drag enters the drop target. |
| `onDropExit` | `((e: DropExitEvent) => void) | undefined` | — | Handler that is called when a valid drag exits the drop target. |
| `onDropMove` | `((e: DropMoveEvent) => void) | undefined` | — | Handler that is called when a valid drag is moved within the drop target. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: DropZoneRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
