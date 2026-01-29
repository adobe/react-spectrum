# Modal

A modal is an overlay element which blocks interaction with elements outside it.

## Vanilla 

CSS example

```tsx
import {DialogTrigger, Heading} from 'react-aria-components';
import {Modal} from 'vanilla-starter/Modal';
import {Dialog} from 'vanilla-starter/Dialog';
import {Form} from 'vanilla-starter/Form';
import {TextField} from 'vanilla-starter/TextField';
import {Button} from 'vanilla-starter/Button';

function Example(props) {
  return (
    <DialogTrigger>
      <Button>Sign up…</Button>
      <Modal {...props}>
        <Dialog>
          <Heading slot="title">Subscribe to our newsletter</Heading>
          <p>Enter your information to subscribe to our newsletter and receive updates about new features and announcements.</p>
          <Form>
            <TextField autoFocus label="Name" placeholder="Enter your full name" />
            <TextField label="Email" placeholder="Enter your email" />
            <div style={{display: 'flex', gap: 8, alignSelf: 'end'}}>
              <Button slot="close" variant="secondary">Cancel</Button>
              <Button slot="close">Subscribe</Button>
            </div>
          </Form>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
```

### Modal.tsx

```tsx
'use client';
import {Modal as RACModal, ModalOverlayProps} from 'react-aria-components';
import './Modal.css';

export function Modal(props: ModalOverlayProps) {
  return <RACModal {...props} />;
}

```

### Modal.css

```css
@import "./theme.css";

.react-aria-ModalOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: var(--page-height);
  background: rgba(0 0 0 / .5);
  z-index: 100;
  font-family: system-ui;
  font-size: var(--font-size);

  &[data-entering] {
    animation: modal-fade 200ms;
  }

  &[data-exiting] {
    animation: modal-fade 150ms reverse ease-in;
  }
}

.react-aria-Modal {
  position: sticky;
  max-height: calc(var(--visual-viewport-height) * 0.9);
  top: calc(var(--visual-viewport-height) / 2);
  margin-left: 50vw;
  translate: -50% -50%;
  box-shadow: 0 8px 32px rgba(0 0 0 / 0.2);
  border-radius: var(--radius-xl);
  background: var(--overlay-background);
  color: var(--text-color);
  outline: 1px solid var(--overlay-border);
  width: max-content;
  max-width: min(500px, 90vw);

  &[data-entering] {
    animation: modal-zoom 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .react-aria-TextField {
    margin-bottom: 8px;
  }
}

@keyframes modal-fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes modal-zoom {
  from {
    transform: scale(0.8);
  }

  to {
    transform: scale(1);
  }
}

```

## Tailwind example

```tsx
import {DialogTrigger, Heading} from 'react-aria-components';
import {Modal} from 'tailwind-starter/Modal';
import {Dialog} from 'tailwind-starter/Dialog';
import {Form} from 'tailwind-starter/Form';
import {TextField} from 'tailwind-starter/TextField';
import {Button} from 'tailwind-starter/Button';

function Example(props) {
  return (
    <DialogTrigger>
      <Button>Sign up…</Button>
      <Modal {...props}>
        <Dialog>
          <Heading slot="title" className="text-xl mt-0">Subscribe to our newsletter</Heading>
          <p className="text-sm">Enter your information to subscribe to our newsletter and receive updates about new features and announcements.</p>
          <Form>
            <TextField autoFocus label="Name" placeholder="Enter your full name" />
            <TextField label="Email" placeholder="Enter your email" />
            <div className="flex gap-2 self-end">
              <Button slot="close" variant="secondary">Cancel</Button>
              <Button slot="close">Subscribe</Button>
            </div>
          </Form>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
```

### Modal.tsx

```tsx
'use client';
import React from 'react';
import { ModalOverlay, ModalOverlayProps, Modal as RACModal } from 'react-aria-components';
import { tv } from 'tailwind-variants';

const overlayStyles = tv({
  base: 'absolute top-0 left-0 w-full h-(--page-height) isolate z-20 bg-black/[50%] text-center backdrop-blur-lg',
  variants: {
    isEntering: {
      true: 'animate-in fade-in duration-200 ease-out'
    },
    isExiting: {
      true: 'animate-out fade-out duration-200 ease-in'
    }
  }
});

const modalStyles = tv({
  base: 'font-sans w-full max-w-[min(90vw,450px)] max-h-[calc(var(--visual-viewport-height)*.9)] rounded-2xl bg-white dark:bg-neutral-800/70 dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:bg-[Canvas] text-left align-middle text-neutral-700 dark:text-neutral-300 shadow-2xl bg-clip-padding border border-black/10 dark:border-white/10',
  variants: {
    isEntering: {
      true: 'animate-in zoom-in-105 ease-out duration-200'
    },
    isExiting: {
      true: 'animate-out zoom-out-95 ease-in duration-200'
    }
  }
});

export function Modal(props: ModalOverlayProps) {
  return (
    <ModalOverlay {...props} className={overlayStyles}>
      <div className="sticky top-0 left-0 w-full h-(--visual-viewport-height) flex items-center justify-center box-border">
        <RACModal {...props} className={modalStyles} />
      </div>
    </ModalOverlay>
  );
}

```

