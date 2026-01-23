# Tooltip

A tooltip displays a description of an element on hover or focus.

## Vanilla 

CSS example

```tsx
import {TooltipTrigger} from 'react-aria-components';
import {Tooltip} from 'vanilla-starter/Tooltip';
import {Button} from 'vanilla-starter/Button';
import {Edit} from 'lucide-react';

function Example(props) {
  return (
    <TooltipTrigger>
      <Button aria-label="Edit">
        <Edit size={18} />
      </Button>
      {/*- begin highlight -*/}
      <Tooltip {...props}>
        Edit
      </Tooltip>
      {/*- end highlight -*/}
    </TooltipTrigger>
  );
}
```

### Tooltip.tsx

```tsx
'use client';
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  TooltipTriggerComponentProps
} from 'react-aria-components';

import './Tooltip.css';

export interface TooltipProps extends Omit<AriaTooltipProps, 'children'> {
  children: React.ReactNode;
}

export function Tooltip({ children, ...props }: TooltipProps) {
  return (
    (
      <AriaTooltip {...props}>
        <OverlayArrow>
          <svg width={8} height={8} viewBox="0 0 8 8">
            <path d="M0 0 L4 4 L8 0" />
          </svg>
        </OverlayArrow>
        {children}
      </AriaTooltip>
    )
  );
}

export function TooltipTrigger(props: TooltipTriggerComponentProps) {
  return <AriaTooltipTrigger {...props} />;
}

```

### Tooltip.css

```css
@import "./theme.css";

.react-aria-Tooltip {
  box-shadow: 0 8px 20px rgba(0 0 0 / 0.1);
  border-radius: var(--radius);
  background: var(--highlight-background);
  color: var(--highlight-foreground);
  forced-color-adjust: none;
  outline: none;
  padding: var(--spacing-1) var(--spacing-2);
  max-width: 150px;
  /* fixes FF gap */
  transform: translate3d(0, 0, 0);
  transition: transform 200ms, opacity 200ms;
  font: var(--font-size) system-ui;

  &[data-entering],
  &[data-exiting] {
    transform: var(--origin);
    opacity: 0;
  }

  &[data-placement=top] {
    margin-bottom: 10px;
    --origin: translateY(4px);
  }

  &[data-placement=bottom] {
    margin-top: 10px;
    --origin: translateY(-4px);
    & .react-aria-OverlayArrow svg {
      transform: rotate(180deg);
    }
  }

  &[data-placement=right] {
    margin-left: 10px;
    --origin: translateX(-4px);
    & .react-aria-OverlayArrow svg {
      transform: rotate(90deg);
    }
  }

  &[data-placement=left] {
    margin-right: 10px;
    --origin: translateX(4px);
    & .react-aria-OverlayArrow svg {
      transform: rotate(-90deg);
    }
  }

  .react-aria-OverlayArrow svg {
    display: block;
    fill: var(--highlight-background);
  }
}

```

## Tailwind example

```tsx
import {TooltipTrigger} from 'react-aria-components';
import {Tooltip} from 'tailwind-starter/Tooltip';
import {Button} from 'tailwind-starter/Button';
import {Edit} from 'lucide-react';

function Example(props) {
  return (
    <TooltipTrigger>
      <Button aria-label="Edit" variant="secondary">
        <Edit size={18} />
      </Button>
      {/*- begin highlight -*/}
      <Tooltip {...props}>
        Edit
      </Tooltip>
      {/*- end highlight -*/}
    </TooltipTrigger>
  );
}
```

### Tooltip.tsx

```tsx
'use client';
import React from 'react';
import {
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  OverlayArrow,
  composeRenderProps
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export interface TooltipProps extends Omit<AriaTooltipProps, 'children'> {
  children: React.ReactNode;
}

const styles = tv({
  base: 'group bg-neutral-700 dark:bg-neutral-600 border border-neutral-800 dark:border-white/10 font-sans text-xs text-white rounded-lg drop-shadow-lg will-change-transform px-3 py-1.5 box-border',
  variants: {
    isEntering: {
      true: 'animate-in fade-in placement-bottom:slide-in-from-top-0.5 placement-top:slide-in-from-bottom-0.5 placement-left:slide-in-from-right-0.5 placement-right:slide-in-from-left-0.5 ease-out duration-200'
    },
    isExiting: {
      true: 'animate-out fade-out placement-bottom:slide-out-to-top-0.5 placement-top:slide-out-to-bottom-0.5 placement-left:slide-out-to-right-0.5 placement-right:slide-out-to-left-0.5 ease-in duration-150'
    }
  }
});

export function Tooltip({ children, ...props }: TooltipProps) {
  return (
    <AriaTooltip {...props} offset={10} className={composeRenderProps(props.className, (className, renderProps) => styles({...renderProps, className}))}>
      <OverlayArrow>
        <svg width={8} height={8} viewBox="0 0 8 8" className="block fill-neutral-700 dark:fill-neutral-600 forced-colors:fill-[Canvas] stroke-neutral-800 dark:stroke-white/10 forced-colors:stroke-[ButtonBorder] group-placement-bottom:rotate-180 group-placement-left:-rotate-90 group-placement-right:rotate-90">
          <path d="M0 0 L4 4 L8 0" />
        </svg>
      </OverlayArrow>
      {children}
    </AriaTooltip>
  );
}

```

## Interactions

Tooltips appear after a "warmup" delay when hovering, or instantly on focus. Once a tooltip is displayed, other tooltips display immediately. If the user waits for the "cooldown period" before hovering another element, the warmup timer restarts.

```tsx
import {TooltipTrigger} from 'react-aria-components';
import {Tooltip} from 'vanilla-starter/Tooltip';
import {Button} from 'vanilla-starter/Button';
import {Edit} from 'lucide-react';
import {Save} from 'lucide-react';

function Example(props) {
  return (
    <div style={{display: 'flex', gap: 8}}>
      {/*- begin highlight -*/}
      <TooltipTrigger {...props}>
      {/*- end highlight -*/}
        <Button aria-label="Edit">
          <Edit size={18} />
        </Button>
        <Tooltip>
          Edit
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props}>
        <Button aria-label="Save">
          <Save size={18} />
        </Button>
        <Tooltip>
          Save
        </Tooltip>
      </TooltipTrigger>
    </div>
  );
}
```

<InlineAlert
  variant="notice"
  UNSAFE_style={{marginTop: '2rem'}}
>
  <Heading>Accessibility</Heading>
  <Content>Tooltips are not shown on touch screen interactions. Ensure that your UI is usable without tooltips, or use an alternative component such as a [Popover](Popover.md) to show information in an adjacent element.</Content>
</InlineAlert>

## Custom trigger

`TooltipTrigger` works with any focusable React Aria component (e.g. [Button](Button.md), [Link](Link.md), etc.). Use the `<Focusable>` component to wrap a custom trigger element such as a third party component or DOM element.

```tsx
"use client"
import {Focusable, TooltipTrigger} from 'react-aria-components';
import {Tooltip} from 'vanilla-starter/Tooltip';

<TooltipTrigger>
  {/*- begin highlight -*/}
  <Focusable>
    <span role="button">Custom trigger</span>
  </Focusable>
  {/*- end highlight -*/}
  <Tooltip>Tooltip</Tooltip>
</TooltipTrigger>
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>Any `<Focusable>` child must have an ARIA role or use an appropriate semantic HTML element so that screen readers can announce the tooltip. Trigger components must forward their `ref` and spread all props to a DOM element.</Content>
</InlineAlert>

```tsx
const CustomTrigger = React.forwardRef((props, ref) => (
  <button {...props} ref={ref} />
));
```

[DialogTrigger](Modal.md#custom-trigger) or [MenuTrigger](Menu.md#custom-trigger) with a `<Pressable>` trigger also works with `TooltipTrigger`. All `<Pressable>` elements are already focusable, so there's no need to wrap them in `<Focusable>`.

## A

PI

```tsx
<TooltipTrigger>
  <Button />
  <Tooltip>
    <OverlayArrow />
  </Tooltip>
</TooltipTrigger>
```

### Tooltip

Trigger

### Tooltip

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `arrowBoundaryOffset` | `number | undefined` | 0 | The minimum distance the arrow's edge should be from the edge of the overlay element. |
| `children` | `ChildrenOrFunction<TooltipRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<TooltipRenderProps> | undefined` | 'react-aria-Tooltip' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `containerPadding` | `number | undefined` | 12 | The placement padding that should be applied between the element and its surrounding container. |
| `crossOffset` | `number | undefined` | 0 | The additional offset applied along the cross axis between the element and its anchor element. |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `isEntering` | `boolean | undefined` | — | Whether the tooltip is currently performing an entry animation. |
| `isExiting` | `boolean | undefined` | — | Whether the tooltip is currently performing an exit animation. |
| `isOpen` | `boolean | undefined` | — | Whether the element is rendered. |
| `lang` | `string | undefined` | — |  |
| `offset` | `number | undefined` | 0 | The additional offset applied along the main axis between the element and its anchor element. |
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
| `placement` | `Placement | undefined` | 'top' | The placement of the tooltip with respect to the trigger. |
| `shouldFlip` | `boolean | undefined` | true | Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely. |
| `style` | `(React.CSSProperties | ((values: TooltipRenderProps & { defaultStyle: CSSProperties; }) => CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `triggerRef` | `RefObject<Element | null> | undefined` | — | The ref for the element which the tooltip positions itself with respect to. When used within a TooltipTrigger this is set automatically. It is only required when used standalone. |
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
