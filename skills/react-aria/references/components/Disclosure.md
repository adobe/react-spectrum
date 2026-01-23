# Disclosure

A disclosure is a collapsible section of content. It is composed of a a header with a heading and trigger button, and a panel that contains the content.

## Vanilla 

CSS example

```tsx
import {Disclosure, DisclosureHeader, DisclosurePanel} from 'vanilla-starter/Disclosure';

<Disclosure>
  <DisclosureHeader>System Requirements</DisclosureHeader>
  <DisclosurePanel>Details about system requirements here.</DisclosurePanel>
</Disclosure>
```

### Disclosure.tsx

```tsx
'use client';
import {
  Button,
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  DisclosureProps,
  DisclosurePanelProps,
  HeadingProps,
} from 'react-aria-components';
import {Heading} from './Content';
import {ChevronRight} from 'lucide-react';
import './Disclosure.css';

export function Disclosure(props: DisclosureProps) {
  return <AriaDisclosure {...props} />;
}

export function DisclosureHeader({children, ...props}: HeadingProps) {
  return (
    <Heading {...props}>
      <Button slot="trigger" className="disclosure-button">
        <ChevronRight size={16} />
        <span>{children}</span>
      </Button>
    </Heading>
  );
}

export function DisclosurePanel(props: DisclosurePanelProps) {
  return (
    <AriaDisclosurePanel {...props}>
      <div>{props.children}</div>
    </AriaDisclosurePanel>
  );
}

```

### Disclosure.css

```css
@import "./theme.css";

.react-aria-Disclosure {
  width: calc(var(--spacing) * 50);

  .react-aria-Heading {
    margin: 0;
  }

  .disclosure-button {
    background: none;
    border: none;
    box-shadow: none;
    text-shadow: none;
    width: 100%;
    color: var(--text-color);
    font: var(--font-size) system-ui;
    font-weight: 600;
    display: flex;
    align-items: center;
    text-align: start;
    gap: var(--spacing-1);
    padding: var(--spacing-2) var(--spacing-3);
    border-radius: var(--radius);
    transition: all 200ms;
    outline: none;
    -webkit-tap-highlight-color: transparent;

    &[data-hovered],
    &[data-pressed] {
      background: var(--gray-300);
      color: var(--text-color-hover)
    }

    &[data-pressed] {
      scale: 0.97;
    }

    &[data-focus-visible] {
      outline: 2px solid var(--focus-ring-color);
    }

    &[data-disabled] {
      color: var(--text-color-disabled);
    }

    svg {
      rotate: 0deg;
      transition: rotate 200ms;
      fill: none;
      stroke: currentColor;
      stroke-width: 3px;
    }
  }

  &[data-expanded] .disclosure-button svg {
    rotate: 90deg;
  }
}

.react-aria-DisclosurePanel {
  color: var(--text-color);
  height: var(--disclosure-panel-height);
  transition: height 250ms;
  overflow: clip;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  div {
    padding: var(--spacing-2) var(--spacing-4);
  }
}

```

## Tailwind example

```tsx
import {Disclosure, DisclosureHeader, DisclosurePanel} from 'tailwind-starter/Disclosure';

<Disclosure>
  <DisclosureHeader>Files</DisclosureHeader>
  <DisclosurePanel>Files content</DisclosurePanel>
</Disclosure>
```

### Disclosure.tsx