## Sheet

Overlays such as trays, drawers, and sheets can be built using a `Modal` with custom entry and exit animations.

```tsx
import {DialogTrigger, Heading} from 'react-aria-components';
import {Sheet} from 'vanilla-starter/Sheet';
import {Button} from 'vanilla-starter/Button';

<DialogTrigger>
  <Button>Open sheet</Button>
  <Sheet>
    <Heading slot="title">Notice</Heading>
    <p>This is a modal with a custom modal overlay.</p>
    <Button slot="close">Close</Button>
  </Sheet>
</DialogTrigger>
```

## Controlled

Use the `isOpen` prop to show a modal programmatically or mount in a different part of the JSX tree (e.g. outside a menu).

```tsx
import {useState} from 'react';
import {Heading} from 'react-aria-components';
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Modal} from 'vanilla-starter/Modal';
import {Dialog} from 'vanilla-starter/Dialog';
import {Button} from 'vanilla-starter/Button';

function Example() {
  let [isOpen, setOpen] = useState(false);

  return (
    <>
      <MenuTrigger>
        <Button>Menu</Button>
        <Menu>
          <MenuItem onAction={() => setOpen(true)}>Open dialog…</MenuItem>
        </Menu>
      </MenuTrigger>
      <Modal isDismissable isOpen={isOpen} onOpenChange={setOpen}>
        <Dialog>
          <Heading slot="title">Notice</Heading>
          <p>Click outside or press Escape to close this dialog.</p>
        </Dialog>
      </Modal>
    </>
  );
}
```

## Custom trigger

`DialogTrigger` works with any pressable React Aria component (e.g. [Button](Button.md), [Link](Link.md), etc.). Use the `<Pressable>` component or [usePress](usePress.md) hook to wrap a custom trigger element such as a third party component or DOM element.

```tsx
"use client"
import {Pressable, DialogTrigger, Heading} from 'react-aria-components';
import {Modal} from 'vanilla-starter/Modal';
import {Dialog} from 'vanilla-starter/Dialog';
import {Button} from 'vanilla-starter/Button';

<DialogTrigger>
  {/*- begin highlight -*/}
  <Pressable>
    <span role="button">Custom trigger</span>
  </Pressable>
  {/*- end highlight -*/}
  <Modal>
    <Dialog>
      <Heading slot="title">Dialog</Heading>
      <p>This dialog was triggered by a custom button.</p>
      <Button slot="close">Close</Button>
    </Dialog>
  </Modal>
</DialogTrigger>
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

## Examples

<ExampleList
  tag="modal"
  pages={props.pages}
/>

## A

PI

```tsx
<DialogTrigger>
  <Button />
  <ModalOverlay>
    <Modal>
      <Dialog>
        <Heading slot="title" />
        <Button slot="close" />
      </Dialog>
    </Modal>
  </ModalOverlay>
</DialogTrigger>
```

### Dialog

Trigger

### Modal

### Modal

Overlay

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<ModalRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ModalRenderProps> | undefined` | 'react-aria-ModalOverlay' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `isDismissable` | `boolean | undefined` | false | Whether to close the modal when the user interacts outside it. |
| `isEntering` | `boolean | undefined` | — | Whether the modal is currently performing an entry animation. |
| `isExiting` | `boolean | undefined` | — | Whether the modal is currently performing an exit animation. |
| `isKeyboardDismissDisabled` | `boolean | undefined` | false | Whether pressing the escape key to close the modal should be disabled. |
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
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
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
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
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Handler that is called when the overlay's open state changes. |
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
| `shouldCloseOnInteractOutside` | `((element: Element) => boolean) | undefined` | — | When user interacts with the argument element outside of the overlay ref, return true if onClose should be called.  This gives you a chance to filter out interaction with elements that should not dismiss the overlay. By default, onClose will always be called on interaction outside the overlay ref. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: ModalRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `UNSTABLE_portalContainer` | `Element | undefined` | document.body | The container element in which the overlay portal will be placed. This may have unknown behavior depending on where it is portalled to. |

### Dialog

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `React.ReactNode | ((opts: DialogRenderProps) => ReactNode)` | — | Children of the dialog. A function may be provided to access a function to close the dialog. |
| `className` | `string | undefined` | 'react-aria-Dialog' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `role` | `"dialog" | "alertdialog" | undefined` | 'dialog' | The accessibility role for the dialog. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |
