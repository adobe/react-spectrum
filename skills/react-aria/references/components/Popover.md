# Popover

A popover is an overlay element positioned relative to a trigger.

## Vanilla 

CSS example

```tsx
import {DialogTrigger} from 'react-aria-components';
import {Popover} from 'vanilla-starter/Popover';
import {Button} from 'vanilla-starter/Button';
import {Switch} from 'vanilla-starter/Switch';
import {Settings2} from 'lucide-react';

function Example(props) {
  return (
    <DialogTrigger>
      <Button aria-label="Settings">
        <Settings2 size={20} />
      </Button>
      {/*- begin focus -*/}
      <Popover {...props}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <Switch defaultSelected>Wi-Fi</Switch>
          <Switch defaultSelected>Bluetooth</Switch>
          <Switch>Mute</Switch>
        </div>
      </Popover>
      {/*- end focus -*/}
    </DialogTrigger>
  );
}
```

### Popover.tsx

```tsx
'use client';
import {
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps
} from 'react-aria-components';
import clsx from 'clsx';

import './Popover.css';

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
  children: React.ReactNode;
  hideArrow?: boolean;
}

export function Popover({ children, hideArrow, ...props }: PopoverProps) {
  return (
    (
      <AriaPopover {...props} className={clsx("react-aria-Popover", props.className)}>
        {({trigger}) => <>
          {!hideArrow && trigger !== 'MenuTrigger' && trigger !== 'SubmenuTrigger' && (
            <OverlayArrow>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <path d="M0 0 L6 6 L12 0" />
              </svg>
            </OverlayArrow>
          )}
          {children}
        </>}
      </AriaPopover>
    )
  );
}

```

### Popover.css

```css
@import "./theme.css";

.react-aria-Popover {
  --background-color: var(--overlay-background);

  outline: 1px solid var(--overlay-border);
  box-sizing: border-box;
  filter: drop-shadow(var(--popover-shadow));
  border-radius: var(--radius-lg);
  background: var(--background-color);
  color: var(--text-color);
  transition: transform 200ms, opacity 200ms;
  font: var(--font-size) system-ui;
  padding: 8px;

  &[data-trigger=MenuTrigger],
  &[data-trigger=SubmenuTrigger] {
    padding: 0;
  }

  .react-aria-OverlayArrow svg {
    display: block;
    fill: var(--background-color);
    stroke: var(--overlay-border);
    paint-order: stroke;
    stroke-width: 2px;
  }

  &[data-entering],
  &[data-exiting] {
    transform: var(--origin);
    opacity: 0;
  }

  &[data-placement=top] {
    --origin: translateY(8px);

    &:has(.react-aria-OverlayArrow) {
      margin-bottom: 6px;
    }
  }

  &[data-placement=bottom] {
    --origin: translateY(-8px);

    &:has(.react-aria-OverlayArrow) {
      margin-top: 6px;
    }

    .react-aria-OverlayArrow svg {
      transform: rotate(180deg);
    }
  }

  &[data-placement=right] {
    --origin: translateX(-8px);

    &:has(.react-aria-OverlayArrow) {
      margin-left: 6px;
    }

    .react-aria-OverlayArrow svg {
      transform: rotate(90deg);
    }
  }

  &[data-placement=left] {
    --origin: translateX(8px);

    &:has(.react-aria-OverlayArrow) {
      margin-right: 6px;
    }

    .react-aria-OverlayArrow svg {
      transform: rotate(-90deg);
    }
  }
}

```

## Tailwind example

```tsx
import {DialogTrigger} from 'react-aria-components';
import {Popover} from 'tailwind-starter/Popover';
import {Button} from 'tailwind-starter/Button';
import {Switch} from 'tailwind-starter/Switch';
import {Settings2} from 'lucide-react';

function Example(props) {
  return (
    <DialogTrigger>
      <Button aria-label="Settings" variant="secondary">
        <Settings2 size={20} />
      </Button>
      {/*- begin focus -*/}
      <Popover
        
        className="flex flex-col gap-2 p-4"
        showArrow
        {...props}>
        <Switch defaultSelected>Wi-Fi</Switch>
        <Switch defaultSelected>Bluetooth</Switch>
        <Switch>Mute</Switch>
      </Popover>
      {/*- end focus -*/}
    </DialogTrigger>
  );
}
```

### Popover.tsx

```tsx
'use client';
import {
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  composeRenderProps
} from 'react-aria-components';
import React from 'react';
import {tv} from 'tailwind-variants';

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
  showArrow?: boolean,
  children: React.ReactNode
}

const styles = tv({
  base: 'font-sans bg-white dark:bg-neutral-900/70 dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:bg-[Canvas] shadow-2xl rounded-xl bg-clip-padding border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 outline-0',
  variants: {
    isEntering: {
      true: 'animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 ease-out duration-200'
    },
    isExiting: {
      true: 'animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 ease-in duration-150'
    }
  }
});

export function Popover({ children, showArrow, className, ...props }: PopoverProps) {
  let offset = showArrow ? 12 : 8;
  return (
    <AriaPopover
      offset={offset}
      {...props}
      className={composeRenderProps(className, (className, renderProps) => styles({...renderProps, className}))}>
      {showArrow &&
        <OverlayArrow className="group">
          <svg width={12} height={12} viewBox="0 0 12 12" className="block fill-white dark:fill-[#1f1f21] forced-colors:fill-[Canvas] stroke-1 stroke-black/10 dark:stroke-neutral-700 forced-colors:stroke-[ButtonBorder] group-placement-bottom:rotate-180 group-placement-left:-rotate-90 group-placement-right:rotate-90">
            <path d="M0 0 L6 6 L12 0" />
          </svg>
        </OverlayArrow>
      }
      {children}
    </AriaPopover>
  );
}

```

## Custom trigger

`DialogTrigger` works with any pressable React Aria component (e.g. [Button](Button.md), [Link](Link.md), etc.). Use the `<Pressable>` component or [usePress](usePress.md) hook to wrap a custom trigger element such as a third party component or DOM element.

```tsx
"use client"
import {Pressable, DialogTrigger} from 'react-aria-components';
import {Popover} from 'vanilla-starter/Popover';

<DialogTrigger>
  {/*- begin highlight -*/}
  <Pressable>
    <span role="button">Custom trigger</span>
  </Pressable>
  {/*- end highlight -*/}
  <Popover style={{padding: 16}}>
    This popover was triggered by a custom button.
  </Popover>
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

## Custom anchor

To position a popover relative to a different element than its trigger, use the `triggerRef` and `isOpen` props instead of `<DialogTrigger>`. `onOpenChange` will be called when the user closes the popover.

```tsx
import {useState, useRef} from 'react';
import {Popover} from 'vanilla-starter/Popover';
import {Button} from 'vanilla-starter/Button';

function Example() {
  let [isOpen, setOpen] = useState(false);
  let triggerRef = useRef(null);

  return (
    <div>
      <Button onPress={() => setOpen(true)}>Trigger</Button>
      <span ref={triggerRef} style={{paddingLeft: 12}}>Popover will be positioned relative to me</span>
      <Popover
        style={{padding: 16}}
        /*- begin highlight -*/
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setOpen}>
        {/*- end highlight -*/}
        I'm over here!
      </Popover>
    </div>
  );
}
```

## Examples

<ExampleList
  tag="popover"
  pages={props.pages}
/>

## A

PI

```tsx
<DialogTrigger>
  <Button />
  <Popover>
    <OverlayArrow />
  </Popover>
</DialogTrigger>
```

### Dialog

Trigger

### Popover

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `arrowBoundaryOffset` | `number | undefined` | 0 | The minimum distance the arrow's edge should be from the edge of the overlay element. |
| `arrowRef` | `RefObject<Element | null> | undefined` | — | A ref for the popover arrow element. |
| `boundaryElement` | `Element | undefined` | document.body | Element that that serves as the positioning boundary. |
| `children` | `ChildrenOrFunction<PopoverRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<PopoverRenderProps> | undefined` | 'react-aria-Popover' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `containerPadding` | `number | undefined` | 12 | The placement padding that should be applied between the element and its surrounding container. |
| `crossOffset` | `number | undefined` | 0 | The additional offset applied along the cross axis between the element and its anchor element. |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `isEntering` | `boolean | undefined` | — | Whether the popover is currently performing an entry animation. |
| `isExiting` | `boolean | undefined` | — | Whether the popover is currently performing an exit animation. |
| `isKeyboardDismissDisabled` | `boolean | undefined` | false | Whether pressing the escape key to close the popover should be disabled. Most popovers should not use this option. When set to true, an alternative way to close the popover with a keyboard must be provided. |
| `isNonModal` | `boolean | undefined` | — | Whether the popover is non-modal, i.e. elements outside the popover may be interacted with by assistive technologies. Most popovers should not use this option as it may negatively impact the screen reader experience. Only use with components such as combobox, which are designed to handle this situation carefully. |
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
| `lang` | `string | undefined` | — |  |
| `maxHeight` | `number | undefined` | — | The maxHeight specified for the overlay element. By default, it will take all space up to the current viewport height. |
| `offset` | `number | undefined` | 8 | The additional offset applied along the main axis between the element and its anchor element. |
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
| `placement` | `Placement | undefined` | 'bottom' | The placement of the element with respect to its anchor element. |
| `scrollRef` | `RefObject<Element | null> | undefined` | overlayRef | A ref for the scrollable region within the overlay. |
| `shouldCloseOnInteractOutside` | `((element: Element) => boolean) | undefined` | — | When user interacts with the argument element outside of the popover ref, return true if onClose should be called. This gives you a chance to filter out interaction with elements that should not dismiss the popover. By default, onClose will always be called on interaction outside the popover ref. |
| `shouldFlip` | `boolean | undefined` | true | Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely. |
| `shouldUpdatePosition` | `boolean | undefined` | true | Whether the overlay should update its position automatically. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: PopoverRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `trigger` | `string | undefined` | — | The name of the component that triggered the popover. This is reflected on the element as the `data-trigger` attribute, and can be used to provide specific styles for the popover depending on which element triggered it. |
| `triggerRef` | `RefObject<Element | null> | undefined` | — | The ref for the element which the popover positions itself with respect to. When used within a trigger component such as DialogTrigger, MenuTrigger, Select, etc., this is set automatically. It is only required when used standalone. |
| `UNSTABLE_portalContainer` | `Element | undefined` | document.body | The container element in which the overlay portal will be placed. This may have unknown behavior depending on where it is portalled to. |

### Overlay

Arrow

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `about` | `string | undefined` | — |  |
| `accessKey` | `string | undefined` | — |  |
| `aria-activedescendant` | `string | undefined` | — | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` | `(boolean | "true" | "false") | undefined` | — | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` | `"none" | "inline" | "list" | "both" | undefined` | — | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
| `aria-braillelabel` | `string | undefined` | — | Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. |
| `aria-brailleroledescription` | `string | undefined` | — | Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille. |
| `aria-busy` | `(boolean | "true" | "false") | undefined` | — |  |
| `aria-checked` | `boolean | "true" | "false" | "mixed" | undefined` | — | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| `aria-colcount` | `number | undefined` | — | Defines the total number of columns in a table, grid, or treegrid. |
| `aria-colindex` | `number | undefined` | — | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| `aria-colindextext` | `string | undefined` | — | Defines a human readable text alternative of aria-colindex. |
| `aria-colspan` | `number | undefined` | — | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` | `boolean | "true" | "false" | "page" | "step" | "location" | "date" | "time" | undefined` | — | Indicates the element that represents the current item within a container or set of related elements. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-description` | `string | undefined` | — | Defines a string value that describes or annotates the current element. |
| `aria-details` | `string | undefined` | — | Identifies the element that provides a detailed, extended description for the object. |
| `aria-disabled` | `(boolean | "true" | "false") | undefined` | — | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` | `"link" | "copy" | "move" | "none" | "execute" | "popup" | undefined` | — | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-expanded` | `(boolean | "true" | "false") | undefined` | — | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-flowto` | `string | undefined` | — | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` | `(boolean | "true" | "false") | undefined` | — | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` | `boolean | "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined` | — | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-hidden` | `(boolean | "true" | "false") | undefined` | — | Indicates whether the element is exposed to an accessibility API. |
| `aria-invalid` | `boolean | "true" | "false" | "grammar" | "spelling" | undefined` | — | Indicates the entered value does not conform to the format expected by the application. |
| `aria-keyshortcuts` | `string | undefined` | — | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `aria-level` | `number | undefined` | — | Defines the hierarchical level of an element within a structure. |
| `aria-live` | `"off" | "assertive" | "polite" | undefined` | — | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| `aria-modal` | `(boolean | "true" | "false") | undefined` | — | Indicates whether an element is modal when displayed. |
| `aria-multiline` | `(boolean | "true" | "false") | undefined` | — | Indicates whether a text box accepts multiple lines of input or only a single line. |
| `aria-multiselectable` | `(boolean | "true" | "false") | undefined` | — | Indicates that the user may select more than one item from the current selectable descendants. |
| `aria-orientation` | `"horizontal" | "vertical" | undefined` | — | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| `aria-owns` | `string | undefined` | — | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| `aria-placeholder` | `string | undefined` | — | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format. |
| `aria-posinset` | `number | undefined` | — | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-pressed` | `boolean | "true" | "false" | "mixed" | undefined` | — | Indicates the current "pressed" state of toggle buttons. |
| `aria-readonly` | `(boolean | "true" | "false") | undefined` | — | Indicates that the element is not editable, but is otherwise operable. |
| `aria-relevant` | `"text" | "all" | "additions" | "additions removals" | "additions text" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals" | undefined` | — | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| `aria-required` | `(boolean | "true" | "false") | undefined` | — | Indicates that user input is required on the element before a form may be submitted. |
| `aria-roledescription` | `string | undefined` | — | Defines a human-readable, author-localized description for the role of an element. |
| `aria-rowcount` | `number | undefined` | — | Defines the total number of rows in a table, grid, or treegrid. |
| `aria-rowindex` | `number | undefined` | — | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| `aria-rowindextext` | `string | undefined` | — | Defines a human readable text alternative of aria-rowindex. |
| `aria-rowspan` | `number | undefined` | — | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-selected` | `(boolean | "true" | "false") | undefined` | — | Indicates the current "selected" state of various widgets. |
| `aria-setsize` | `number | undefined` | — | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-sort` | `"none" | "ascending" | "descending" | "other" | undefined` | — | Indicates if items in a table or grid are sorted in ascending or descending order. |
| `aria-valuemax` | `number | undefined` | — | Defines the maximum allowed value for a range widget. |
| `aria-valuemin` | `number | undefined` | — | Defines the minimum allowed value for a range widget. |
| `aria-valuenow` | `number | undefined` | — | Defines the current value for a range widget. |
| `aria-valuetext` | `string | undefined` | — | Defines the human readable text alternative of aria-valuenow for a range widget. |
| `autoCapitalize` | `"off" | "on" | "none" | "sentences" | "words" | "characters" | (string & {}) | undefined` | — |  |
| `autoCorrect` | `string | undefined` | — |  |
| `autoFocus` | `boolean | undefined` | — |  |
| `autoSave` | `string | undefined` | — |  |
| `children` | `ChildrenOrFunction<OverlayArrowRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<OverlayArrowRenderProps> | undefined` | 'react-aria-OverlayArrow' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `color` | `string | undefined` | — |  |
| `content` | `string | undefined` | — |  |
| `contentEditable` | `(boolean | "true" | "false") | "inherit" | "plaintext-only" | undefined` | — |  |
| `contextMenu` | `string | undefined` | — |  |
| `dangerouslySetInnerHTML` | `{ __html: string | TrustedHTML; } | undefined` | — |  |
| `datatype` | `string | undefined` | — |  |
| `defaultChecked` | `boolean | undefined` | — |  |
| `defaultValue` | `string | number | readonly string[] | undefined` | — |  |
| `dir` | `string | undefined` | — |  |
| `draggable` | `(boolean | "true" | "false") | undefined` | — |  |
| `enterKeyHint` | `"search" | "enter" | "done" | "go" | "next" | "previous" | "send" | undefined` | — |  |
| `exportparts` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `inlist` | `any` | — |  |
| `inputMode` | `"text" | "search" | "none" | "tel" | "url" | "email" | "numeric" | "decimal" | undefined` | — | Hints at the type of data that might be entered by the user while editing the element or its contents |
| `is` | `string | undefined` | — | Specify that a standard HTML element should behave like a defined custom built-in element |
| `itemID` | `string | undefined` | — |  |
| `itemProp` | `string | undefined` | — |  |
| `itemRef` | `string | undefined` | — |  |
| `itemScope` | `boolean | undefined` | — |  |
| `itemType` | `string | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `nonce` | `string | undefined` | — |  |
| `onAbort` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAbortCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBeforeInput` | `React.InputEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBeforeInputCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBeforeToggle` | `React.ToggleEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlur` | `React.FocusEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlurCapture` | `React.FocusEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCanPlay` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCanPlayCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCanPlayThrough` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCanPlayThroughCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onChange` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onChangeCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionEnd` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionEndCapture` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionStart` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionStartCapture` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionUpdate` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionUpdateCapture` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCopy` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCopyCapture` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCut` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCutCapture` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDrag` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragEnd` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragEndCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragEnter` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragEnterCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragExit` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragExitCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragLeave` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragLeaveCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragOver` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragOverCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragStart` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragStartCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDrop` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDropCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDurationChange` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDurationChangeCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEmptied` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEmptiedCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEncrypted` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEncryptedCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEnded` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEndedCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onError` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onErrorCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocus` | `React.FocusEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocusCapture` | `React.FocusEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInput` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInputCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInvalid` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInvalidCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyDown` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyDownCapture` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyPress` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyPressCapture` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyUp` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyUpCapture` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoad` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadedData` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadedDataCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadedMetadata` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadedMetadataCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadStart` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadStartCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
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
| `onPaste` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPasteCapture` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPause` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPauseCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPlay` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPlayCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPlaying` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPlayingCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
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
| `onProgress` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onProgressCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onRateChange` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onRateChangeCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onReset` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onResetCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollEnd` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollEndCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSeeked` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSeekedCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSeeking` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSeekingCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSelect` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSelectCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onStalled` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onStalledCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSubmit` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSubmitCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSuspend` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSuspendCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTimeUpdate` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTimeUpdateCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onToggle` | `React.ToggleEventHandler<HTMLDivElement> | undefined` | — |  |
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
| `onVolumeChange` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onVolumeChangeCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWaiting` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWaitingCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `part` | `string | undefined` | — |  |
| `popover` | `"" | "manual" | "auto" | undefined` | — |  |
| `popoverTarget` | `string | undefined` | — |  |
| `popoverTargetAction` | `"toggle" | "show" | "hide" | undefined` | — |  |
| `prefix` | `string | undefined` | — |  |
| `property` | `string | undefined` | — |  |
| `radioGroup` | `string | undefined` | — |  |
| `rel` | `string | undefined` | — |  |
| `resource` | `string | undefined` | — |  |
| `results` | `number | undefined` | — |  |
| `rev` | `string | undefined` | — |  |
| `role` | `React.AriaRole | undefined` | — |  |
| `security` | `string | undefined` | — |  |
| `slot` | `string | undefined` | — |  |
| `spellCheck` | `(boolean | "true" | "false") | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: OverlayArrowRenderProps & { defaultStyle: CSSProperties; }) => CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `suppressContentEditableWarning` | `boolean | undefined` | — |  |
| `suppressHydrationWarning` | `boolean | undefined` | — |  |
| `tabIndex` | `number | undefined` | — |  |
| `title` | `string | undefined` | — |  |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `typeof` | `string | undefined` | — |  |
| `unselectable` | `"off" | "on" | undefined` | — |  |
| `vocab` | `string | undefined` | — |  |