```tsx
'use client';
import React, { useContext } from "react";
import {
  Disclosure as AriaDisclosure,
  DisclosureProps as AriaDisclosureProps,
  DisclosurePanel as AriaDisclosurePanel,
  DisclosurePanelProps as AriaDisclosurePanelProps,
  composeRenderProps,
  Heading,
  DisclosureStateContext,
} from "react-aria-components";
import { Button } from './Button';
import { tv } from "tailwind-variants";
import { ChevronRight } from "lucide-react";
import { composeTailwindRenderProps } from "./utils";

const disclosure = tv({
  base: "group min-w-50 font-sans rounded-lg text-neutral-900 dark:text-neutral-200"
});

const chevron = tv({
  base: "w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ease-in-out",
  variants: {
    isExpanded: {
      true: "transform rotate-90",
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

export interface DisclosureProps extends AriaDisclosureProps {
  children: React.ReactNode;
}

export function Disclosure({ children, ...props }: DisclosureProps) {
  return (
    <AriaDisclosure
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) => disclosure({ ...renderProps, className }))}
    >
      {children}
    </AriaDisclosure>
  );
}

export interface DisclosureHeaderProps {
  children: React.ReactNode;
}

export function DisclosureHeader({ children }: DisclosureHeaderProps) {
  let { isExpanded } = useContext(DisclosureStateContext)!;
  return (
    <Heading className="text-lg font-semibold m-0">
      <Button
        slot="trigger"
        variant="quiet"
        className="w-full justify-start font-medium">
        {({isDisabled}) => (
          <>
            <ChevronRight aria-hidden className={chevron({ isExpanded, isDisabled })} />
            <span>{children}</span>
          </>
        )}
      </Button>
    </Heading>
  );
}

export interface DisclosurePanelProps extends AriaDisclosurePanelProps {
  children: React.ReactNode;
}

export function DisclosurePanel({ children, ...props }: DisclosurePanelProps) {
  return (
    <AriaDisclosurePanel {...props} className={composeTailwindRenderProps(props.className, 'h-(--disclosure-panel-height) motion-safe:transition-[height] overflow-clip')}>
      <div className="px-4 py-2">{children}</div>
    </AriaDisclosurePanel>
  );
}

```

## Expanding

Use the `isExpanded` or `defaultExpanded` prop to set the expanded state, and `onExpandedChange` to handle user interactions.

```tsx
import {Disclosure, DisclosureHeader, DisclosurePanel} from 'vanilla-starter/Disclosure';
import {useState} from 'react';

function Example() {
  let [isExpanded, setIsExpanded] = useState(true);

  return (
    <Disclosure
      /*- begin highlight -*/
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}>
      {/*- end highlight -*/}
      <DisclosureHeader>Download, Install, and Set Up</DisclosureHeader>
      <DisclosurePanel>Instructions on how to download, install, and set up</DisclosurePanel>
    </Disclosure>
  );
}
```

## Content

Add interactive elements such as buttons adjacent to the disclosure heading by wrapping them in a `<div>`. `<Heading>` and `<Button>` must not have interactive children.

```tsx
import {Disclosure, DisclosureHeader, DisclosurePanel} from 'vanilla-starter/Disclosure';
import {Button} from 'vanilla-starter/Button';
import {Settings} from 'lucide-react';

<Disclosure style={{width: 200}}>
  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
    {/*- begin highlight -*/}
    <DisclosureHeader style={{flex: 1}}>Files</DisclosureHeader>
    <Button aria-label="Settings"><Settings /></Button>
    {/*- end highlight -*/}
  </div>
  <DisclosurePanel>Files content</DisclosurePanel>
</Disclosure>
```

## A

PI

```tsx
<Disclosure>
  <Heading>
    <Button slot="trigger" />
  </Heading>
  <DisclosurePanel />
</Disclosure>
```

### Disclosure

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<DisclosureRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<DisclosureRenderProps> | undefined` | 'react-aria-Disclosure' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultExpanded` | `boolean | undefined` | — | Whether the disclosure is expanded by default (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `Key | undefined` | — | An id for the disclosure when used within a DisclosureGroup, matching the id used in `expandedKeys`. |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the disclosure is disabled. |
| `isExpanded` | `boolean | undefined` | — | Whether the disclosure is expanded (controlled). |
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
| `onExpandedChange` | `((isExpanded: boolean) => void) | undefined` | — | Handler that is called when the disclosure's expanded state changes. |
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
| `style` | `(React.CSSProperties | ((values: DisclosureRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Disclosure

Panel

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `React.ReactNode` | — | The children of the component. |
| `className` | `ClassNameOrFunction<DisclosurePanelRenderProps> | undefined` | 'react-aria-DisclosurePanel' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `label` | `React.ReactNode` | — | The content to display as the label. |
| `labelElementType` | `React.ElementType | undefined` | 'label' | The HTML element used to render the label, e.g. 'label', or 'span'. |
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
| `role` | `"group" | "region" | undefined` | 'group' | The accessibility role for the disclosure's panel. |
| `style` | `(React.CSSProperties | ((values: DisclosurePanelRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
